<?php

namespace App\Services\Betrooms;

use App\Entity\Betroom;
use App\Entity\Ticket;
use App\Entity\User;
use App\Repository\BetroomRepository;
use App\Repository\TicketRepository;
use DateTime;
use DateTimeImmutable;

class ticketService
{
    public function __construct(private TicketRepository $ticketRepository, private BetroomRepository $betroomRepository)
    {
    }

    public function saveTicket(Ticket $ticket): void
    {
        if ($ticket instanceof Ticket) {
            $this->ticketRepository->save($ticket, true);
        }
    }

    public function getTicketsByBetRoomAndStatus(string $status, int $id)
    {
        return $this->ticketRepository->findByStatusAndUser($status, $id, 0);
    }

    public function getAllResultsDate(): array
    {
        $tickets = $this->ticketRepository->findByStatusAndWinner("winner");
        $resultats_date = [];
        foreach ($tickets as $ticket) {
            array_push($resultats_date, $ticket->getUpdatedAt()->format('d M Y'));
        }

        return $resultats_date;
    }

    public function getWinners(string $date): array
    {
        $tickets = $this->ticketRepository->findByStatusAndWinner("winner");
        $winners = [];

        foreach ($tickets as $ticket) {
            if ($ticket->getUpdatedAt()->format('d M Y') == $date && null != $ticket->getUser()) {
                array_push($winners, $ticket);
            }
        }

        // dd($winners);

        return $winners;
    }

    /**
     * Generate Ticket REFERENCE ID
     *
     * @param integer $_limit
     * @return string
     */
    public function generateTicketId(int $_limit): string
    {
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        do {
            for ($i = 0; $i < $_limit; $i++) {
                $index = rand(0, strlen($characters) - 1);
                $randomString .= $characters[$index];
            }

            $ticket = $this->ticketRepository->findByReference($randomString);

        } while ($ticket);

        return "CB-" . $randomString;
    }

    public function createTicket(?Betroom $betroom = null): void
    {
        if ($betroom) {
            $betrooms = [$betroom];
        } else {
            $betrooms = $this->betroomRepository->findAll();
        }

        foreach ($betrooms as $betroom) {
            $maxTicket = $betroom->getMaxTicket();
            $i = 0;
            while ($i < $maxTicket) {
                $ticket = new Ticket();
                $ticket->setReference(uniqid());
                $ticket->setPrice($betroom->getTicketPrice());
                $ticket->setBetroom($betroom);
                $ticket->setNumTicket($this->generateTicketId(3));
                $ticket->setStatus("pending");
                $ticket->setCreatedAt(new \DateTimeImmutable());

                $this->ticketRepository->save($ticket, true);
                $i++;
            }
        }
    }

    public function removeTicket(Ticket $ticket)
    {
        if ($ticket instanceof Ticket) {
            $this->ticketRepository->remove($ticket, true);
        }
    }

    public function getTicketsByUser(): array
    {
        $tickets = $this->ticketRepository->findAll();
        $tickets_buy = [];
        foreach ($tickets as $ticket) {
            if ($ticket->getUser()) {
                array_push($tickets_buy, $ticket);
            }
        }

        return $tickets_buy;
    }

    public function getTicketsByStatus(string $status): array
    {
        return $this->ticketRepository->findByStatusAndWinner($status);
    }

    public function getTicketsByStatusAndDate(string $status, DateTimeImmutable $winAt, User $user): array
    {
        return $this->ticketRepository->findByStatusAndDate($status, $winAt, $user);
    }

    public function getTicketsByUserWinner(User $user, string $status): array|null
    {
        return $this->ticketRepository->findByStatusAndUserWinner($user->getId(), $status);
    }

    public function removeUnSelectedTickets(): void
    {
        $tickets = $this->ticketRepository->findAll();
        foreach ($tickets as $ticket) {
            if (null == $ticket->getUser() && $ticket->getStatus() != "pending") {
                $this->removeTicket($ticket);
            }
        }
    }

    public function hasTicketInRoom(User $user, Betroom $room): bool
    {
        $tickets = $this->ticketRepository->findByUserAndBetroom($user->getId(), $room->getId());
        return count($tickets) > 0;
    }
}