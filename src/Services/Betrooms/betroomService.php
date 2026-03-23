<?php

namespace App\Services\Betrooms;

use App\Entity\Betroom;
use App\Entity\Ticket;
use App\Entity\User;
use App\Repository\BetroomRepository;
use App\Repository\RoomSettingsRepository;
use App\Repository\TicketRepository;
use App\Services\Emails\sendemailService;
use App\Services\Users\UserService;
use App\Services\Wallets\walletService;
use DateTimeImmutable;
use DateTimeZone;

class betroomService
{
    public function __construct(
        private BetroomRepository $betroomRepository,
        private TicketRepository $ticketRepository,
        private ticketService $ticketService,
        private walletService $walletService,
        private sendemailService $sendemailService,
        private UserService $userService,
        private RoomSettingsRepository $roomSettingsRepository
    ) {
    }

    /**
     * save betroom
     *
     * @param Betroom $betroom
     * @return void
     */
    public function saveBetRoom(Betroom $betroom): void
    {
        if ($betroom instanceof Betroom) {
            if ($betroom->getCreatedAt() === null) {
                $betroom->setCreatedAt(new \DateTimeImmutable());
            }
            $betroom->setUpdatedAt(new \DateTimeImmutable());
            $this->betroomRepository->save($betroom, true);
        }
    }

    /**
     * Create a private room
     */
    public function createPrivateRoom(User $user, float $betAmount, int $minParticipants): Betroom
    {
        $betroom = new Betroom();
        $betroom->setIsPrivate(true);
        $betroom->setCreatedBy($user);
        $betroom->setTicketPrice($betAmount);
        $betroom->setMinParticipants($minParticipants);
        $betroom->setMaxTicket($minParticipants); // For private rooms, max tickets = min participants
        $betroom->setBuyTicket(0);
        $betroom->setStatus('open');
        $betroom->setReference(uniqid('PRIV-'));
        $betroom->setNumBetroom(strval(rand(1000, 9999)));
        $betroom->setAwards($betAmount * $minParticipants * 0.75); // Potential winner reward

        $this->saveBetRoom($betroom);

        return $betroom;
    }

    /**
     * remove betroom
     *
     * @param Betroom $betroom
     * @return void
     */
    public function removeBetRoom(Betroom $betroom): void
    {
        if ($betroom instanceof Betroom) {
            $tickets = $betroom->getTickets();
            foreach ($tickets as $ticket) {
                $this->ticketService->removeTicket($ticket);
            }
            $this->betroomRepository->remove($betroom, true);
        }
    }

    /**
     * set all ticket status
     *
     * @param Betroom $betroom
     * @return void
     */
    private function setTicketStatus(Betroom $betroom)
    {
        if ($betroom instanceof Betroom) {
            $tickets = $this->ticketRepository->findByStatus("pending", $betroom->getId());
            foreach ($tickets as $ticket) {
                $ticket->setStatus("loser");
                $ticket->setUpdatedAt(new \DateTimeImmutable());
                $this->ticketRepository->save($ticket, true);
            }
        }
    }

    /**
     * get tickets buy by betroom
     *
     * @param array $betrooms
     * @return array
     */
    private function currentBetRoomTickets(array $betrooms): array
    {
        $current_tickets = [];
        foreach ($betrooms as $betroom) {
            $tickets = $betroom->getTickets();
            foreach ($tickets as $ticket) {
                if ($ticket->getStatus() == "pending") {
                    array_push($current_tickets, $ticket);
                }
            }
        }

        return $current_tickets;
    }

