<?php

namespace App\Controller\Admins;

use App\Entity\Withdrawal;
use App\Services\Betrooms\betroomService;
use App\Services\Wallets\walletService;
use App\Services\Wallets\withdrawalService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;

class WithdrawalController extends AbstractController
{
    public function __construct(
        private Environment $twig,
        private withdrawalService $withdrawalService,
        private walletService $walletService,
        private betroomService $betroomService
    ) {
    }

    #[Route('/admin/withdrawal-requests', name: 'admins.withdrawals')]
    public function Withdrawal(): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        } elseif ($logger->getRoles()[0] != "ROLE_ADMIN" && $logger->getRoles()[0] != "ROLE_SUPERADMIN") {
            return $this->redirectToRoute('index');
        }

        return new Response($this->twig->render('./admins/withdrawals/list-withdrawal.html.twig', [
            'txs' => $this->withdrawalService->getWithdrawals()
        ]));
    }

    #[Route('/admin/withdrawal-requests/{id}/status/{reference}/{status}', name: 'admins.rechargements.withdrawal.status')]
    /**
     *
     * @param TxUsdt $withdrawal
     * @param String $status
     * @return Response
     */
    public function setTxUsdtStatus(Withdrawal $withdrawal, string $status): Response
    {

        $logger = $this->getUser();
        if (!$logger) {
            return $this->redirectToRoute('app_login');
        } elseif ($logger->getRoles()[0] != "ROLE_ADMIN" && $logger->getRoles()[0] != "ROLE_SUPERADMIN") {
            return $this->redirectToRoute('index');
        }

        if ($withdrawal->getStatus() != "acceptée" && $status == "accepted") {
            $withdrawal->setStatus("acceptée");
            $wallet = $withdrawal->getUser()->getWallet();
            $wallet->setBalance($wallet->getBalance() - $withdrawal->getAmount());

            $this->walletService->saveWallet($wallet);
            $this->addFlash('request.list.withdrawal', 'Le processus de retrait de fonds d\'une valeur de ' . $withdrawal->getAmount() . ' de votre compte a été bien pris en compte!!');
            $this->addFlash('admins.valid.withdrawal', 'Le processus de validation du rechargement du compte de l\'utilisateur ' . $withdrawal->getUser()->getPseudo() . ' a été bien pris en compte!!');
        } elseif ($withdrawal->getStatus() != "annulée" && $status == "canceled") {
            $withdrawal->setStatus("annulée");
            $wallet = $withdrawal->getUser()->getWallet();
            $wallet->setBalance($wallet->getBalance() + $withdrawal->getAmount());

            $this->walletService->saveWallet($wallet);
            $this->addFlash('request.list.reject.withdrawal', 'Le processus de retrait de fonds d\'une valeur de ' . $withdrawal->getAmount() . ' de votre compte a été annulé, Merci de faire une nouvelle demande!!');
            $this->addFlash('admins.reject.withdrawal', 'Le processus de validation du retrait de fonds du compte de l\'utilisateur ' . $withdrawal->getUser()->getPseudo() . ' a été annulé!!');
        } elseif ($status != "accepted" || "canceled") {
            return $this->redirectToRoute('admins.withdrawals');
        }

        $this->withdrawalService->saveWithdrawal($withdrawal);

        return $this->redirectToRoute('admins.withdrawals');
    }
}