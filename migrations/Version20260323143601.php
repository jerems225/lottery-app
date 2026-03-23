<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260323143601 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE betroom ADD created_by_id INT DEFAULT NULL, ADD is_private TINYINT(1) DEFAULT 0 NOT NULL, ADD min_participants INT DEFAULT NULL');
        $this->addSql('ALTER TABLE betroom ADD CONSTRAINT FK_86F5D4D3B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_86F5D4D3B03A8386 ON betroom (created_by_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE betroom DROP FOREIGN KEY FK_86F5D4D3B03A8386');
        $this->addSql('DROP INDEX IDX_86F5D4D3B03A8386 ON betroom');
        $this->addSql('ALTER TABLE betroom DROP created_by_id, DROP is_private, DROP min_participants');
    }
}
