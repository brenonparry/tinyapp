const checkUserEmail = (email, database) => {
  for(const id in database) {
    const user = database[id];
    if(user.email === email) {
      return user;
    }
  }
  return null;
}

const generateRandomString = function() {
  return Math.random().toString(20).substring(2, 8)
}


module.exports = { checkUserEmail, generateRandomString };