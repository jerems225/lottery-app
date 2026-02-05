<?php

namespace App\Form;

use App\Entity\TxReq;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CountryType;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class TxReqType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('payment_type',ChoiceType::class,[
                'choices' => [
                    'VIREMENT BANCAIRE' => 'VIREMENT BANCAIRE',
                    'BITCOIN' => 'BITCOIN',
                    'ETHEREUM' => 'ETHEREUM',
                    'ORANGE MONEY' => 'ORANGE MONEY',
                    'MTN MONEY' => 'MTN MONEY',
                    'MOOV MONEY' => 'MOOV MONEY',
                    'WAVE CI/SN' => 'WAVE CI/SN'
                ]
            ])
            ->add('amount',MoneyType::class,[
                'currency' => "USD",
                'invalid_message' => "Le montant doit être un nombre, ex: 10"
            ])
            ->add('country',CountryType::class)
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => TxReq::class,
        ]);
    }
}
