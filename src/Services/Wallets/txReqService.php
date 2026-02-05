<?php

namespace App\Services\Wallets;

use App\Entity\TxReq;
use App\Repository\TxReqRepository;

class txReqService
{
    public function __construct(TxReqRepository $txReqRepository)
    {
        $this->txReqRepository = $txReqRepository;
    }

    public function saveTxReq(TxReq $txReq)
    {
        if($txReq instanceof TxReq)
        {
            $this->txReqRepository->save($txReq,true);
        }
    }

    public function getTxReq() : array
    {
        return $this->txReqRepository->findAll();
    }

    public function getTxReqByStatus(String $status) : array
    {
        return $this->txReqRepository->findByStatus($status);
    }
}