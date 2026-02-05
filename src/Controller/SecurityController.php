<?php

namespace App\Controller;

use App\Entity\User;
use Twig\Environment;
use App\Entity\Wallet;
use App\Form\ForgotType;
use App\Form\RegisterType;
use App\Form\ResetPassWordType;
use App\Services\PasswordService;
use App\Services\Users\UserService;
use App\Security\LoginAuthenticator;
use App\Services\Betrooms\betroomService;
use App\Services\Wallets\walletService;
use App\Services\Emails\sendemailService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use SymfonyCasts\Bundle\VerifyEmail\VerifyEmailHelperInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;
use Symfony\Component\Security\Http\Authentication\UserAuthenticatorInterface;

class SecurityController extends AbstractController
{
    public function __construct(private Environment $twig,private PasswordService $passwordService,private UserService $userService,private UserAuthenticatorInterface $authenticator,
    private LoginAuthenticator $loginAuthenticator,private walletService $walletService,private sendemailService $sendemailService,private betroomService $betroomService)
    {

    }

    #[Route(path: '/connectez-vous', name: 'app_login')]
    /**
     * Authenticate user
     *
     * @param AuthenticationUtils $authenticationUtils
     * @return Response
     */
    public function login(Request $request, AuthenticationUtils $authenticationUtils): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('index');
        }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return new Response($this->twig->render('security/login.html.twig', [
            'last_username' => $lastUsername,
             'error' => $error
        ]));
    }


    /**
     * Add new user
     *
     * @param Request $request
     * @return Response
     */
    #[Route('/rejoignez-nous',name:'app_register')]
    public function register(Request $request) : Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('index');
        }

        $req_referral_code = $request->query->get('referrer');
        if(null === $req_referral_code)
        {
            $req_referral_code = "";
        }

        $user = new User();
        $form = $this->createForm(RegisterType::class,$user);
        $form->handleRequest($request);
        if($form->isSubmitted() && $form->isValid())
        {

            //create user wallet
            $wallet = new Wallet();
            $wallet->setBalance(0.0);
            $wallet->setBonus(0);

            //hash password
            $Hashpassword = $this->passwordService->Hasher($user,$user->getPassword());
            $user->setPassword($Hashpassword);
            //setRoles
            $user->setRoles(['ROLE_USER']);

            //setWallet
            $user->setWallet($wallet);

            //referral bonus
            $wallet->setReferralBonusStatus(false);

            //set Referral code
            $referral_code = $this->userService->generateReferralCode(4);
            $user->setReferralCode($referral_code);

            //set Referrer code
            $referrer = $form->get('referrer')->getData();
            if($referrer && $referrer != "")
            {
                $user->setReferrer($referrer);
                $wallet->setBonus(50.0);
                $wallet->setReferralBonusStatus(true);
            }

            //save
            $user->setIsValidated(false);
            $this->userService->SaveUser($user);
            $this->walletService->saveWallet($wallet);


            //send validate email 
            $message = "Votre compte a été crée avec succès, veuillez valider votre email en verifiant votre boite mail !!";
            $this->addFlash('register',$message);
            $this->sendemailService->sendValidateAccountEmail($user, $message);

            //auto log in the user
            return $this->authenticator->authenticateUser(
                $user,
                $this->loginAuthenticator,
                $request);
        }

        return new Response($this->twig->render('./security/register.html.twig',[
            'form' => $form->createView(),
            'referrer' => $req_referral_code
        ]));
    }

    #[Route('/activation-de-compte/valider-votre-email', name:'validate.account')]
    public function validateAccount(Request $request,VerifyEmailHelperInterface $verifyEmailHelper) : Response
    {
        $user = $this->userService->getUserById($request->query->get('id'));
        if($user)
        {
            $user = $user[0];
            try {
                $verifyEmailHelper->validateEmailConfirmation(
                    $request->getUri(),
                    $user->getId(),
                    $user->getEmail(),
                );
            } catch (VerifyEmailExceptionInterface $e) {
                $this->addFlash('validation.error','Le lien pour vérifier votre email n\'est pas valide. Veuillez re-envoyer l\'email de validation .');
                return $this->redirectToRoute('user.profil',[
                    'pseudo' => $user->getPseudo()
                ]);
            }

            $user->setIsValidated(true);
            $this->userService->saveUser($user);

            $this->addFlash('account.validate','Votre compte a été valider avec succès, Merci pour votre attention !!');

            return $this->authenticator->authenticateUser(
                $user,
                $this->loginAuthenticator,
                $request);
        }

        return $this->redirectToRoute('index');
    }

    #[Route('/reinitialisation/mot-de-passe/url_encrypted/token', name:'reset.password')]
    public function resetPassword(Request $request,VerifyEmailHelperInterface $verifyEmailHelper) : Response
    {
        $this->betroomService->soldOutBetRoom();
        if ($this->getUser()) {
            return $this->redirectToRoute('index');
        }
        $user = $this->userService->getUserById($request->query->get('id'))[0];
        if($user)
        {
            try {
                $verifyEmailHelper->validateEmailConfirmation(
                    $request->getUri(),
                    $user->getId(),
                    $user->getEmail(),
                );
            } catch (VerifyEmailExceptionInterface $e) {
                $this->addFlash('reset.error','Le lien pour vérifier réinitialiser votre mot de passe n\'est pas valide. Veuillez reprendre le processus !.');
                return $this->redirectToRoute('forget.password');
            }
        }

        $form = $this->createForm(ResetPassWordType::class,$user);
        $form->handleRequest($request);
        if($form->isSubmitted() && $form->isValid())
        {
            //hash password
            $Hashpassword = $this->passwordService->Hasher($user,$user->getPassword());
            $user->setPassword($Hashpassword);

            $this->userService->saveUser($user);
            $this->addFlash('reset.success','Votre mot de passe a bien été réinitialiser, Merci pour votre attention !!');

            return $this->authenticator->authenticateUser(
                $user,
                $this->loginAuthenticator,
                $request);
        }

        return new Response($this->twig->render('./security/reset-password.html.twig',[
            'form' => $form->createView()
        ]));
    }

    

    #[Route('/mot-de-passe/oublie/confirme-email', name:'forget.password')]
    public function forgetPassword(Request $request) : Response
    {
        $this->betroomService->soldOutBetRoom();
        if ($this->getUser()) {
            return $this->redirectToRoute('index');
        }

        $form = $this->createForm(ForgotType::class);
        $form->handleRequest($request);
        if($form->isSubmitted() && $form->isValid())
        {
            $email = $form->get('email')->getData();
            $user  = $this->userService->getUserByEmail($email);
            if($user)
            {
                //send email 
                $message = "Vous voulez réinitialiser votre mot de passe, cela se fera en deux étapes : un clic sur le bouton juste en bas et le remplissement d'un formulaire. !!";
                $this->sendemailService->sendResetPasswordEmail($user[0], $message);
                //show flash
                $this->addFlash('email.send', 'Nous vous avons envoyé un email, contenant un bouton pour vous permettre de réinitialiser votre compte !!!');
            }
            else
            {
                //show flash error
                $this->addFlash('email.error', 'Nous vous n\'avons pas retrouvé votre adresse email comme utilisateur de cette plateforme, Merci d\'ouvrir un compte!!!');
            }

            return $this->redirectToRoute('forget.password');
        }

        return new Response($this->twig->render('./security/forgot.html.twig',[
            'form' => $form->createView()
        ]));
    }

    #[Route('/activation-de-compte/{pseudo}/re-envoyer-email-confirmation', name: 'validate.account.resend')]
    public function resendValidateAccount(User $user, $pseudo) : Response
    {
        $this->betroomService->soldOutBetRoom();
        $logger = $this->getUser();
        if(!$logger)
        {
            return $this->redirectToRoute('app_login');
        }

        //send validate email 
        $message = "Votre compte a été crée avec succès, veuillez valider votre email en vérifiant votre boîte aux lettres !!";
        $this->sendemailService->sendValidateAccountEmail($user, $message);

        $this->addFlash('resend-email','L\'email de validation de compte à bien été envoyé dans votre boîte aux lettres!!');

        return $this->redirectToRoute('user.profil',[
            'pseudo' => $pseudo
        ]);
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout()
    {
        return $this->redirectToRoute('app_login');
    }
}
