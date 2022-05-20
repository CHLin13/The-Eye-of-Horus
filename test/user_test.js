/* eslint-disable no-undef */
const { truncateFakeData, createFakeData } = require('./fake_data_generator');
const expect = require('chai').expect;
const userModel = require('../server/models/user_model');
const { NODE_ENV } = process.env;

before(async () => {
  if (NODE_ENV !== 'test') {
    throw 'Not in test env';
  }

  await truncateFakeData();
  await createFakeData();
});

describe('User model test', () => {
  it('GET Users', async function () {
    const user = await userModel.getUsers();
    expect(user[0].email).to.equal('super@example.com');
  });

  it('GET User', async () => {
    const user = await userModel.getUser(1);
    expect(user.email).to.equal('super@example.com');
  });

  it('POST User', async () => {
    await userModel.postUser(
      'test',
      'aaa@aaa.aaa',
      '$2a$10$gBpWQmhEzG3sdlv3ewx26.zOqk8FGlqUjLky5NWePB1aB32E2qNRW',
      0,
      1,
      []
    );
    const user = await userModel.getUsers();
    expect(user.length).to.equal(2);
  });

  it('PUT User', async () => {
    await userModel.postUser(
      'test',
      'super@example.com',
      '$2a$10$gBpWQmhEzG3sdlv3ewx26.zOqk8FGlqUjLky5NWePB1aB32E2qNRW',
      1,
      1,
      [],
      1
    );
    const user = await userModel.getUser(1);
    expect(user.name).to.equal('test');
  });

  it('DELETE User', async function () {
    await userModel.deleteUser(2);
    const user = await userModel.getUsers();
    expect(user.length).to.equal(1);
  });
});
