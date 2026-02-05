<?php

namespace App\Services\Users;

use App\Entity\Testimony;
use App\Entity\User;
use App\Repository\TestimonyRepository;

class TestimonyService
{
    public function __construct(TestimonyRepository $testimonyRepository)
    {
        $this->testimonyRepository = $testimonyRepository;
    }

    public function saveTestimony(Testimony $testimony) : void
    {
        if($testimony instanceof Testimony)
        {
            $this->testimonyRepository->save($testimony, true);
        }
    }

    public function getTestimonies() : array
    {
        return $this->testimonyRepository->findAll();
    }

    public function getTestimoniesByUser(User $user) : array
    {
        return $this->testimonyRepository->findByUser($user);
    }

    public function getTestimonyByStatus(Bool $status) : array
    {
        return $this->testimonyRepository->findByStatus($status);
    }

    public function removeTestimony(Testimony $testimony)
    {
        if($testimony instanceof Testimony)
        {
            $this->testimonyRepository->remove($testimony,true);
        }
    }
}