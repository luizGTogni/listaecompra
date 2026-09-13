import { app } from '@/app.js';
import { API_URL_V1_BASE } from '@/config/env.js';
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js';
import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js';
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js';
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js';
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js';
import request from 'supertest';

describe('Create User Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await inMemoryShopperListMemberRepository.deleteAll()
    await inMemoryShopperItemRepository.deleteAll()
    await inMemoryShopperListRepository.deleteAll()
    await inMemoryCodeRepository.deleteAll()
    await inMemoryUserRepository.deleteAll()
  })

  afterAll(() => {
    app.close()
  })

  it('should be able to create a user', async () => {
    const data = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'contato.togni@gmail.com',
      password: '123456'
    }

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/users`)
      .send(data)

    expect(response.statusCode).toEqual(201)
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        name: data.name,
        username: data.username,
        email: data.email,
        verifiedAt: null,
        createdAt: expect.any(String)
      }
    })
  })
})