    /**
     * load winner ticket by betroom
     *
     * @param Betroom $betroom
     * @return void
     */
    public function loadWinner(Betroom $betroom): void
    {
        $roomSettings = $this->roomSettingsRepository->findAll()[0];
        if ($betroom instanceof Betroom) {
            $tickets = $this->ticketRepository->findByStatus("pending", $betroom->getId());
            if (!empty($tickets)) {
                $winner = null;
                $index = rand(0, count($tickets) - 1);
                $winner = $tickets[$index];
                $winner->setStatus("winner");
                $winner->setUpdatedAt(new \DateTimeImmutable());
                $winner->setWinAt($roomSettings->getClosedAt());

                $this->ticketRepository->save($winner, true);

                //set tickets status
                $this->setTicketStatus($betroom);

                //set betroom buyTicket
                $betroom->setBuyTicket(0);
                $this->saveBetRoom($betroom);

                if (null !== $winner->getUser()) {
                    $user_wallet = $winner->getUser()->getWallet();

                    if ($betroom->isIsPrivate()) {
                        $totalPot = $betroom->getTicketPrice() * count($tickets);
                        $winnerShare = $totalPot * 0.75;
                        $creatorShare = $totalPot * 0.05;

                        $user_wallet->setBalance($user_wallet->getBalance() + $winnerShare);
                        $this->walletService->saveWallet($user_wallet);

                        if ($betroom->getCreatedBy()) {
                            $creatorWallet = $betroom->getCreatedBy()->getWallet();
                            $creatorWallet->setBalance($creatorWallet->getBalance() + $creatorShare);
                            $this->walletService->saveWallet($creatorWallet);
                        }

                        // Set awards for logging/display
                        $betroom->setAwards($winnerShare);
                    } else {
                        $user_wallet->setBalance($user_wallet->getBalance() + $winner->getBetroom()->getAwards() + $user_wallet->getBonus());
                        $this->walletService->saveWallet($user_wallet);

                        $referrer_code = $winner->getUser()->getReferrer();
                        //get users by referralCode
                        if ($referrer_code) {
                            $user = $this->userService->getUserByReferralCode($referrer_code);
                            //if user exist set his balance by 10% of ticket betroom awards
                            if (count($user) > 0) {
                                $referrer = $user[0];
                                $referrer_wallet = $referrer->getWallet();
                                $referrer_percent = ($winner->getBetroom()->getAwards() * 10) / 100;
                                $referrer_wallet->setBalance($referrer->getWallet()->getBalance() + $referrer_percent);
                                $this->walletService->saveWallet($referrer_wallet);

                                $user_wallet->setBalance($user_wallet->getBalance() - $referrer_percent);
                                $this->walletService->saveWallet($user_wallet);

                                //sendFeeback
                                $message = "Vous êtes l'heureux parrain du gagnant de la salle de tirages " . $winner->getBetroom()->getNumBetroom() . " parmis tant d'autres, FELICITATIONS 🎉🎉🎉. Vous gagnez la somme de " . $referrer_percent . " \$USD";
                                $action = "PARRAIN DU GAGNANT DU JOUR - " . $winner->getBetroom()->getNumBetroom();
                                $this->sendemailService->sendFeedBack($referrer, $message, $action);
                            }
                        }
                    }

                    //sendFeeback
                    $message = "Vous êtes l'heureux gagnant de la salle de tirages " . $winner->getBetroom()->getNumBetroom() . " parmis tant d'autres, FELICITATIONS 🎉🎉🎉🎉 ";
                    $action = "GAGNANT DU JOUR - " . $winner->getBetroom()->getNumBetroom();
                    $this->sendemailService->sendFeedBack($winner->getUser(), $message, $action);
                }
            }
        }

    }

    public function loadWinners()
    {
        $betrooms = $this->allBetRoom();
        foreach ($betrooms as $betroom) {
            $this->loadWinner($betroom);
        }
    }

    /**
     * get all betrooms
     *
     * @return array
     */
    public function allBetRoom(): array
    {
        $betrooms = $this->betroomRepository->findAll();
        $this->currentBetRoomTickets($betrooms);

        return $betrooms;
    }

    /**
     * get winner ticket by betroom
     *
     * @param Betroom $betroom
     * @return object|null
     */
    public function getTicketWinner(Betroom $betroom): object|null
    {
        if ($betroom instanceof Betroom) {
            $tickets = $betroom->getTickets();
            foreach ($tickets as $ticket) {
                if ($ticket->getStatus() == "winner" && $ticket->getUpdatedAt() && $betroom->getUpdatedAt() && $ticket->getUpdatedAt()->format('Y-m-d H') == $betroom->getUpdatedAt()->format('Y-m-d H') && null != $ticket->getUser()) {
                    return $ticket;
                }
            }
        }
        return null;
    }


    public function getCurrentWinners(DateTimeImmutable $winAt, User $user): array
    {
        $tickets = $this->ticketService->getTicketsByStatusAndDate("winner", $winAt, $user);

        return $tickets;
    }

    public function getBetroomByReference(string $reference): ?Betroom
    {
        return $this->betroomRepository->findOneBy(['reference' => $reference]);
    }
}