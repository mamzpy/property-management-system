import { MigrationInterface, QueryRunner } from "typeorm";

export class InitPropertySchema1774197289990 implements MigrationInterface {
    name = 'InitPropertySchema1774197289990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "properties" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, "city" character varying NOT NULL, "state" character varying NOT NULL, "zipCode" character varying NOT NULL, "rentAmount" numeric(10,2) NOT NULL, "bedrooms" integer NOT NULL, "bathrooms" integer NOT NULL, "description" character varying, "status" character varying NOT NULL DEFAULT 'available', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "properties"`);
    }

}
