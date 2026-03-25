import { User, Room, Ticket, Transaction } from "../types";
import { nanoid } from "nanoid";

// Mock data storage for the demo
// In a real app, this would be a database like PostgreSQL or SQLite
let users: User[] = [
    {
        id: "user_1",
        email: "john@example.com",
        name: "John Doe",
        walletBalance: 235000,
        referralCode: "REF123",
        isValidated: true,
    },
    {
        id: "user_2",
        email: "creator@example.com",
        name: "Room Creator",
        walletBalance: 15.0,
        referralCode: "CREATOR_REF",
        isValidated: true,
    },
];

let rooms: Room[] = [
    {
        id: "room_1",
        reference: "GOLD-001",
        numRoom: "1234",
        createdBy: "admin",
        isPrivate: false,
        ticketPrice: 80,
        minParticipants: 1000,
        buyTickets: 85412,
        status: "open",
        createdAt: new Date().toISOString(),
    },
];

let tickets: Ticket[] = [];
let transactions: Transaction[] = [];

export const lotteryService = {
    // --- USER METHODS ---
    getUser: (id: string) => users.find((u) => u.id === id),

    // --- ROOM METHODS ---
    getRooms: () => rooms,

    createPrivateRoom: (userId: string, betAmount: number, minParticipants: number) => {
        const user = users.find((u) => u.id === userId);
        if (!user) throw new Error("User not found");
        if (user.walletBalance < 10) throw new Error("Insufficient balance to create room");
        if (minParticipants < 2) throw new Error("Min participants must be at least 2");

        const newRoom: Room = {
            id: nanoid(),
            reference: `PRIV-${nanoid(6).toUpperCase()}`,
            numRoom: Math.floor(1000 + Math.random() * 9000).toString(),
            createdBy: userId,
            isPrivate: true,
            ticketPrice: betAmount,
            minParticipants: minParticipants,
            buyTickets: 0,
            status: "open",
            createdAt: new Date().toISOString(),
        };

        rooms.push(newRoom);
        return newRoom;
    },

    joinRoom: (userId: string, roomId: string) => {
        const user = users.find((u) => u.id === userId);
        const room = rooms.find((r) => r.id === roomId);

        if (!user || !room) throw new Error("User or Room not found");
        if (user.walletBalance < room.ticketPrice) throw new Error("Insufficient balance");
        if (room.status !== "open") throw new Error("Room is closed");

        // Check if user already in room if it's private
        if (room.isPrivate) {
            const existingTicket = tickets.find((t) => t.roomId === roomId && t.userId === userId);
            if (existingTicket) throw new Error("Already joined this private room");
        }

        // Process payment
        user.walletBalance -= room.ticketPrice;

        // Process Affiliation Commission (2% of bet)
        if (user.referrerCode) {
            const referrer = users.find((u) => u.referralCode === user.referrerCode);
            if (referrer && referrer.id !== user.id) {
                const commission = room.ticketPrice * 0.02;
                referrer.walletBalance += commission;
                transactions.push({
                    id: nanoid(),
                    userId: referrer.id,
                    amount: commission,
                    type: "referral_commission",
                    description: `Commission for bet from ${user.name} in room ${room.numRoom}`,
                    createdAt: new Date().toISOString(),
                });
            }
        }

        // Create ticket
        const ticket: Ticket = {
            id: nanoid(),
            roomId: roomId,
            userId: userId,
            status: "pending",
            createdAt: new Date().toISOString(),
        };
        tickets.push(ticket);
        room.buyTickets += 1;

        // Check if min participants reached for private rooms
        if (room.isPrivate && room.buyTickets >= room.minParticipants) {
            lotteryService.drawWinner(roomId);
        }

        return ticket;
    },

    drawWinner: (roomId: string) => {
        const room = rooms.find((r) => r.id === roomId);
        if (!room) throw new Error("Room not found");

        const pendingTickets = tickets.filter((t) => t.roomId === roomId);
        if (pendingTickets.length === 0) return;

        // Random Draw
        const winnerTicket = pendingTickets[Math.floor(Math.random() * pendingTickets.length)];
        winnerTicket.status = "winner";
        room.winnerUserId = winnerTicket.userId;
        room.status = "sold out";

        // Mark others as losers
        pendingTickets.forEach((t) => {
            if (t.id !== winnerTicket.id) t.status = "loser";
        });

        // Payout Calculation
        const totalPot = room.ticketPrice * pendingTickets.length;
        const winnerShare = totalPot * 0.75;
        const creatorShare = totalPot * 0.05;

        // Pay winner
        const winner = users.find((u) => u.id === winnerTicket.userId);
        if (winner) {
            winner.walletBalance += winnerShare;
            transactions.push({
                id: nanoid(),
                userId: winner.id,
                amount: winnerShare,
                type: "win",
                description: `Winnings for room ${room.numRoom}`,
                createdAt: new Date().toISOString(),
            });
        }

        // Pay creator (if private)
        if (room.isPrivate) {
            const creator = users.find((u) => u.id === room.createdBy);
            if (creator) {
                creator.walletBalance += creatorShare;
                transactions.push({
                    id: nanoid(),
                    userId: creator.id,
                    amount: creatorShare,
                    type: "creator_share",
                    description: `Creator share for room ${room.numRoom}`,
                    createdAt: new Date().toISOString(),
                });
            }
        }

        room.awards = winnerShare;
        return winnerTicket;
    },
};
