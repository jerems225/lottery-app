<?php

namespace App\Entity;

use App\Repository\WalletRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: WalletRepository::class)]
class Wallet
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?float $balance = null;

    #[ORM\Column]
    private ?float $bonus = null;

    #[ORM\Column]
    private ?bool $referral_bonus_status = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBalance(): ?float
    {
        return $this->balance;
    }

    public function setBalance(float $balance): self
    {
        $this->balance = $balance;

        return $this;
    }

    public function getBonus(): ?float
    {
        return $this->bonus;
    }

    public function setBonus(float $bonus): self
    {
        $this->bonus = $bonus;

        return $this;
    }

    public function isReferralBonusStatus(): ?bool
    {
        return $this->referral_bonus_status;
    }

    public function setReferralBonusStatus(bool $referral_bonus_status): self
    {
        $this->referral_bonus_status = $referral_bonus_status;

        return $this;
    }

}
