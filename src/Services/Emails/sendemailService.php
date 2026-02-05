<?php 

namespace App\Services\Emails;

use App\Entity\User;
use App\Services\Users\UserService;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use SymfonyCasts\Bundle\VerifyEmail\VerifyEmailHelperInterface;
use Twig\Environment;

class sendemailService 
{
    public function __construct(private MailerInterface $mailer, private Environment $twig, private VerifyEmailHelperInterface $verifyEmailHelper, private UserService $userService)
    {

    }

    private function generateSignedUrl(User $user, String $route)
    {
        $signatureComponents = $this->verifyEmailHelper->generateSignature(
            $route,
            $user->getId(),
            $user->getEmail(),
            ['id' => $user->getId()]
        );

        return $signatureComponents->getSignedUrl();
    }

    public function sendContactMail(String $to, String $subject, String $fullname, String $message) : void
    {
        $message = "<strong> Message de :</strong> <br /> <strong> Nom Complet :</strong> ".$fullname."<br /> <strong> Email :</strong> ".$to."<br /> <strong> Message : </strong>".$message;
        $email = (new Email())
        ->from($_ENV['EMAIL_COMPANY'])
        ->to($_ENV['EMAIL_CONTACT_MESSAGE'])
        ->subject($subject)
        ->html($message);

        $this->mailer->send($email);
    }

    public function sendValidateAccountEmail($user, $message) : void
    {
        $url = $this->generateSignedUrl($user,'validate.account');
        $email = (new Email())
        ->from($_ENV['EMAIL_COMPANY'])
        ->to($user->getEmail())
        ->subject("BIENVENUE CHEZ CRYPTOBET - VALIDER VOTRE COMPTE !!!")
        ->html($this->twig->render('./emails/validateAccount.html.twig',[
            'message' => $message,
            'url'=> $url
        ]));

        $this->mailer->send($email);
    }

    public function sendResetPasswordEmail($user, $message) : void
    {
        $url = $this->generateSignedUrl($user,'reset.password');
        $email = (new Email())
        ->from($_ENV['EMAIL_COMPANY'])
        ->to($user->getEmail())
        ->subject("REINITIALISATION DE VOTRE MOT DE PASSE !!!")
        ->html($this->twig->render('./emails/forgot.html.twig',[
            'message' => $message,
            'url'=> $url
        ]));

        $this->mailer->send($email);
    }

    public function sendFeedBack(User $user, String $message,String $action) :void
    {
        $email = (new Email())
        ->from($_ENV['EMAIL_COMPANY'])
        ->to($user->getEmail())
        ->subject($action)
        ->html($this->twig->render('./emails/feedback.html.twig',[
            'message' => $message,
            'action' => $action
        ]));

        $this->mailer->send($email);
    }

    public function sendEmailByUserRole(String $role, String $message,String $action) : void
    {
        $users = $this->userService->listUserByRole($role);
        if($role == "ROLE_RECHARGEUR")
        {
            $admins = $this->userService->listUserByRole($role);
            $users = array_merge($users,$admins);
        }

        $users_emails = [];
        foreach($users as $user)
        {
            array_push($users_emails,$user->getEmail());
        }

        $email = (new Email())
        ->from($_ENV['EMAIL_COMPANY'])
        ->to(...$users_emails)
        ->subject($action)
        ->html($this->twig->render('./emails/feedback.html.twig',[
            'message' => $message,
            'action' => $action
        ]));

        $this->mailer->send($email);
    }
}