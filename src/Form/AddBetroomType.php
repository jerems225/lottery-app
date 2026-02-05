<?php

namespace App\Form;

use App\Entity\Betroom;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AddBetroomType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('num_betroom',TextType::class)
            ->add('max_ticket',IntegerType::class)
            ->add('awards',MoneyType::class,[
                'currency' => "USD",
                'invalid_message' => "Le montant doit être un nombre, ex: 10"
            ])
            ->add('ticket_price',MoneyType::class,[
                'currency' => "USD",
                'invalid_message' => "Le montant doit être un nombre, ex: 10"
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Betroom::class,
        ]);
    }
}
