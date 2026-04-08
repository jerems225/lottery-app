<?php

namespace App\Services\Wallets;

use App\Entity\Betroom;
use App\Entity\Ticket;
use App\Entity\User;
use App\Entity\Wallet;
use App\Repository\WalletRepository;

class walletService
{
    private $walletRepository;

    public function __construct(WalletRepository $walletRepository)
    {
        $this->walletRepository = $walletRepository;
    }

    public function saveWallet(Wallet $wallet): void
    {
        if ($wallet instanceof Wallet) {
            $this->walletRepository->save($wallet, true);
        }
    }

    private function Balance(Wallet $wallet, float $ticketPrice): bool
    {
        if ($wallet instanceof Wallet) {
            $balance = $wallet->getBalance();
            return $balance >= $ticketPrice;
        }
        return false;
    }

    public function TicketPayment(User $user, Betroom $betroom, $userService = null): array
    {
        if ($user instanceof User && $betroom instanceof Betroom) {
            $ticketPrice = $betroom->getTicketPrice();
            $checkBalance = $this->Balance($user->getWallet(), $ticketPrice);
            if ($checkBalance) {
                $wallet = $user->getWallet();
                $newBalance = $wallet->getBalance() - $ticketPrice;

                $wallet->setBalance($newBalance);
                $this->walletRepository->save($wallet, true);

                // Affiliation Commission Logic
                if ($user->getReferrer() && $userService) {
                    $referrers = $userService->getUserByReferralCode($user->getReferrer());
                    if (!empty($referrers)) {
                        $referrer = $referrers[0];
                        // Double check it's not self-affiliation
                        if ($referrer->getId() !== $user->getId()) {
                            $commission = $ticketPrice * 0.02; // 2% of bet amount
                            $referrerWallet = $referrer->getWallet();
                            $referrerWallet->setBalance($referrerWallet->getBalance() + $commission);
                            $this->walletRepository->save($referrerWallet, true);
                        }
                    }
                }

                return [
                    'status' => true,
                    'message' => "Paiement effectue avec succes !"
                ];
            } else {
                return [
                    'status' => false,
                    'message' => "Désolé, le solde de votre compte est insuffisant pour acheter ce ticket. Rechargez votre compte svp !"
                ];
            }
        }
        return [
            'status' => false,
            'message' => "Erreur lors du paiement."
        ];
    }

}