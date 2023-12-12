/* eslint-disable prettier/prettier */
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AppModule } from 'src/app.module';

describe('OrganisationController (E2E)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST organisations', async () => {
    const postData = {
      name: 'New Organisation',
      logoId: 1,
    };

    const authHeader = 'Basic ' + Buffer.from('1').toString('base64');
    const response = await request(app.getHttpServer())
      .post('/organisations')
      .send(postData)
      .set('Authorization', authHeader);

    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('/DELETE organisations/:id', async () => {
    const organizationId = 1;

    const authHeader = 'Basic ' + Buffer.from('1').toString('base64');

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/organisations/${organizationId}`)
      .set('Authorization', authHeader);

    expect(deleteResponse.status).toBe(HttpStatus.OK);
  });
});
