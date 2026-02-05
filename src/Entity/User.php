<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints\Email;


#[ORM\Entity(repositoryClass: UserRepository::class)]
#[UniqueEntity(fields: ['email'], message: "Déjà utilisé")]
#[UniqueEntity(fields: ['pseudo'], message: "Déjà utilisé")]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Email()]
    private ?string $email = null;

    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $referrer = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $referral_code = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $pseudo = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Ticket::class)]
    private Collection $tickets;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    private ?Wallet $wallet = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $firstname = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $lastname = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $country = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $city = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $zip_code = null;

    #[ORM\Column]
    private ?bool $is_validated = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: TxUsdt::class)]
    private Collection $txs_usdt;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: TxReq::class)]
    private Collection $txReqs;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Withdrawal::class)]
    private Collection $withdrawals;

    #[ORM\OneToMany(mappedBy: 'rechargeur', targetEntity: TxReq::class)]
    private Collection $demandeReq;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Testimony::class)]
    private Collection $testimonies;

    public function __construct()
    {
        $this->tickets = new ArrayCollection();
        $this->txs_usdt = new ArrayCollection();
        $this->txReqs = new ArrayCollection();
        $this->withdrawals = new ArrayCollection();
        $this->demandeReq = new ArrayCollection();
        $this->testimonies = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getReferrer(): ?string
    {
        return $this->referrer;
    }

    public function setReferrer(?string $referrer): self
    {
        $this->referrer = $referrer;

        return $this;
    }

    public function getReferralCode(): ?string
    {
        return $this->referral_code;
    }

    public function setReferralCode(string $referral_code): self
    {
        $this->referral_code = $referral_code;

        return $this;
    }

    public function getPseudo(): ?string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): self
    {
        $this->pseudo = $pseudo;

        return $this;
    }

    /**
     * @return Collection<int, Ticket>
     */
    public function getTickets(): Collection
    {
        return $this->tickets;
    }

    public function addTicket(Ticket $ticket): self
    {
        if (!$this->tickets->contains($ticket)) {
            $this->tickets->add($ticket);
            $ticket->setUser($this);
        }

        return $this;
    }

    public function removeTicket(Ticket $ticket): self
    {
        if ($this->tickets->removeElement($ticket)) {
            // set the owning side to null (unless already changed)
            if ($ticket->getUser() === $this) {
                $ticket->setUser(null);
            }
        }

        return $this;
    }

    public function getWallet(): ?Wallet
    {
        return $this->wallet;
    }

    public function setWallet(?Wallet $wallet): self
    {
        $this->wallet = $wallet;

        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(?string $firstname): self
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(?string $lastname): self
    {
        $this->lastname = $lastname;

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

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(?string $country): self
    {
        $this->country = $country;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): self
    {
        $this->city = $city;

        return $this;
    }

    public function getZipCode(): ?string
    {
        return $this->zip_code;
    }

    public function setZipCode(?string $zip_code): self
    {
        $this->zip_code = $zip_code;

        return $this;
    }

    public function isIsValidated(): ?bool
    {
        return $this->is_validated;
    }

    public function setIsValidated(bool $is_validated): self
    {
        $this->is_validated = $is_validated;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): self
    {
        $this->avatar = $avatar;

        return $this;
    }

    /**
     * @return Collection<int, TxUsdt>
     */
    public function getTxsUsdt(): Collection
    {
        return $this->txs_usdt;
    }

    public function addTxsUsdt(TxUsdt $txsUsdt): self
    {
        if (!$this->txs_usdt->contains($txsUsdt)) {
            $this->txs_usdt->add($txsUsdt);
            $txsUsdt->setUser($this);
        }

        return $this;
    }

    public function removeTxsUsdt(TxUsdt $txsUsdt): self
    {
        if ($this->txs_usdt->removeElement($txsUsdt)) {
            // set the owning side to null (unless already changed)
            if ($txsUsdt->getUser() === $this) {
                $txsUsdt->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, TxReq>
     */
    public function getTxReqs(): Collection
    {
        return $this->txReqs;
    }

    public function addTxReq(TxReq $txReq): self
    {
        if (!$this->txReqs->contains($txReq)) {
            $this->txReqs->add($txReq);
            $txReq->setUser($this);
        }

        return $this;
    }

    public function removeTxReq(TxReq $txReq): self
    {
        if ($this->txReqs->removeElement($txReq)) {
            // set the owning side to null (unless already changed)
            if ($txReq->getUser() === $this) {
                $txReq->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Withdrawal>
     */
    public function getWithdrawals(): Collection
    {
        return $this->withdrawals;
    }

    public function addWithdrawal(Withdrawal $withdrawal): self
    {
        if (!$this->withdrawals->contains($withdrawal)) {
            $this->withdrawals->add($withdrawal);
            $withdrawal->setUser($this);
        }

        return $this;
    }

    public function removeWithdrawal(Withdrawal $withdrawal): self
    {
        if ($this->withdrawals->removeElement($withdrawal)) {
            // set the owning side to null (unless already changed)
            if ($withdrawal->getUser() === $this) {
                $withdrawal->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, TxReq>
     */
    public function getDemandeReq(): Collection
    {
        return $this->demandeReq;
    }

    public function addDemandeReq(TxReq $demandeReq): self
    {
        if (!$this->demandeReq->contains($demandeReq)) {
            $this->demandeReq->add($demandeReq);
            $demandeReq->setRechargeur($this);
        }

        return $this;
    }

    public function removeDemandeReq(TxReq $demandeReq): self
    {
        if ($this->demandeReq->removeElement($demandeReq)) {
            // set the owning side to null (unless already changed)
            if ($demandeReq->getRechargeur() === $this) {
                $demandeReq->setRechargeur(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Testimony>
     */
    public function getTestimonies(): Collection
    {
        return $this->testimonies;
    }

    public function addTestimony(Testimony $testimony): self
    {
        if (!$this->testimonies->contains($testimony)) {
            $this->testimonies->add($testimony);
            $testimony->setUser($this);
        }

        return $this;
    }

    public function removeTestimony(Testimony $testimony): self
    {
        if ($this->testimonies->removeElement($testimony)) {
            // set the owning side to null (unless already changed)
            if ($testimony->getUser() === $this) {
                $testimony->setUser(null);
            }
        }

        return $this;
    }
}
