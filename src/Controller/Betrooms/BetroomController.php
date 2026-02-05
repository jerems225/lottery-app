<?php

namespace App\Controller\Betrooms;

use ApiPlatform\Core\Annotation\ApiResource;
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


 #[ApiResource(collectionOperations: [], itemOperations: ["get","/loadwinners"])]
class BetroomController extends AbstractController
{
    public function __construct(private Environment $twig,private  betroomService $betroomService,private  ticketService $ticketService,
    private  walletService $walletService, private RoomSettingsRepository $roomSettingsRepository, private UserService $userService)
    {
    }

    #[Route('/private-rooms',name:'betrooms')]
    public function Betroom() : Response
    {
        
        $roomSettings = $this->roomSettingsRepository->findAll()[0];
        $roomStatus = $roomSettings->getStatus();
        
        if($roomStatus  == "closed")
        {
            //get current winners by closed time
            $logger = $this->getUser();
            if($logger)
            {
                $user = $this->userService->getUserByEmail($logger->getUserIdentifier())[0];
                $current_winners = $this->betroomService->getCurrentWinners($roomSettings->getClosedAt(), $user);
                if($current_winners)
                {
                    $this->addFlash("winner", "💥🎉🎉💥💥💥Vous etes un heureux gagnant d'une ou plusieurs salle de tirages !!");
                }
            }
        }
        return new Response($this->twig->render('./betroom/private-rooms.html.twig',[
            'betrooms' => $this->betroomService->allBetRoom(),
            'closedAt' => date_format($roomSettings->getClosedAt(),"Y/m/d H:i:s"),
            'openAt' => date_format($roomSettings->getOpenAt(),"Y/m/d H:i:s"),
            'status' => $roomSettings->getStatus()
        ]));
    }

    #[Route('/rooms/buy-tickets/{reference}',name:'betrooms.tickets')]
    public function Tickets(Betroom $betroom, Request $request) : Response
    {
        //need login
        $logger = $this->getUser();
         
        $roomSettings = $this->roomSettingsRepository->findAll()[0];
        if(!$logger)
        {
            return $this->redirectToRoute('app_login');
        }
        elseif(!$logger->isIsValidated())
        {
            return $this->redirectToRoute('betrooms');
        }

        if($roomSettings->getStatus() == "closed")
        {
            return $this->redirectToRoute('betrooms');
        }

        return new Response($this->twig->render('./betroom/ticket.html.twig',[
            'betroom' => $betroom,
            'tickets' => $this->ticketService->getTicketsByBetRoomAndStatus("pending",$betroom->getId())
        ]));
    }

    #[Route('/rooms/buy-tickets/choose/{reference}',name:'betrooms.tickets.selection')]
    /**
     * 
     *
     * @param Ticket $ticket
     * @param Request $request
     * @param String $reference
     * @return Response
     */
    public function AddTicket(Ticket $ticket) : Response
    {
        //need login
        $betroom = $ticket->getBetroom();
         
        $roomSettings = $this->roomSettingsRepository->findAll()[0];
        $logger = $this->getUser();
        if(!$logger)
        {
            return $this->redirectToRoute('app_login');
        }
        elseif(!$logger->isIsValidated())
        {
            return $this->redirectToRoute('betrooms');
        }
        
        if($roomSettings->getStatus() == "closed")
        {
            return $this->redirectToRoute('betrooms');
        }

        $resultPaymentTicket = $this->walletService->TicketPayment($logger,$betroom);
        if($resultPaymentTicket['status'])
        {
            $ticket->setUser($logger);
            $ticket->setUpdatedAt(new \DateTimeImmutable());

            $this->ticketService->saveTicket($ticket);

            $betroom->setBuyTicket($betroom->getBuyTicket() + 1);
            $this->betroomService->saveBetRoom($betroom);
            $this->addFlash('ticket','Merci d\'avoir pris part au tirage de la salle '.$betroom->getNumBetroom().', rendez-vous en fin de journée pour les résultats. Augmentez vos chances en prenant un autre ticket!');

            return $this->redirectToRoute('betrooms');
        }
        else
        {
            $this->addFlash("user.getTicket",$resultPaymentTicket['message']);
            return $this->redirectToRoute('betrooms.tickets',[
                'reference' => $betroom->getReference()
            ]);
        }

    }


    #[Route('/load-winners', name:'load.winner')]
    public function loadWinner() : Response
    {
        $this->betroomService->loadWinners();

        return $this->redirectToRoute('app_login');
    }

    #[Route('/create-tickets', name:'create.tickets')]
    public function createTickets() : Response
    {
        $this->ticketService->createTicket();

        return $this->redirectToRoute('app_login');
    }

    #[Route('/remove-unselected-tickets', name:'remove.unselect.tickets')]
    public function removeUnselectTickets() : Response
    {
        //remove pending tickets for this betroom
        $this->ticketService->removeUnSelectedTickets();

        return $this->redirectToRoute('app_login');
    }

    #[Route('/rooms/room-winner/{reference}',name:'betrooms.winner')]
    public function Winner(Betroom $betroom) : Response
    {
        $winner = null;
        $roomSettings = $this->roomSettingsRepository->findAll()[0];
        if($roomSettings->getStatus() == "closed" || "sold out")
        {
            $winner = $this->betroomService->getTicketWinner($betroom);
        }
        else
        {
            return $this->redirectToRoute('betrooms');
        }

        return new Response($this->twig->render('./betroom/winner.html.twig',[
            'betroom' => $betroom,
            'winner' => $winner
        ])); 
    }


}