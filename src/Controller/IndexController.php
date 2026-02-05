<?php

namespace App\Controller;

use App\Form\ContactType;
use App\Repository\RoomSettingsRepository;
use App\Services\Betrooms\betroomService;
use App\Services\Betrooms\ticketService;
use App\Services\Emails\sendemailService;
use App\Services\Users\TestimonyService;
use App\Services\Users\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;

class IndexController extends AbstractController
{
    public function __construct(private Environment $twig,private  betroomService $betroomService,
    private  sendemailService $sendemailService,private  TestimonyService $testimonyService, private ticketService $ticketService,
     private RoomSettingsRepository $roomSettingsRepository, private UserService $userService)
    {
    }

    #[Route('/',name:'index')]
    public function index(): Response
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

        return new Response($this->twig->render('index.html.twig',[
            'betrooms' => $this->betroomService->allBetRoom(),
            'testimonies' => $this->testimonyService->getTestimonyByStatus(true),
            'closedAt' => date_format($roomSettings->getClosedAt(),"Y/m/d H:i:s"),
            'openAt' => date_format($roomSettings->getOpenAt(),"Y/m/d H:i:s"),
            'status' => $roomSettings->getStatus()
        ]));
    }

    #[Route('/contactez-nous',name:'contact')]
    public function contact(Request $request) : Response
    {
        $form = $this->createForm(ContactType::class);
        $form->handleRequest($request);
        if($form->isSubmitted() && $form->isValid())
        {
            $email = $form->get('email')->getData();
            $subject = $form->get('subject')->getData();
            $fullname = $form->get('fullname')->getData();
            $message = $form->get('message')->getData();

            //send
            $this->sendemailService->sendContactMail($email,$subject,$fullname,$message);
            $this->addFlash('contact','Votre message est bien parvenu à notre service client, Merci pour votre attention!!');

            return $this->redirectToRoute('contact');
        }
        return new Response($this->twig->render('./contact/contact.html.twig',[
            'form' => $form->createView()
        ]));
    }
}