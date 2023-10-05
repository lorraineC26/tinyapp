const findUserByEmail = function(email, users) {
  for (const userID in users) {
    let user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

module.exports = { findUserByEmail };