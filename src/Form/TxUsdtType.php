<?php

namespace App\Form;

use App\Entity\TxUsdt;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\GreaterThanOrEqual;

class TxUsdtType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('address',TextType::class,[
                'required' => true
            ])
            ->add('amount',MoneyType::class,[
                'currency' => "USD",
                'invalid_message' => "Le montant doit être un nombre, ex: 10",
                'constraints' => [
                    new GreaterThanOrEqual([
                        'value' => 50, // set the minimum value here
                        'message' => 'Le montant du rechargement doit être supérieur ou égal a 50 USDT ERC20',
                    ])
                ]
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => TxUsdt::class,
        ]);
    }
}
