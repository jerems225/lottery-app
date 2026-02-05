<?php

namespace App\Services\Wallets;

use App\Entity\TxUsdt;
use App\Repository\TxUsdtRepository;

class txUsdtService
{
    public function __construct(TxUsdtRepository $txr)
    {
        $this->txr = $txr;
    }

    public function saveTxUsdt(TxUsdt $txUsdt)
    {
        if($txUsdt instanceof TxUsdt)
        {
            $this->txr->save($txUsdt,true);
        }
    }

    public function getTxUsdt() : array
    {
        return $this->txr->findAll();
    }

    public function getTxUsdtByStatus(String $status) : array
    {
        return $this->txr->findByStatus($status);
    }

    public function getTxUsdtByReference(String $reference)
    {
        return $this->txr->findByReference($reference);

    }

}