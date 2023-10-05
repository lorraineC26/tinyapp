const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    const expectedUser = testUsers[expectedUserID];
    assert.deepEqual(user, expectedUser);
  });

  it('should return null when email is not in our database', function() {
    const user = findUserByEmail("lorraine@example.com", testUsers);
    const expectedUser = null;
    assert.deepEqual(user, expectedUser);
  });
});