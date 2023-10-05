const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const findUserByEmail = function(email, usersDatabase) {
  for (const userID in usersDatabase) {
    let user = usersDatabase[userID];
    if (user.email === email) { // if input email is the same as the one in the database
      return user; // a spefic user object contain id, email, password
    }
  }
  return null;
};

// to verify if registration has been made previously
const authenticateUser = (email, usersDatabase, password) => {
  const user = findUserByEmail(email, usersDatabase);
  if (email === "" || password === "") {
    return { error: "Either your email or password is empty!", statusCode: 400, user: null};
  }
  if (user) {
    return { error: "Email registered already!", statusCode: 400, user: null };
  }
  
  return { error: null, statusCode: null, user};
};

//  returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = (loggedUserID, urlDatabase) => {
  const userSpecficURLs = {}; // same structure as urlDatabase but specific with users
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === loggedUserID) {
      userSpecficURLs[id] = urlDatabase[id];
    }
  }
  return userSpecficURLs;
};

module.exports = { generateRandomString, findUserByEmail, authenticateUser, urlsForUser };