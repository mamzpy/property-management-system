import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { RabbitMQService } from '@pms/shared/rabbitmq/rabbitmq.service';
import { DataSource } from 'typeorm';

describe('Booking Service (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Keep mock so tests don't need real rabbit connection
      .overrideProvider(RabbitMQService)
      .useValue({
        publish: jest.fn().mockResolvedValue(undefined),
        subscribe: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  // ✅ CLEAN DB BEFORE EACH TEST (REAL-WORLD E2E STYLE)
  beforeEach(async () => {
    // outbox first, then bookings
    await dataSource.query('TRUNCATE TABLE outbox_events CASCADE;');
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

    expect(res.body.id).toBeDefined();
  });

  /**
   * WORKFLOW TEST (Real company style with Outbox)
   * create → approve → verify outbox row exists
   */
  it('workflow: create -> approve should update status and create outbox event', async () => {
    // 1) create booking
    const created = await request(app.getHttpServer())
      .post('/bookings')
      .set('x-user-id', 'tenant-123')
      .set('x-correlation-id', 'e2e-wf-1')
      .send({ propertyId: 10 })
      .expect(201);

    const bookingId = created.body.id;
    expect(bookingId).toBeDefined();
    expect(created.body.status).toBe('pending');

    // 2) approve booking
    const approved = await request(app.getHttpServer())
      .patch(`/bookings/${bookingId}/approve`)
      .set('x-user-id', 'admin-1')
      .set('x-correlation-id', 'e2e-wf-1')
      .expect(200);

    expect(approved.body.status).toBe('approved');
    expect(approved.body.approvedBy).toBe('admin-1');
    expect(approved.body.approvedAt).toBeDefined();

    // 3) assert OUTBOX row created (instead of publish called)
    const rows = await dataSource.query(
  `SELECT "eventType", "aggregateId", status, payload
   FROM outbox_events
   WHERE "eventType" = $1 AND "aggregateId" = $2
   LIMIT 1`,
  ['booking.approved', bookingId],
);

expect(rows.length).toBe(1);
expect(rows[0].eventType).toBe('booking.approved');
expect(rows[0].aggregateId).toBe(bookingId);
expect(rows[0].status).toBe('pending');

expect(rows[0].payload).toEqual(
  expect.objectContaining({
    bookingId,
    tenantId: 'tenant-123',
    propertyId: 10,
    correlationId: 'e2e-wf-1',
  }),
);
  });
});