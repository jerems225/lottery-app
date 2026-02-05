<?php

namespace App\Services\Overviews;

use App\Services\Betrooms\betroomService;
use App\Services\Betrooms\ticketService;
use App\Services\Users\UserService;
use App\Services\Wallets\txReqService;
use App\Services\Wallets\txUsdtService;

class OverviewService
{
    public function __construct(private betroomService $betroomService,
     private txUsdtService $txUsdtService,private txReqService $txReqService,private ticketService $ticketService,private UserService $userService)
    {
    }
    
    private function CompanyBalance() : array
    {
        $tickets_buy = $this->ticketService->getTicketsByUser();
        $losers = [];
        $winners = [];
        $business = 0;
        foreach($tickets_buy as $ticket)
        {
            if($ticket->getStatus() == "loser")
            {
                array_push($losers,$ticket);
            }
            elseif($ticket->getStatus() == "winner")
            {
                array_push($winners,$ticket);
            }

            $business = $ticket->getPrice();
        }

        $winners_awards = 0;
        foreach($winners as $winner)
        {
            $winners_awards = $winners_awards + $winner->getBetroom()->getAwards();
        }

        $gain = $business - $winners_awards;
        $awards = $winners_awards;

        return [
            "business" => $business, 
            "gain" => $gain, 
            "awards" => $awards
        ];
    }


    public function AllOverViews() : array
    {
        $betrooms = count($this->betroomService->allBetRoom());
        $txusdt_accepted = count($this->txUsdtService->getTxUsdtByStatus("acceptée"));
        $txusdt_canceled = count($this->txUsdtService->getTxUsdtByStatus("annulée"));
        $txreq_accepted = count($this->txReqService->getTxReqByStatus("acceptée"));
        $txreq_canceled = count($this->txReqService->getTxReqByStatus("annulée"));
        $tickets_buy = count($this->ticketService->getTicketsByUser());
        $winners = count($this->ticketService->getTicketsByStatus("winner"));
        $users_players = count($this->userService->getUserByTickets()[0]);
        $users_no_players = count($this->userService->getUserByTickets()[1]);
        $gain = $this->CompanyBalance()["gain"];
        $business = $this->CompanyBalance()["business"];
        $awards = $this->CompanyBalance()["awards"];
        

        $overviews = [
            "betrooms" => $betrooms,
            "txusdt_canceled" => $txusdt_canceled,
            "txusdt_accepted" => $txusdt_accepted,
            "txreq_canceled" => $txreq_canceled,
            "txreq_accepted" => $txreq_accepted,
            "tickets_buy" => $tickets_buy,
            "winners" => $winners,
            "users_players" => $users_players,
            "users_no_players" => $users_no_players,
            "business" => $business, 
            "gain" => $gain, 
            "awards" => $awards
        ];

        return $overviews;
    }
}