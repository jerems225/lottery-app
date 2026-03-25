export type User = {
    id: string;
    email: string;
    name: string;
    walletBalance: number;
    referralCode: string;
    referrerCode?: string;
    isValidated: boolean;
};

export type RoomStatus = 'open' | 'closed' | 'sold out';

export type Room = {
    id: string;
    reference: string;
    numRoom: string;
    createdBy: string; // UserId
    isPrivate: boolean;
    ticketPrice: number;
    minParticipants: number;
    buyTickets: number;
    status: RoomStatus;
    winnerUserId?: string;
    createdAt: string;
    awards?: number; // Total prize money for the winner
};

export type Ticket = {
    id: string;
    roomId: string;
    userId: string;
    status: 'pending' | 'winner' | 'loser';
    createdAt: string;
};

export type Transaction = {
    id: string;
    userId: string;
    amount: number;
    type: 'deposit' | 'bet' | 'win' | 'referral_commission' | 'creator_share';
    description: string;
    createdAt: string;
};
