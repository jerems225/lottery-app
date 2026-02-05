<?php

namespace App\Entity;

use App\Repository\BetroomRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BetroomRepository::class)]
class Betroom
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $reference = null;

    #[ORM\Column(length: 255)]
    private ?string $num_betroom = null;

    #[ORM\Column]
    private ?int $max_ticket = null;

    #[ORM\Column]
    private ?float $awards = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\OneToMany(mappedBy: 'betroom', targetEntity: Ticket::class)]
    private Collection $tickets;

    #[ORM\Column]
    private ?float $ticket_price = null;

    #[ORM\Column]
    private ?int $buy_ticket = null;

    public function __construct()
    {
        $this->tickets = new ArrayCollection();
    }

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

    public function getNumBetroom(): ?string
    {
        return $this->num_betroom;
    }

    public function setNumBetroom(string $num_betroom): self
    {
        $this->num_betroom = $num_betroom;

        return $this;
    }

    public function getMaxTicket(): ?int
    {
        return $this->max_ticket;
    }

    public function setMaxTicket(int $max_ticket): self
    {
        $this->max_ticket = $max_ticket;

        return $this;
    }

    public function getAwards(): ?float
    {
        return $this->awards;
    }

    public function setAwards(float $awards): self
    {
        $this->awards = $awards;

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
            $ticket->setBetroom($this);
        }

        return $this;
    }

    public function removeTicket(Ticket $ticket): self
    {
        if ($this->tickets->removeElement($ticket)) {
            // set the owning side to null (unless already changed)
            if ($ticket->getBetroom() === $this) {
                $ticket->setBetroom(null);
            }
        }

        return $this;
    }

    public function getTicketPrice(): ?float
    {
        return $this->ticket_price;
    }

    public function setTicketPrice(float $ticket_price): self
    {
        $this->ticket_price = $ticket_price;

        return $this;
    }

    public function getBuyTicket(): ?int
    {
        return $this->buy_ticket;
    }

    public function setBuyTicket(int $buy_ticket): self
    {
        $this->buy_ticket = $buy_ticket;

        return $this;
    }

}
