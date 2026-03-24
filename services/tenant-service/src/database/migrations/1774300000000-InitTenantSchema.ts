import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTenantSchema1774300000000 implements MigrationInterface {
  name = 'InitTenantSchema1774300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" SERIAL NOT NULL,
        "userId" character varying NOT NULL,
        "propertyId" integer NOT NULL,
        "firstName" character varying,
        "lastName" character varying,
        "email" character varying,
        "phone" character varying,
        "emergencyContact" character varying,
        "emergencyPhone" character varying,
        "status" character varying NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}
