<?php

namespace App\Controller\Admins;

use App\Entity\Testimony;
use App\Entity\TxReq;
use App\Entity\TxUsdt;
use App\Entity\User;
use App\Entity\Withdrawal;
use App\Form\ProfileType;
use App\Form\ResultatDateType;
use App\Form\TestimonyType;
use App\Form\TxReqType;
use App\Form\TxTrc20Type;
use App\Form\TxUsdtType;
use App\Form\WithdrawalType;
use App\Services\Betrooms\betroomService;
use App\Services\Betrooms\ticketService;
use App\Services\Emails\sendemailService;
use App\Services\Users\TestimonyService;
use App\Services\Users\UserService;
use App\Services\Wallets\txReqService;
use App\Services\Wallets\txUsdtService;
use App\Services\Wallets\walletService;
use App\Services\Wallets\withdrawalService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Twig\Environment;

class ProfileController extends AbstractController
{
    public function __construct(
        private Environment $twig,
        private betroomService $betroomService,
        private UserService $userService,
        private walletService $walletService,
        private txUsdtService $txUsdtService,
        private txReqService $txReqService,
        private withdrawalService $withdrawalService,
        private UserPasswordHasherInterface $passwordHasher,
        private sendemailService $sendemailService,
        private HttpClientInterface $client,
        private TestimonyService $testimonyService,
        private ticketService $ticketService
    ) {

    }

