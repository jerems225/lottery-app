<?php

namespace App\Services\Users;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Services\Betrooms\ticketService;

class UserService {
    public function __construct(private UserRepository $ur,private ticketService $ticketService)
    {

    }

    public function allUsers() : array 
    {
        $users = $this->ur->findAll();

        return $users;
    }

    public function findReferrer(String $referrer_code) : bool
    {
        $referrer  = $this->ur->findByReferralCode($referrer_code);
        if(count($referrer) > 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    /**
     * Save user in database
     *
     * @param User $user
     * @return void
     */
    public function SaveUser(User $user) : void
    {
        if($user instanceof User)
        {
            $this->ur->save($user,true);
        }
    }

    /**
     * Find User By Role
     *
     * @param string $role
     * @return array
     */
    public function listUserByRole(string $role) : array
    {
        
        $users = $this->ur->findAll();
        $admins = [];
        foreach($users as $u)
        {
            
            if($u->getRoles()[0] == $role)
            {
                array_push($admins,$u);
            }
        }

        return $admins;
    }

    /**
     * Remove User
     *
     * @param User $user
     * @return void
     */
    public function removeUser(User $user) : void
    {
        if($user instanceof User)
        {
            $this->ur->remove($user,true);
        }
    }

    public function getUserByTickets() : array
    {
        $users = $this->ur->findAll();
        $users_players = [];
        $users_no_players = [];
        foreach($users as $user)
        {
            if($user->getTickets()[0] != null)
            {
                array_push($users_players,$user);
            }
            else
            {
                array_push($users_no_players,$user);
            }
        }

        return [$users_players,$users_no_players];
    }

    public function getUserById(int $id) : array
    {
        return $this->ur->findById($id);
    }

    public function getUserByReferralCode(String $referrer_code)
    {
        return $this->ur->findByReferralCode($referrer_code);
    }

    public function getUserByReferrer(String $referral_code) : array
    {
        $users = $this->ur->findByReferrer($referral_code);
        $filleuls = [];
        if(count($users) > 0)
        {
            foreach($users as $user)
            {
                $tickets = $this->ticketService->getTicketsByUserWinner($user,'winner');
                $gain_user = 0;
                $referrer_gain = 0;
                if($tickets)
                {
                    foreach($tickets as $ticket)
                    {
                        $gain_user = $gain_user + $ticket->getBetroom()->getAwards();
                    }
                }

                $filleul = [];

                if($gain_user > 0)
                {
                    $referrer_gain = ($gain_user * 10)/100;
                    $filleul = [
                        "pseudo" => $user->getPseudo(),
                        "email" => $user->getEmail(),
                        "numWin" => count($tickets),
                        "gain_user" => $gain_user,
                        "gain_referrer" => $referrer_gain
                    ];
                }

                array_push($filleuls, $filleul);
            }
        }

        return $filleuls;
    }

    public function getUserByEmail(String $email) : array
    {
        return $this->ur->findByEmail($email);
    }


    /**
     * Update user password
     *
     * @param User $user
     * @param string $hash
     * @return void
     */
    public function UserUpgradePassword(User $user, string $hash) : void
    {
        if($user instanceof User)
        {
            $this->ur->upgradePassword($user,$hash);
        }
    }

    /**
     * Generate Random String
     *
     * @param integer $_limit
     * @return String
     */
    public function generateReferralCode($_limit) : String
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        
        do{
            for ($i = 0; $i < $_limit; $i++) {
                $index = rand(0, strlen($characters) - 1);
                $randomString .= $characters[$index];
            }

            $user = $this->ur->findByReferralCode($randomString);

        }while($user);

        return $randomString;
    }
}