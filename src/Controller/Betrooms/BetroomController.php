<?php

namespace App\Controller\Betrooms;

use App\Entity\Betroom;
use App\Entity\Ticket;
use App\Form\TicketType;
use App\Repository\RoomSettingsRepository;
use App\Services\Betrooms\betroomService;
use App\Services\Betrooms\ticketService;
use App\Services\Users\UserService;
use App\Services\Wallets\walletService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;


class BetroomController extends AbstractController
{
    public function __construct(
        private Environment $twig,
        private betroomService $betroomService,
        private ticketService $ticketService,
        private walletService $walletService,
        private RoomSettingsRepository $roomSettingsRepository,
        private UserService $userService
    ) {
    }

    #[Route('/private-rooms', name: 'betrooms')]
    public function Betroom(): Response
    {

        $settings = $this->roomSettingsRepository->findAll();
        if (empty($settings)) {
            return new Response("Room settings not initialized.");
        }
        $roomSettings = $settings[0];
        $roomStatus = $roomSettings->getStatus();

        if ($roomStatus == "closed") {
            //get current winners by closed time
            $logger = $this->getUser();
            if ($logger) {
                $user = $this->userService->getUserByEmail($logger->getUserIdentifier())[0];
                $current_winners = $this->betroomService->getCurrentWinners($roomSettings->getClosedAt(), $user);
                if ($current_winners) {
                    $this->addFlash("winner", "💥🎉🎉💥💥💥Vous etes un heureux gagnant d'une ou plusieurs salle de tirages !!");
                }
            }
        }
        return new Response($this->twig->render('./betroom/private-rooms.html.twig', [
            'betrooms' => $this->betroomService->allBetRoom(),
            'closedAt' => date_format($roomSettings->getClosedAt(), "Y/m/d H:i:s"),
            'openAt' => date_format($roomSettings->getOpenAt(), "Y/m/d H:i:s"),
            'status' => $roomSettings->getStatus()
        ]));
    }

    #[Route('/rooms/buy-tickets/{reference}', name: 'betrooms.tickets')]
    public function Tickets(Betroom $betroom, Request $request): Response
    {
        //need login
        $settings = $this->roomSettingsRepository->findAll();
        if (empty($settings)) {
            return $this->redirectToRoute('betrooms');
        }
        $roomSettings = $settings[0];

        /** @var \App\Entity\User $logger */
        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        } elseif (!$logger->isIsValidated()) {
            return $this->redirectToRoute('betrooms');
        }

        if ($roomSettings->getStatus() == "closed") {
            return $this->redirectToRoute('betrooms');
        }