    #[Route('/my-profile/{pseudo}', name: 'user.profil')]
    /**
     * user profile
     *
     * @param User $user
     * @param Request $request
     * @return Response
     */
    public function profil(User $user, Request $request): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        $form = $this->createForm(ProfileType::class, $user);
        $form->handleRequest($request);
        $referrer_initial = $user->getReferrer();
        if ($form->isSubmitted() && $form->isValid()) {
            //Join avatar
            $avatar = $form->get('avatar')->getData();
            if ($avatar) {
                $date = new \DateTime();
                $cdate = $date->format('Y-m-d-H-i-s');
                $newFilename = 'avatar-' . $cdate . '.' . $avatar->guessExtension();
                try {
                    $avatar->move(
                        $this->getParameter('images_directory_avatar'),
                        $newFilename
                    );
                } catch (FileException $e) {
                    // ... handle exception if something happens during file upload
                }
                $user->setAvatar($newFilename);
            }

            //verify referrer existence
            $referrer_code = $form->get('referrer')->getData();
            if (!empty($referrer_code)) {
                $referrer = $this->userService->findReferrer($referrer_code);
                if ($referrer && $user->getWallet()->isReferralBonusStatus() == false) {
                    $wallet = $user->getWallet();
                    $wallet->setBonus($wallet->getBonus() + 50.0);
                    $wallet->setReferralBonusStatus(true);

                    $this->walletService->saveWallet($wallet);
                } else {
                    $user->setReferrer($referrer_initial);
                    $this->addFlash('referrer.error', 'Ce code de parrainage n\'existe pas, Merci de renseigner un code exact !!');
                }
            }


            $this->userService->saveUser($user);
        }
        return new Response($this->twig->render('./admins/profil/profil.html.twig', [
            'form' => $form->createView()
        ]));
    }

    #[Route('/my-profile/{pseudo}/deposit-type', name: 'user.rechargement.type')]
    public function choiceDeposit(): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        return new Response($this->twig->render('./admins/profil/wallet/choicedeposit.html.twig', []));
    }

    #[Route('/my-profile/{pseudo}/deposit-type/usdt-trc20', name: 'user.rechargement.usdt.trc20')]
    public function usdtTrc20Deposit(Request $request, $pseudo): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        $tx = new TxUsdt();
        $form = $this->createForm(TxTrc20Type::class, $tx);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $tx->setReference(uniqid());
            $tx->setToken("TRC20");
            $tx->setStatus("en attente de validation");
            $tx->setUser($logger);

            $tx->setCreatedAt(new \DateTimeImmutable());
            $tx->setUpdatedAt(new \DateTimeImmutable());

            $this->txUsdtService->saveTxUsdt($tx);

            $this->addFlash('usdt.check', 'Merci d\'avoir validé vos informations. Maintenant procéder à l\'envoi des usdt selon les informations ci-dessous !');

            return $this->redirectToRoute('user.rechargement.usdt.trc20.check', [
                'pseudo' => $pseudo,
                'reference' => $tx->getReference()
            ]);
        }
        return new Response($this->twig->render('./admins/profil/wallet/trc20/usdt.html.twig', [
            'form' => $form->createView()
        ]));
    }

    #[Route('/my-profile/{pseudo}/deposit-type/usdt-trc20/pending-payment/{reference}', name: 'user.rechargement.usdt.trc20.check')]
    public function checkTrc20Tx(TxUsdt $txUsdt, Request $request): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        return new Response($this->twig->render('./admins/profil/wallet/trc20/checktx.html.twig', [
            'COMPANY_USDT_TRC20_ADDRESS' => $_ENV['COMPANY_USDT_TRC20_ADDRESS'],
            'TX' => $txUsdt
        ]));
    }

    #[Route('/my-profile/{pseudo}/deposit-type/usdt-erc20', name: 'user.rechargement.usdt')]
    public function usdtErc20Deposit(Request $request, $pseudo): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        $tx = new TxUsdt();
        $form = $this->createForm(TxUsdtType::class, $tx);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $tx->setReference(uniqid());
            $tx->setToken("ERC20");
            $tx->setStatus("en attente de validation");
            $tx->setUser($logger);

            $tx->setCreatedAt(new \DateTimeImmutable());
            $tx->setUpdatedAt(new \DateTimeImmutable());

            $this->txUsdtService->saveTxUsdt($tx);

            $this->addFlash('usdt.check', 'Merci d\'avoir validé vos informations. Maintenant procéder à l\'envoi des usdt selon les informations ci-dessous !');

            return $this->redirectToRoute('user.rechargement.usdt.check', [
                'pseudo' => $pseudo,
                'reference' => $tx->getReference()
            ]);
        }
        return new Response($this->twig->render('./admins/profil/wallet/usdt/usdt.html.twig', [
            'form' => $form->createView()
        ]));
    }

    #[Route('/my-profile/{pseudo}/deposit-type/usdt-erc20/pending-payment/{reference}', name: 'user.rechargement.usdt.check')]
    public function checkErc20Tx(TxUsdt $txUsdt, Request $request): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        return new Response($this->twig->render('./admins/profil/wallet/usdt/checktx.html.twig', [
            'COMPANY_USDT_ADDRESS' => $_ENV['COMPANY_USDT_ADDRESS'],
            'TX' => $txUsdt
        ]));
    }

    #[Route('/transaction/{pseudo}/checking/deposit-type/usdt/pending-payment/{reference}', name: 'user.rechargement.usdt.checking')]
    public function checkingTx(TxUsdt $txUsdt, $pseudo): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        $url = $_ENV['WEBHOOK_URL'] . "/webhook/v1/launch/txusdt/listner?address=" . $txUsdt->getAddress() . "&reference=" . $txUsdt->getReference();
        $response = $this->client->request('GET', $url);
        $code = 0;
        if ($response->getStatusCode() == 200) {
            $content = json_decode($response->getContent(), true);
            if ($content['status'] == 200) {
                $code = $content['status'];
            } elseif ($content['status'] == 201) {
                $code = $content['status'];
            }
        }


        return $this->redirectToRoute('user.rechargement.usdt.check', [
            'pseudo' => $pseudo,
            'reference' => $txUsdt->getReference(),
        ]);

        return new Response($this->twig->render('./admins/profil/wallet/usdt/checktx.html.twig', [
            'COMPANY_USDT_ADDRESS' => $_ENV['COMPANY_USDT_ADDRESS'],
            'TX' => $txUsdt,
            "code" => $code
        ]));

    }

    #[Route('/usdt/validate/transaction', name: 'validate.tx')]
    public function validateTx(Request $request)
    {

        $reference = $request->query->get('reference');
        $value = $request->query->get('value');
        $txUsdt = $this->txUsdtService->getTxUsdtByReference($reference);
        if (count($txUsdt) > 0) {
            $txUsdt[0]->setStatus("acceptée");
            $txUsdt[0]->setAmount($value);
            $this->txUsdtService->saveTxUsdt($txUsdt[0]);

            $wallet = $txUsdt[0]->getUser()->getWallet();
            $wallet->setBalance($wallet->getBalance() + $value);

            $this->walletService->saveWallet($wallet);

            //sendfeeback
            $message = "Le rechargement de votre compte a été accompli avec succès, Merci pour votre attention!!, vous avez fait parvenir " . $value . "\$USD dans votre transaction";
            $action = "RECHARGEMENT DE COMPTE REUSSI !!";
            $this->sendemailService->sendFeedBack($txUsdt[0]->getUser(), $message, $action);

            return $this->redirectToRoute('user.rechargement.usdt.check', [
                'pseudo' => $txUsdt[0]->getUser()->getPseudo(),
                'reference' => $reference
            ]);
        }
    }


    #[Route('/my-profile/{pseudo}/deposit-type/request', name: 'user.rechargement.request')]
    public function reqDeposit(Request $request, $pseudo): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        } elseif (!$logger->isIsValidated()) {
            return $this->redirectToRoute('user.profil', [
                'pseudo' => $pseudo
            ]);
        }

        $tx = new TxReq();
        $form = $this->createForm(TxReqType::class, $tx);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $tx->setReference(uniqid());
            $tx->setStatus("en attente de traitement");
            $tx->setUser($logger);

            $tx->setCreatedAt(new \DateTimeImmutable());
            $tx->setUpdatedAt(new \DateTimeImmutable());

            $this->txReqService->saveTxReq($tx);

            $this->addFlash('request.list', 'Votre demande de rechargement sera traitée dans un bref délai, Merci de patienter');

            //send request to all rechargeur
            $message = "Une nouvelle demande de rechargement est en attente de traitement, vous pouvez être l'heureux rechargeur !!";
            $action = "NOUVELLE DEMANDE DE RECHARGEMENT";
            $user_role = "ROLE_RECHARGEUR";
            $this->sendemailService->sendEmailByUserRole($user_role, $message, $action);

            return $this->redirectToRoute('user.rechargement.type', [
                'pseudo' => $pseudo
            ]);
        }
        return new Response($this->twig->render('./admins/profil/wallet/request/request.html.twig', [
            'form' => $form->createView()
        ]));
    }

    private function validateValue($form): array
    {
        function getData($field, $form)
        {
            return ($form->get($field)->getData());
        }

        //form datas
        $payment_type = getData('payment_type', $form);
        $id_card = getData('id_card', $form);
        ;
        $bank_country = getData('bank_country', $form);
        $bank = getData('bank', $form);
        $crypto_name = getData('crypto_name', $form);
        $wallet_address = getData('wallet_address', $form);
        $momo_operator = getData('momo_operator', $form);
        $phone = getData('phone', $form);
        if ($payment_type == "VIREMENT BANCAIRE") {
            $unrequired_values = $crypto_name . $wallet_address . $momo_operator . $phone;
            if (!empty($unrequired_values)) {
                return [
                    'status' => false,
                    'warning' => 'Nous vous conseillons d\'éviter de manipuler les valeurs dans la DOM HTML, Merci de prendre cette avertissement au serieux !'
                ];
            } else {
                return [
                    'status' => true,
                    'warning' => ''
                ];
            }
        } elseif ($payment_type == "CRYPTO-MONNAIE") {
            $unrequired_values = $bank . $id_card . $bank_country . $momo_operator . $phone;
            if (!empty($unrequired_values)) {
                return [
                    'status' => false,
                    'warning' => 'Nous vous conseillons d\'éviter de manipuler les valeurs dans la DOM HTML, Merci de prendre cette avertissement au serieux!'
                ];
            } else {
                return [
                    'status' => true,
                    'warning' => ''
                ];
            }
        } elseif ($payment_type == "MOBILE MONEY") {
            $unrequired_values = $bank . $id_card . $bank_country . $crypto_name . $wallet_address;
            if (!empty($unrequired_values)) {
                return [
                    'status' => false,
                    'warning' => 'Nous vous conseillons d\'éviter de manipuler les valeurs dans la DOM HTML, Merci de prendre cette avertissement au serieux'
                ];
            } else {
                return [
                    'status' => true,
                    'warning' => ''
                ];
            }
        }
    }

    #[Route('/my-profile/{pseudo}/withdrawal-request', name: 'user.withdrawal')]
    public function withdrawal(Request $request, $pseudo): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        } elseif (!$logger->isIsValidated()) {
            return $this->redirectToRoute('user.profil', [
                'pseudo' => $pseudo
            ]);
        }

        $tx = new Withdrawal();
        $form = $this->createForm(WithdrawalType::class, $tx);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $amount = $form->get('amount')->getData();
            if ($amount <= $logger->getWallet()->getBalance()) {
                $tx->setReference(uniqid());
                $tx->setStatus("en attente de traitement");
                $tx->setUser($logger);

                $tx->setCreatedAt(new \DateTimeImmutable());
                $tx->setUpdatedAt(new \DateTimeImmutable());

                $this->withdrawalService->saveWithDrawal($tx);

                $this->addFlash('withdrawals', 'Votre demande de retrait sera traitée dans un bref délai, Merci de patienter');

                //send request to all admin
                $message = "Une nouvelle demande de retrait est en attente de traitement, une demande traitée vite augmente l'expérience utilisateur !!";
                $action = "NOUVELLE DEMANDE DE RETRAIT";
                $user_role = "ROLE_ADMIN";
                $this->sendemailService->sendEmailByUserRole($user_role, $message, $action);

                return $this->redirectToRoute('user.withdrawal', [
                    'pseudo' => $pseudo
                ]);
            } else {
                $this->addFlash('withdrawals.amount.error', 'Vous ne pouvez pas faire une demande de retrait d\'un montant supérieur à votre solde !');
            }
        }

        return new Response($this->twig->render('./admins/profil/wallet/withdrawal/withdrawal.html.twig', [
            'form' => $form->createView()
        ]));
    }

    #[Route('/my-profile/{pseudo}/my-tickets', name: 'user.tickets')]
    public function myTickets(User $user, $pseudo): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        return new Response($this->twig->render('./admins/profil/ticket/ticket.html.twig', [
            'tickets' => $user->getTickets()
        ]));
    }

    #[Route('/my-profile/{pseudo}/my-team', name: 'user.profil.myteam')]
    public function MyTeam(): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }


        return new Response($this->twig->render('./admins/profil/myteam.html.twig', [
            'filleuls' => $this->userService->getUserByReferrer($logger->getReferralCode()),
            'referral_url' => $_ENV['BASE_URL'] . "/rejoignez-nous?referrer=" . $logger->getReferralCode()
        ]));
    }

    #[Route('/my-profile/{pseudo}/give-testimonial', name: 'user.profil.testimony')]
    public function testimony(Request $request): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        $testimony = new Testimony();
        $form = $this->createForm(TestimonyType::class, $testimony);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $testimony->setStatus(false);
            $testimony->setUser($logger);
            $this->testimonyService->saveTestimony($testimony);

            $this->addFlash('testimony', 'Votre commentaire a bien été pris en compte, il sera disponible sur la plateforme après validation. Merci !!');
            return $this->redirectToRoute('user.profil.testimony', [
                'pseudo' => $testimony->getUser()->getPseudo()
            ]);
        }

        return new Response($this->twig->render('./admins/profil/testimony.html.twig', [
            'testimonies' => $this->testimonyService->getTestimoniesByUser($logger),
            'form' => $form->createView()
        ]));
    }

    #[Route('/my-profile/{pseudo}/{id}/testimonial/remove', name: 'user.profil.testimony.remove')]
    public function removeTestimony(Testimony $testimony): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        $this->testimonyService->removeTestimony($testimony);
        $this->addFlash('testimony', 'La suppression de votre commentaire a bien été pris en compte, Merci !!');

        return $this->redirectToRoute('user.profil.testimony', [
            'pseudo' => $testimony->getUser()->getPseudo()
        ]);
    }

    #[Route('/my-profile/{pseudo}/all-results', name: 'user.profil.winners')]
    public function Winners(Request $request): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        }

        $form = $this->createForm(ResultatDateType::class);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $date = $form->get('result_date')->getData();
            $tickets = $this->ticketService->getWinners($date);

            return new Response($this->twig->render('./admins/profil/winners.html.twig', [
                'tickets' => $tickets,
                'form' => $form->createView()
            ]));
        }

        $date_object = new \DateTime();
        $current_date = $date_object->format('d M Y');
        return new Response($this->twig->render('./admins/profil/winners.html.twig', [
            'tickets' => $this->ticketService->getWinners($current_date),
            'form' => $form->createView()
        ]));
    }
}
