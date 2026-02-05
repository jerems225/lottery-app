<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CountryType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\File;

class ProfileType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class)
            ->add('referrer', TextType::class, [
                'required' => false
            ])
            ->add('firstname', TextType::class, [
                'required' => false
            ])
            ->add('lastname', TextType::class, [
                'required' => false
            ])
            ->add('phone', TextType::class, [
                'required' => false
            ])
            ->add('country', CountryType::class, [
                'required' => false
            ])
            ->add('city', TextType::class, [
                'required' => false
            ])
            ->add('zip_code', TextType::class, [
                'required' => false
            ])
            ->add('avatar', FileType::class, [
                'label'  => 'Ajouter un avatar',
                'mapped' => false,
                'required' => false,
                'constraints' => [
                    new File([
                        'maxSize' => '2G',
                        'mimeTypes' => [
                            'image/jpg',
                            'image/jpeg',
                            'image/png',
                        ],
                        'mimeTypesMessage' => 'Uniquement Une Image',
                    ])
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
