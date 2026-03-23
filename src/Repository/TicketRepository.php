<?php

namespace App\Repository;

use App\Entity\Ticket;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Ticket>
 *
 * @method Ticket|null find($id, $lockMode = null, $lockVersion = null)
 * @method Ticket|null findOneBy(array $criteria, array $orderBy = null)
 * @method Ticket[]    findAll()
 * @method Ticket[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TicketRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Ticket::class);
    }

    public function save(Ticket $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Ticket $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @return Ticket[] Returns an array of Ticket objects
     */
    public function findByReference($value): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.reference = :val')
            ->setParameter('val', $value)
            ->orderBy('t.id', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }


    /**
     * @return Ticket[] Returns an array of Ticket objects
     */
    public function findByStatus($value, $id): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.status = :val')
            ->andWhere('t.betroom = :id')
            ->setParameter('val', $value)
            ->setParameter('id', $id)
            ->orderBy('t.id', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @return Ticket[] Returns an array of Ticket objects
     */
    public function findByStatusAndUser($value, $id, $user): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.status = :val')
            ->andWhere('t.betroom = :id')
            ->setParameter('val', $value)
            ->setParameter('id', $id)
            ->orderBy('t.id', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @return Ticket[] Returns an array of Ticket objects
     */
    public function findByStatusAndWinner($value): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.status = :val')
            ->setParameter('val', $value)
            ->orderBy('t.id', 'DESC')
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @return Ticket[] Returns an array of Ticket objects
     */
    public function findByStatusAndDate($value, $winAt, $user): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.status = :val')
            ->andWhere('t.winAt = :winAt')
            ->andWhere('t.user = :user')
            ->setParameter('val', $value)
            ->setParameter('winAt', $winAt)
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult()
        ;
    }


    public function findByUserAndBetroom($userId, $betroomId): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.user = :userId')
            ->andWhere('t.betroom = :betroomId')
            ->setParameter('userId', $userId)
            ->setParameter('betroomId', $betroomId)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findByStatusAndUserWinner($id, $status): array|null
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.user = :id')
            ->andWhere('t.status = :status')
            ->setParameter('id', $id)
            ->setParameter('status', $status)
            ->getQuery()
            ->getResult()
        ;
    }
}
