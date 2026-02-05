<?php

namespace App\Repository;

use App\Entity\TxUsdt;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TxUsdt>
 *
 * @method TxUsdt|null find($id, $lockMode = null, $lockVersion = null)
 * @method TxUsdt|null findOneBy(array $criteria, array $orderBy = null)
 * @method TxUsdt[]    findAll()
 * @method TxUsdt[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TxUsdtRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TxUsdt::class);
    }

    public function save(TxUsdt $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(TxUsdt $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

   /**
    * @return TxUsdt[] Returns an array of TxUsdt objects
    */
   public function findByStatus($status): array
   {
       return $this->createQueryBuilder('t')
           ->andWhere('t.status = :val')
           ->setParameter('val', $status)
           ->orderBy('t.id', 'ASC')
           ->setMaxResults(10)
           ->getQuery()
           ->getResult()
       ;
   }

      /**
    * @return TxUsdt[] Returns an array of TxUsdt objects
    */
    public function findByTxStatus($status, $address, $amount): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.status = :val')
            ->andWhere('t.address = :address')
            ->andWhere('t.amount = :amount')
            ->setParameter('val', $status)
            ->setParameter('address', $address)
            ->setParameter('amount', $amount)
            ->orderBy('t.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }

//    public function findOneBySomeField($value): ?TxUsdt
//    {
//        return $this->createQueryBuilder('t')
//            ->andWhere('t.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
