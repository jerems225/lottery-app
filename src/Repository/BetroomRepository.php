<?php

namespace App\Repository;

use App\Entity\Betroom;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Betroom>
 *
 * @method Betroom|null find($id, $lockMode = null, $lockVersion = null)
 * @method Betroom|null findOneBy(array $criteria, array $orderBy = null)
 * @method Betroom[]    findAll()
 * @method Betroom[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class BetroomRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Betroom::class);
    }

    public function save(Betroom $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Betroom $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }


//    public function findOneBySomeField($value): ?Betroom
//    {
//        return $this->createQueryBuilder('b')
//            ->andWhere('b.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
