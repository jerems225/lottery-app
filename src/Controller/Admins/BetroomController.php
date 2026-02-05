<?php

namespace App\Controller\Admins;

use App\Entity\Betroom;
use App\Entity\Ticket;
use App\Form\AddBetroomType;
use App\Form\ResultatDateType;
use App\Repository\RoomSettingsRepository;
use App\Services\Betrooms\betroomService;
use App\Services\Betrooms\ticketService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;

class BetroomController extends AbstractController
{
    public function __construct(private Environment $twig,private betroomService $betroomService,private ticketService $ticketService,
    private RoomSettingsRepository $roomSettingsRepository)
    {
    }

    #[Route('/admins/salles-de-tirage', name:'admins.betrooms')]
    public function Betroom(Request $request) : Response
    {
        $logger = $this->getUser();
        if(!$logger)
        {
            return $this->redirectToRoute('app_login');
        }
        elseif($logger->getRoles()[0] != "ROLE_ADMIN" && $logger->getRoles()[0] !="ROLE_SUPERADMIN")
        {
            return $this->redirectToRoute('index');
        }
        
        $betroom = new Betroom();
        $form = $this->createForm(AddBetroomType::class,$betroom);
        $form->handleRequest($request);
        if($form->isSubmitted() && $form->isValid())
        {
            $betroom->setReference(uniqid());
            $betroom->setBuyTicket(0);
            $betroom->setCreatedAt(new \DateTimeImmutable());
            $betroom->setUpdatedAt(new \DateTimeImmutable());

            $this->betroomService->saveBetRoom($betroom);
            $this->addFlash('admins.betrooms','Le processus d\'ajout d\'une nouvelle salle de tirage a été bien pris en compte!!');

            return $this->redirectToRoute('admins.betrooms');
        }

        return new Response($this->twig->render('./admins/betrooms/betroom.html.twig',[
            'betrooms' => $this->betroomService->allBetRoom(),
            'form' => $form->createView(),
            'roomSettings' => $this->roomSettingsRepository->findAll()[0]
        ]));
    }

    private function AddOrRemoveTicket($max,$form,$betroom) : void
    {
        $old_max_ticket = $max;
        $new_max_ticket = $form->get('max_ticket')->getData();
        if($old_max_ticket < $new_max_ticket)
        {
            //create new ticket for the difference of $new_max_ticket - $old_max_ticket
            $diff = $new_max_ticket - $old_max_ticket;
            for($count=0; $count < $diff; $count++)
            {
                // dd($diff);
                $this->ticketService->createTicket($betroom);
            }
        }
        elseif($old_max_ticket > $new_max_ticket)
        {
            //remove ticket for the difference of $old_max_ticket - $new_max_ticket if ticket.user is null
               $diff = $old_max_ticket - $new_max_ticket;
                $suppr = 0;
            
                $date = new \DateTime();
                $current_date = $date->format('Y-m-d');
                $tickets = $betroom->getTickets();
                foreach($tickets as $ticket)
                {
                    if($ticket->getCreatedAt()->format('Y-m-d') == $current_date && null==$ticket->getUser() && $diff !==0)
                    {

                        $this->ticketService->removeTicket($ticket);
                        $suppr++;
                    }
                }

                //Error Message
                if($suppr > 1)
                {
                    $this->addFlash('remove.tickets.error', $suppr.' tickets ont pu être retiré');
                }
                elseif($suppr == 1)
                {
                    $this->addFlash('remove.tickets.error', $suppr.' ticket a pas pu être retiré');
                }

                $betroom->setMaxTicket($betroom->getMaxTicket()+ ($diff-$suppr));
        }

        $date = new \DateTime();
        $current_date = date_parse($date->format('Y-m-d H:i:s'));
        if($current_date['hour'] >=$_ENV['CLOSING_TIME'])
        {
            //close the betroom
            $betroom->setStatus("closed");

        }
        elseif($current_date['hour'] >=$_ENV['OPENING_TIME'])
        {
            $betroom->setStatus("open");
        }
    }

    #[Route('/admins/salles-de-tirage/{reference}', name:'admins.betrooms.edit')]
    public function editBetroom(Request $request, Betroom $betroom) : Response
    {
        $logger = $this->getUser();
        if(!$logger)
        {
            return $this->redirectToRoute('app_login');
        }
        elseif($logger->getRoles()[0] != "ROLE_ADMIN" && $logger->getRoles()[0] !="ROLE_SUPERADMIN")
        {
            return $this->redirectToRoute('index');
        }

        $old_max_ticket = $betroom->getTickets()[0]->getBetroom()->getMaxTicket();
        $form = $this->createForm(AddBetroomType::class,$betroom);
        $form->handleRequest($request);
        if($form->isSubmitted() && $form->isValid())
        {
            $this->AddOrRemoveTicket($old_max_ticket,$form,$betroom);
            $betroom->setUpdatedAt(new \DateTimeImmutable());

            $this->betroomService->saveBetRoom($betroom);
            $this->addFlash('admins.betrooms','Le processus de modification d\'une salle de tirage a été bien pris en compte!!');

            return $this->redirectToRoute('admins.betrooms');
        }

        return new Response($this->twig->render('./admins/betrooms/editbetroom.html.twig',[
            'betroom' => $betroom,
            'form' => $form->createView()
        ]));
    }

    #[Route('/admins/salles-de-tirage/suppression/{reference}', name:'admins.betrooms.remove')]
    public function removeBetroom(Betroom $betroom) : Response
    {
        $logger = $this->getUser();
        if(!$logger)
        {
            return $this->redirectToRoute('app_login');
        }
        elseif($logger->getRoles()[0] != "ROLE_ADMIN" && $logger->getRoles()[0] !="ROLE_SUPERADMIN")
        {
            return $this->redirectToRoute('index');
        }

        $this->betroomService->removeBetroom($betroom);

        $this->addFlash('admins.betrooms','Le processus de suppression d\'une salle de tirage a été bien pris en compte!!');

        return $this->redirectToRoute('admins.betrooms');
    }

    #[Route('/admins/resultats-du-jour', name:'admins.winners')]
    public function Winners(Request $request) : Response
    {
        $logger = $this->getUser();
        if(!$logger)
        {
            return $this->redirectToRoute('app_login');
        }
        elseif($logger->getRoles()[0] != "ROLE_ADMIN" && $logger->getRoles()[0] !="ROLE_SUPERADMIN")
        {
            return $this->redirectToRoute('index');
        }

        $form = $this->createForm(ResultatDateType::class);
        $form->handleRequest($request);
        if($form->isSubmitted() && $form->isValid())
        {
            $date = $form->get('result_date')->getData();
            $tickets = $this->ticketService->getWinners($date);

            return new Response($this->twig->render('./admins/betrooms/winners.html.twig',[
                'tickets' => $tickets,
                'form' => $form->createView()
            ]));
        }

        $date_object = new \DateTime();
        $current_date = $date_object->format('d M Y');
        return new Response($this->twig->render('./admins/betrooms/winners.html.twig',[
            'tickets' => $this->ticketService->getWinners($current_date),
            'form' => $form->createView()
        ]));
    }
}