import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { RabbitMQService } from '@shared/rabbitmq/rabbitmq.service';
import { DataSource } from 'typeorm';

describe('Booking Service (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let rabbitMq: { publish: jest.Mock; subscribe: jest.Mock };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RabbitMQService)
      .useValue({
        publish: jest.fn().mockResolvedValue(undefined),
        subscribe: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    rabbitMq = app.get(RabbitMQService) as any;
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE bookings CASCADE;');
  });

  afterAll(async () => {
  if (app) {
    await app.close();
  }
});

  it('/bookings/health (GET) should return 200', () => {
    return request(app.getHttpServer()).get('/bookings/health').expect(200);
  });

  it('/bookings (GET) should return 200', () => {
    return request(app.getHttpServer()).get('/bookings').expect(200);
  });

  it('/bookings (POST) should create a booking and return it', async () => {
    const res = await request(app.getHttpServer())
      .post('/bookings')
      .set('x-user-id', 'tenant-123')
      .set('x-correlation-id', 'e2e-test-1')
      .send({ propertyId: 10 })
      .expect(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        propertyId: 10,
        tenantId: 'tenant-123',
        status: 'pending',
      }),
    );
  });

  /**
   * WORKFLOW TEST
   * create → approve → verify publish()
   */
  it('workflow: create -> approve should update status and publish event', async () => {
    // 1) create
    const created = await request(app.getHttpServer())
      .post('/bookings')
      .set('x-user-id', 'tenant-123')
      .set('x-correlation-id', 'e2e-wf-1')
      .send({ propertyId: 10 })
      .expect(201);

    const bookingId = created.body.id;
    expect(created.body.status).toBe('pending');

    // 2) approve
    const approved = await request(app.getHttpServer())
      .patch(`/bookings/${bookingId}/approve`)
      .set('x-user-id', 'admin-1')
      .set('x-correlation-id', 'e2e-wf-1')
      .expect(200);

    expect(approved.body.status).toBe('approved');
    expect(approved.body.approvedBy).toBe('admin-1');
    expect(approved.body.approvedAt).toBeDefined();

    // 3) assert publish()
    expect(rabbitMq.publish).toHaveBeenCalledWith(
      'booking',
      'booking.approved',
      expect.objectContaining({
        bookingId,
        tenantId: 'tenant-123',
        propertyId: 10,
        correlationId: 'e2e-wf-1',
      }),
    );
  });
});