<?php

namespace App\Form;

use App\Entity\Withdrawal;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CountryType;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class WithdrawalType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('payment_type', ChoiceType::class, [
                'choices' => [
                    'VIREMENT BANCAIRE' => 'VIREMENT BANCAIRE',
                    'CRYPTO-MONNAIE' => 'CRYPTO-MONNAIE',
                    'MOBILE MONEY' => 'MOBILE MONEY',
                ]
            ])
            ->add('amount', MoneyType::class, [
                'currency' => "USD",
                'invalid_message' => "Le montant doit être un nombre, ex: 10"
            ])
            ->add('id_card', TextType::class, [
                'required' => false
            ])
            ->add('bank', TextType::class, [
                'required' => false
            ])
            ->add('bank_country', CountryType::class, [
                'required' => false
            ])
            ->add('crypto_name', TextType::class, [
                'required' => false
            ])
            ->add('wallet_address', TextType::class, [
                'required' => false
            ])
            ->add('momo_operator', TextType::class, [
                'required' => false
            ])
            ->add('phone', TextType::class, [
                'required' => false
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Withdrawal::class,
        ]);
    }
}
