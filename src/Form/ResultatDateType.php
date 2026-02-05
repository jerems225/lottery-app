<?php

namespace App\Form;

use App\Services\Betrooms\ticketService;
use DateTimeImmutable;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ResultatDateType extends AbstractType
{
    public function __construct(private ticketService $ticketService)
    {
    }
    
    private function listDate() : array
    {
        $dates = $this->ticketService->getAllResultsDate();
        $current_date = new DateTimeImmutable();
        $list_of_dates = [
            "Aujourd'hui" => $current_date->format('d M Y')
        ];
        foreach($dates as $date)
        {
            $choices_structure = [
                $date => $date
            ];

            $list_of_dates = array_merge($list_of_dates, $choices_structure);
        }

        return $list_of_dates;
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('result_date',ChoiceType::class,[
                'choices' => $this->listDate()
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            // Configure your form options here
        ]);
    }
}
