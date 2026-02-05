<?php

namespace App\Controller\Admins;

use App\Entity\TxReq;
use App\Entity\TxUsdt;
use App\Services\Betrooms\betroomService;
use App\Services\Emails\sendemailService;
use App\Services\Wallets\txReqService;
use App\Services\Wallets\txUsdtService;
use App\Services\Wallets\walletService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;

class RechargementController extends AbstractController
{
    public function __construct(private Environment $twig,private txUsdtService $txUsdtService,private txReqService $txReqService, 
    private walletService $walletService,private sendemailService $sendemailService,private betroomService $betroomService)
    {
    }

    #[Route('/admins/rechargements-usdt', name:'admins.rechargements.usdt')]
    public function usdtTx() :  Response
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
        return new Response($this->twig->render('./admins/rechargements/usdt/list-rechargement.html.twig',[
            'txs' => $this->txUsdtService->getTxUsdt()
        ]));
    }

    #[Route('/admins/rechargements-usdt/{id}status/{reference}/{status}',name:'admins.rechargements.usdt.status')]
    /**
     *
     * @param TxUsdt $txUsdt
     * @param String $status
     * @return Response
     */
    public function setTxUsdtStatus(TxUsdt $txUsdt, String $status) : Response
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

        if($txUsdt->getStatus() != "acceptée" && $status == "accepted")
        {
            $txUsdt->setStatus("acceptée");
            $wallet = $txUsdt->getUser()->getWallet();
            $wallet->setBalance($wallet->getBalance() + $txUsdt->getAmount());

            $this->walletService->saveWallet($wallet);
            $this->addFlash('request.list','Le processus de rechargement de votre compte a été bien pris en compte!!');
            $this->addFlash('admins.valid.usdt','Le processus de validation du rechargement du compte de l\'utilisateur '.$txUsdt->getUser()->getPseudo().' a été bien pris en compte!!');
        }
        elseif($txUsdt->getStatus() != "annulée" && $status == "canceled")
        {
            $txUsdt->setStatus("annulée");
            $wallet = $txUsdt->getUser()->getWallet();
            $wallet->setBalance($wallet->getBalance() - $txUsdt->getAmount());

            $this->walletService->saveWallet($wallet);
            $this->addFlash('request.list.reject','Le processus de rechargement de votre compte a été annulé, Merci de faire une nouvelle demande!!');
            $this->addFlash('admins.reject.usdt','Le processus de validation du rechargement du compte de l\'utilisateur '.$txUsdt->getUser()->getPseudo().' a été annulé!!');
        }
        elseif($status != "accepted" || "canceled")
        {
            return $this->redirectToRoute('admins.rechargements.usdt');
        }

        $this->txUsdtService->saveTxUsdt($txUsdt);

        return $this->redirectToRoute('admins.rechargements.usdt');
    }


    #[Route('/admins/demandes-de-rechargements', name:'admins.rechargements.req')]
    public function reqTx() :  Response
    {
         
        $logger = $this->getUser();
        // dd($logger->getRoles()[0]);
        if(!$logger)
        {
            return $this->redirectToRoute('app_login');
        }
        elseif($logger->getRoles()[0] != "ROLE_RECHARGEUR" && $logger->getRoles()[0] != "ROLE_ADMIN" && $logger->getRoles()[0] != "ROLE_SUPERADMIN")
        {
            return $this->redirectToRoute('index');
        }
        elseif(!$logger->isIsValidated())
        {
            return $this->redirectToRoute('user.profil',[
                'pseudo' => $logger->getPseudo()
            ]);
        }

        $template = './admins/rechargements/reqtx/list-rechargement.html.twig';
    
        return new Response($this->twig->render($template,[
            'txs' => $this->txReqService->getTxReq()
        ]));
    }

    #[Route('/rechargements/demandes-de-rechargements/{id}status/{reference}/{status}',name:'admins.rechargements.req.status')]
    /**
     *
     * @param TxReq $txReq
     * @param String $status
     * @return Response
     */
    public function setTxReqStatus(TxReq $txReq, String $status) : Response
    {
         
        $logger = $this->getUser();
        if(!$logger)
        {
            return $this->redirectToRoute('app_login');
        }
        elseif($logger->getRoles()[0] != "ROLE_ADMIN" && $logger->getRoles()[0] !="ROLE_SUPERADMIN" && $logger->getRoles()[0] !="ROLE_RECHARGEUR")
        {
            return $this->redirectToRoute('index');
        }

        if( $txReq->getStatus() !="acceptée" && $status == "accepted" && $txReq->getRechargeur()->getId() == $logger->getId())
        {
            //rechargeur have enough balance do it else not do it and show error message
            $rechargeur = $txReq->getRechargeur();
            $rechargeur_wallet = $rechargeur->getWallet();
            if($rechargeur_wallet->getBalance() > $txReq->getAmount())
            {
                $txReq->setStatus("acceptée");
                $wallet = $txReq->getUser()->getWallet();
                $wallet->setBalance($wallet->getBalance() + $txReq->getAmount());
    
                $rechargeur_wallet->setBalance($rechargeur_wallet->getBalance() - $txReq->getAmount());

                $this->walletService->saveWallet($wallet);
                $this->walletService->saveWallet($rechargeur_wallet);
                $this->addFlash('request.list','Le processus de rechargement de votre compte a été bien pris en compte!!');
                $this->addFlash('admins.valid.req','Le processus de validation du rechargement du compte de l\'utilisateur '.$txReq->getUser()->getPseudo().' a été bien pris en compte!!');

                //sendfeedback
                $message = 'Le processus de rechargement de votre compte a été bien pris en compte!!';
                $action = "DEMANDE DE RECHARGEMENT VALIDEE";
                $this->sendemailService->sendFeedBack($txReq->getUser(),$message,$action);
            }
            else
            {
                $this->addFlash('admins.balance.error','Votre solde est insuffisant pour effectuer le rechargement du compte de l\'utilisateur '.$txReq->getUser()->getPseudo().' !!');
            }
        }
        elseif($txReq->getStatus() !="annulée" && $status == "canceled" && $txReq->getRechargeur()->getId() == $logger->getId())
        {
            $txReq->setStatus("annulée");
            $this->addFlash('request.list.reject','Le processus de rechargement de votre compte a été annulé, Merci de faire une nouvelle demande!!');

            //sendfeedback
            $message = 'Le processus de validation du rechargement du compte de l\'utilisateur '.$txReq->getUser()->getPseudo().' a été annulé!!';
            $action = "ANNULATION DE LA DEMANDE DE RECHARGEMENT";
            $this->sendemailService->sendFeedBack($txReq->getUser(),$message,$action);

        }
        elseif($txReq->getStatus() !="booked" && $status == "booked")
        {
            $txReq->setStatus("booked");
            $txReq->setRechargeur($logger);
            $this->addFlash('admins.req.booked','Vous avez enclenché Le processus de prise en charge du rechargement du compte de l\'utilisateur '.$txReq->getUser()->getPseudo().' !!');

            //sendfeedback
            $message = 'Votre demande de rechargement est en cours de traitement par un rechargeur verifier vos emails/sms, Merci de patienter!!';
            $action = "DEMANDE DE RECHARGEMENT EN COURS DE TRAITEMENT";
            $this->sendemailService->sendFeedBack($txReq->getUser(),$message,$action);
        }
        elseif($txReq->getStatus() !="en attente de traitement" && $status == "en attente de traitement" && $txReq->getRechargeur()->getId() == $logger->getId())
        {
            $txReq->setStatus("en attente de traitement");
            $txReq->setRechargeur(null);
            $this->addFlash('request.list.unbooked','');
            $this->addFlash('admins.req.booked','Vous avez remis en attente le rechargement du compte de l\'utilisateur '.$txReq->getUser()->getPseudo().' !!');
            
            //sendfeedback
            $message = 'Votre demande de rechargement est a été en attente de traitement par le rechargeur qui s\'en chargeait, Merci de patienter!!';
            $action = "DEMANDE DE RECHARGEMENT REMISE EN ATTENTE DE TRAITEMENT";
            $this->sendemailService->sendFeedBack($txReq->getUser(),$message,$action);
        }
        elseif(($txReq->getRechargeur() && $txReq->getRechargeur()->getId() != $logger->getId()) || ($status != "accepted" || "canceled" || "booked" || "en attente de traitement"))
        {
            return $this->redirectToRoute('admins.rechargements.req');
        }

        $this->txReqService->saveTxReq($txReq);

        return $logger->getRoles()[0] == "ROLE_RECHARGEUR" ? $this->redirectToRoute('user.rechargeur.rechargements.req', ['pseudo' => $logger->getPseudo()]) : $this->redirectToRoute('admins.rechargements.req');
    }


    #[Route('/rechargeur/{pseudo}/demandes-de-rechargements', name:'user.rechargeur.rechargements.req')]
    public function reqTxRechargeur() :  Response
    {
         
        $logger = $this->getUser();
        // dd($logger->getRoles()[0]);
        if(!$logger)
        {
            return $this->redirectToRoute('app_login');
        }
        elseif($logger->getRoles()[0] != "ROLE_RECHARGEUR" && $logger->getRoles()[0] != "ROLE_ADMIN" && $logger->getRoles()[0] != "ROLE_SUPERADMIN")
        {
            return $this->redirectToRoute('index');
        }
        elseif(!$logger->isIsValidated())
        {
            return $this->redirectToRoute('user.profil',[
                'pseudo' => $logger->getPseudo()
            ]);
        }
        $template = './admins/profil/wallet/request/list-rechargement.html.twig'; 

        return new Response($this->twig->render($template,[
            'txs' => $this->txReqService->getTxReq()
        ]));
    }
}