<?php

namespace App\Entity;

use App\Repository\WithdrawalRepository;
use App\Validator\CheckWithdrawalAmount;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: WithdrawalRepository::class)]
class Withdrawal
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $reference = null;

    #[ORM\Column(length: 255)]
    private ?string $payment_type = null;

    #[ORM\Column]
    private ?float $amount = null;

    #[ORM\Column(length: 255)]
    private ?string $status = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\ManyToOne(inversedBy: 'withdrawals')]
    private ?User $user = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $id_card = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $bank = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $bank_country = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $crypto_name = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $wallet_address = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $momo_operator = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $phone = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getReference(): ?string
    {
        return $this->reference;
    }

    public function setReference(string $reference): self
    {
        $this->reference = $reference;

        return $this;
    }

    public function getPaymentType(): ?string
    {
        return $this->payment_type;
    }

    public function setPaymentType(string $payment_type): self
    {
        $this->payment_type = $payment_type;

        return $this;
    }

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): self
    {
        $this->amount = $amount;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): self
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(\DateTimeImmutable $updated_at): self
    {
        $this->updated_at = $updated_at;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getIdCard(): ?string
    {
        return $this->id_card;
    }

    public function setIdCard(?string $id_card): self
    {
        $this->id_card = $id_card;

        return $this;
    }

    public function getBank(): ?string
    {
        return $this->bank;
    }

    public function setBank(?string $bank): self
    {
        $this->bank = $bank;

        return $this;
    }

    public function getBankCountry(): ?string
    {
        return $this->bank_country;
    }

    public function setBankCountry(?string $bank_country): self
    {
        $this->bank_country = $bank_country;

        return $this;
    }

    public function getCryptoName(): ?string
    {
        return $this->crypto_name;
    }

    public function setCryptoName(?string $crypto_name): self
    {
        $this->crypto_name = $crypto_name;

        return $this;
    }

    public function getWalletAddress(): ?string
    {
        return $this->wallet_address;
    }

    public function setWalletAddress(?string $wallet_address): self
    {
        $this->wallet_address = $wallet_address;

        return $this;
    }

    public function getMomoOperator(): ?string
    {
        return $this->momo_operator;
    }

    public function setMomoOperator(?string $momo_operator): self
    {
        $this->momo_operator = $momo_operator;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }
}
