<?php

namespace App\Services\Wallets;

use App\Entity\Betroom;
use App\Entity\Ticket;
use App\Entity\User;
use App\Entity\Wallet;
use App\Repository\WalletRepository;

class walletService
{
    public function __construct(WalletRepository $walletRepository)
    {
        $this->walletRepository = $walletRepository;
    }

    public function saveWallet(Wallet $wallet) : void
    {
        if($wallet instanceof Wallet)
        {
            $this->walletRepository->save($wallet,true);
        }
    }

    private function Balance(Wallet $wallet, Float $ticketPrice) : bool
    {
        if($wallet instanceof Wallet)
        {
            $balance = $wallet->getBalance();
            if($balance >= $ticketPrice)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }

    public function TicketPayment(User $user, Betroom $betroom) : array
    {
        if($user instanceof User && $betroom instanceof Betroom)
        {
            $checkBalance = $this->Balance($user->getWallet(),$betroom->getTicketPrice());
            if($checkBalance)
            {
                $wallet = $user->getWallet();
                $newBalance = $wallet->getBalance() - $betroom->getTicketPrice();

                $wallet->setBalance($newBalance);
                $this->walletRepository->save($wallet,true);

                return [
                    'status' => true,
                    'message' => "Paiement effectue avec succes !"
                ];
            }
            else
            {
                return [
                    'status' => false,
                    'message' => "Désolé, le solde de votre compte est insuffisant pour acheter ce ticket. Rechargez votre compte svp !"
                ];
            }
        }

    }

}