<?php

namespace App\Services\Wallets;

use App\Entity\Withdrawal;
use App\Repository\WithdrawalRepository;

class withdrawalService
{
    public function __construct(WithdrawalRepository $withdrawalRepository)
    {
        $this->withdrawalRepository = $withdrawalRepository;
    }

    public function saveWithDrawal(Withdrawal $withdrawal)
    {
        if($withdrawal instanceof Withdrawal)
        {
            $this->withdrawalRepository->save($withdrawal,true);
        }
    }

    public function getWithdrawals() : array
    {
        return $this->withdrawalRepository->findAll();
    }
}