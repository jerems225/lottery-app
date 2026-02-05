<?php

namespace App\Controller\Admins;

use App\Entity\Testimony;
use App\Entity\User;
use App\Form\UserSearchType;
use App\Services\Betrooms\betroomService;
use App\Services\Emails\sendemailService;
use App\Services\Overviews\OverviewService;
use App\Services\Users\TestimonyService;
use App\Services\Users\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;

class IndexController extends AbstractController
{
    public function __construct(private Environment $twig,private UserService $userService,private OverviewService $overviewService, 
    private sendemailService $sendemailService,private TestimonyService $testimonyService,private betroomService $betroomService)
    {
    }

    #[Route('/admins' ,name:'admins.index')]
    public function admins(): Response
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

        return new Response($this->twig->render('./admins/index.html.twig',[
            'overviews' => $this->overviewService->AllOverViews()
        ]));
    }

    #[Route('/admins/administration', name: 'admins.administration')]
    public function ListAdmins(Request $request) : Response
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
        
        $form = $this->createForm(UserSearchType::class);
        $form->handleRequest($request);

        $users = $this->userService->listUserByRole("ROLE_USER");
        $rechargeurs = $this->userService->listUserByRole("ROLE_RECHARGEUR");

        $all_users = array_merge($users,$rechargeurs);

        return new Response($this->twig->render('./admins/administrations/list-admins.html.twig',[
            'users' => $this->userService->listUserByRole("ROLE_ADMIN"),
            'allusers' => $all_users,
            'form' => $form->createView()
        ]));
    }

    #[Route('/admins/administration/retirer-le-role/{pseudo}', name: 'admins.administration.role')]
    public function RemoveRole(User $admin, $pseudo) : Response
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

        $admin->setRoles(["ROLE_USER"]);
        $this->userService->saveUser($admin);

        //sendFeeback
        $message = $admin->getPseudo().", vous n'êtes plus un administrateur sur la plateforme CRYPTOBET, Merci pour votre courage et dévouement !!";
        $action = "RESILIATION DE ROLE - ADMINISTRATEUR";
        $this->sendemailService->sendFeedBack($admin,$message,$action);

        return $this->redirectToRoute('admins.administration');
    }

    #[Route('/admins/administration/rendre-admin/{pseudo}', name: 'admins.administration.role.add')]
    public function AddRole(User $admin, $pseudo) : Response
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

        $admin->setRoles(["ROLE_ADMIN"]);
        $this->userService->saveUser($admin);

        //sendFeeback
        $message = $admin->getPseudo().', vous êtes maintenant un administrateur sur la plateforme CRYPTOBET, Merci de contribuer au développement de cette activité.';
        $action = "ATTRIBUTION DE ROLE - ADMINISTRATEUR";
        $this->sendemailService->sendFeedBack($admin,$message,$action);

        return $this->redirectToRoute('admins.administration');
    }

    #[Route('/admins/administration/rechargeurs', name: 'admins.administration.rechargeurs')]
    public function ListRechargeur(Request $request) : Response
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
        
        $form = $this->createForm(UserSearchType::class);
        $form->handleRequest($request);

        return new Response($this->twig->render('./admins/administrations/list-rechargeur.html.twig',[
            'users' => $this->userService->listUserByRole("ROLE_RECHARGEUR"),
            'allusers' => $this->userService->listUserByRole("ROLE_USER"),
            'form' => $form->createView()
        ]));
    }

    #[Route('/admins/rechargeurs/rendre-rechargeur/{pseudo}', name: 'admins.rechargeur.role.add')]
    public function AddRechargeurRole(User $rechargeur, $pseudo) : Response
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

        $rechargeur->setRoles(["ROLE_RECHARGEUR"]);
        $this->userService->saveUser($rechargeur);

        //sendFeeback
        $message = $rechargeur->getPseudo().', vous êtes maintenant un rechargeur sur la plateforme CRYPTOBET, Merci de contribuer au développement de cette activité.';
        $action = "ATTRIBUTION DE ROLE - RECHARGEUR";
        $this->sendemailService->sendFeedBack($rechargeur,$message,$action);

        return $this->redirectToRoute('admins.administration.rechargeurs');
    }

    #[Route('/admins/rechargeur/retirer-le-role/{pseudo}', name: 'admins.rechargeur.role')]
    public function RemoveRechargeurRole(User $rechargeur, $pseudo) : Response
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

        $rechargeur->setRoles(["ROLE_USER"]);
        $this->userService->saveUser($rechargeur);

        //sendFeeback
        $message = $rechargeur->getPseudo().', vous n\'êtes plus un rechargeur sur la plateforme CRYPTOBET, Merci de contribuer au développement de cette activité.';
        $action = "RESILIATION DE ROLE - RECHARGEUR";
        $this->sendemailService->sendFeedBack($rechargeur,$message,$action);

        return $this->redirectToRoute('admins.administration.rechargeurs');
    }

    #[Route('/admins/temoignages', name: 'admins.testimony')]
    public function ListTestimony() : Response
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

        return new Response($this->twig->render('./admins/administrations/list-testimonies.html.twig',[
            'testimonies' => $this->testimonyService->getTestimonies(),
        ]));
    }

    #[Route('/admins/{id}/temoignages/{status}', name: 'admins.testimony.edit')]
    public function editTestimony(Testimony $testimony, $status) : Response
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

        if($status == "true")
        {
            $testimony->setStatus(true);
        }
        elseif($status == "false")
        {
            $testimony->setStatus(false);
        }

        $this->testimonyService->saveTestimony($testimony);
        $this->addFlash('admins.testimony','Processus effectué avec succès !!');

        return $this->redirectToRoute('admins.testimony');
    }

    
}