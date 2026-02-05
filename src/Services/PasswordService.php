<?php

namespace App\Services;

use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PasswordService {
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    /**
     * Hash password service
     *
     * @param User $user
     * @param String $password
     * @return String
     */
    public function Hasher(User $user, String $password) : String
    {
        $Hash =  null;
        if($user instanceof User)
        {
            $Hash = $this->passwordHasher->HashPassword($user,$password);
        }

        return $Hash;
    }
}