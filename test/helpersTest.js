const { assert } = require('chai');

const { checkUserEmail } = require('../helpers.js');


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


describe('checkUserEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkUserEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID)
  });

  it('should return null when the user doesnt exist', function() {
    const user2 = checkUserEmail("userNotReal@example.com", testUsers)
    const expectedUserID = null;
    assert.equal(user2, expectedUserID)
  })
});