        return new Response($this->twig->render('./betroom/ticket.html.twig', [
            'betroom' => $betroom,
            'tickets' => $this->ticketService->getTicketsByBetRoomAndStatus("pending", $betroom->getId())
        ]));
    }

    #[Route('/rooms/buy-tickets/choose/{reference}', name: 'betrooms.tickets.selection')]
    /**
     * 
     *
     * @param Ticket $ticket
     * @param Request $request
     * @param string $reference
     * @return Response
     */
    public function AddTicket(Ticket $ticket): Response
    {
        //need login
        $betroom = $ticket->getBetroom();

        $settings = $this->roomSettingsRepository->findAll();
        if (empty($settings)) {
            return $this->redirectToRoute('betrooms');
        }
        $roomSettings = $settings[0];
        /** @var \App\Entity\User $logger */
        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        } elseif (!$logger->isIsValidated()) {
            return $this->redirectToRoute('betrooms');
        }

        if ($roomSettings->getStatus() == "closed" && !$betroom->isIsPrivate()) {
            return $this->redirectToRoute('betrooms');
        }

        // Security: One entry per private room
        if ($betroom->isIsPrivate() && $this->ticketService->hasTicketInRoom($logger, $betroom)) {
            $this->addFlash('ticket', 'Vous avez déjà un ticket dans cette salle privée.');
            return $this->redirectToRoute('betrooms');
        }

        $resultPaymentTicket = $this->walletService->TicketPayment($logger, $betroom, $this->userService);
        if ($resultPaymentTicket['status']) {
            $ticket->setUser($logger);
            $ticket->setUpdatedAt(new \DateTimeImmutable());

            $this->ticketService->saveTicket($ticket);

            $betroom->setBuyTicket($betroom->getBuyTicket() + 1);
            $this->betroomService->saveBetRoom($betroom);

            // Automatic draw for private rooms
            if ($betroom->isIsPrivate() && $betroom->getBuyTicket() >= $betroom->getMinParticipants()) {
                $betroom->setStatus('sold out');
                $this->betroomService->saveBetRoom($betroom);
                $this->betroomService->loadWinner($betroom);
                $this->addFlash('ticket', 'Le tirage de la salle ' . $betroom->getNumBetroom() . ' a été effectué !');
            } else {
                $this->addFlash('ticket', 'Merci d\'avoir pris part au tirage de la salle ' . $betroom->getNumBetroom() . ', rendez-vous en fin de journée pour les résultats. Augmentez vos chances en prenant un autre ticket!');
            }

            return $this->redirectToRoute('betrooms');
        } else {
            $this->addFlash("user.getTicket", $resultPaymentTicket['message']);
            return $this->redirectToRoute('betrooms.tickets', [
                'reference' => $betroom->getReference()
            ]);
        }
    }

    #[Route('/rooms/create-private', name: 'betrooms.create_private', methods: ['POST'])]
    public function CreatePrivateRoom(Request $request): Response
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->redirectToRoute('app_login');
        }

        $balance = $user->getWallet()->getBalance();
        if ($balance < 10) {
            $this->addFlash('error', 'Vous devez avoir au moins 10 $ pour créer une salle.');
            return $this->redirectToRoute('betrooms');
        }

        $betAmount = (float) $request->request->get('bet_amount');
        $minParticipants = (int) $request->request->get('min_participants');

        if ($minParticipants < 2) {
            $this->addFlash('error', 'Le nombre minimum de participants doit être supérieur ou égal à 2.');
            return $this->redirectToRoute('betrooms');
        }

        $room = $this->betroomService->createPrivateRoom($user, $betAmount, $minParticipants);

        // Create initial tickets for this room
        $this->ticketService->createTicket($room);

        $this->addFlash('success', 'Salle privée créée avec succès !');
        return $this->redirectToRoute('betrooms');
    }


    #[Route('/load-winners', name: 'load.winner')]
    public function loadWinner(): Response
    {
        $this->betroomService->loadWinners();

        return $this->redirectToRoute('app_login');
    }

    #[Route('/create-tickets', name: 'create.tickets')]
    public function createTickets(): Response
    {
        $this->ticketService->createTicket();

        return $this->redirectToRoute('app_login');
    }

    #[Route('/remove-unselected-tickets', name: 'remove.unselect.tickets')]
    public function removeUnselectTickets(): Response
    {
        //remove pending tickets for this betroom
        $this->ticketService->removeUnSelectedTickets();

        return $this->redirectToRoute('app_login');
    }

    #[Route('/rooms/room-winner/{reference}', name: 'betrooms.winner')]
    public function Winner(Betroom $betroom): Response
    {
        $winner = null;
        $settings = $this->roomSettingsRepository->findAll();
        if (empty($settings)) {
            return $this->redirectToRoute('betrooms');
        }
        $roomSettings = $settings[0];
        if ($roomSettings->getStatus() == "closed" || "sold out") {
            $winner = $this->betroomService->getTicketWinner($betroom);
        } else {
            return $this->redirectToRoute('betrooms');
        }

        return new Response($this->twig->render('./betroom/winner.html.twig', [
            'betroom' => $betroom,
            'winner' => $winner
        ]));
    }


}