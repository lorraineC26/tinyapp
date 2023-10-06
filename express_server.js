const express = require("express");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, findUserByEmail, authenticateUser, urlsForUser } = require("./helpers");

const app = express();
const PORT = 8080;

// configuration
app.set('view engine', 'ejs');

// middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true })); // convert the request body from a Buffer into string
app.use(cookieSession({
  name: 'whateverUserID',
  keys: ["asdfasdf"],
}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {};

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  return res.redirect("/login");
});

// browse registration page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  if (req.session["user_id"]) { // when user is logged in
    return res.redirect("/urls");
  }

  return res.render("register", templateVars);
});

// add new user
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const password = req.body.password;
  const email = req.body.email;

  const result = authenticateUser(email, users, password);
  if (result.error !== null) {
    return res.status(400).send(result.error);
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  users[userID] = { id: userID, email, password: hashedPassword };
  req.session["user_id"] = userID;
  res.redirect("/urls");
});

// browse login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  return res.render("login", templateVars);
});

// login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      // Happy path: user exists and password matches
      req.session["user_id"] = user.id;
      return res.redirect("/urls");
    } else {
      // User exists but password does not match --> respond with an error
      return res.status(403).send("User exists but password does not match");
    }
  } else {
    // User does not exist --> respond with an error
    return res.status(403).send("User does not exist");
  }
});

// logout
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});

// browse all existing url
app.get("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    const templateVars = { user: null};
    return res.render("urls_index", templateVars);
  }
  // show only the current logged-in user's urls
  const userSpecficURLs = urlsForUser(req.session["user_id"], urlDatabase);
  const templateVars = { user: users[req.session["user_id"]], urls: userSpecficURLs };
  res.render("urls_index", templateVars);
});

// browse page of adding new url
app.get("/urls/new", (req, res) => {
  if (! req.session["user_id"]) { // when user is not logged in
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_new", templateVars);
});

// add new url
app.post("/urls", (req, res) => {
  if (! req.session["user_id"]) {
    return res.send("Please login in order to shorten URLs!");
  }

  const id = generateRandomString();
  // turn current longURLs into an array
  let existedWeb = [];
  for (const id in urlDatabase) {
    const longURL = urlDatabase[id].longURL;
    existedWeb.push(longURL);
  }
  // check if the new url has existed in our database
  if (! existedWeb.includes(req.body.longURL)) {
    urlDatabase[id] = {};
    urlDatabase[id]['longURL'] = req.body.longURL;
    urlDatabase[id]['userID'] = req.session['user_id'];
    return res.redirect(`/urls/${id}`);
  }
  return res.send("Your input has already existed.");
});

// redirect to long url page
app.get("/u/:id", (req, res) => {
  if (! urlDatabase[req.params.id]) {
    return res.send("Error: this shorten url does not exist!");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// delete existed url
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("Please login to delete URLs!");
  }
  const id = req.params.id;
  const userSpecficURLs = urlsForUser(req.session["user_id"], urlDatabase);
  const userOwnedShortURLs = Object.keys(userSpecficURLs);
  if (! userOwnedShortURLs.includes(id)) {
    return res.send("This short URL does not exist in your account!");
  }
  delete urlDatabase[id];
  return res.redirect("/urls");
});

// read specific url
app.get("/urls/:id", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("Please login to see this URL!");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("Error: this shorten url does not exist!");
  }

  const userSpecficURLs = urlsForUser(req.session["user_id"], urlDatabase);
  const userOwnedShortURLs = Object.keys(userSpecficURLs);
  if (! userOwnedShortURLs.includes(req.params.id)) {
    return res.send("Sorry, you do not own this URL :(");
  }

  const templateVars = {
    user: req.session["user_id"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]['longURL']
  };
  res.render("urls_show", templateVars);
});

// edit existing url
app.post("/urls/:id", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("Please login to edit URLs!");
  }
  const id = req.params.id;
  const userSpecficURLs = urlsForUser(req.session["user_id"], urlDatabase);
  const userOwnedShortURLs = Object.keys(userSpecficURLs);
  if (!userOwnedShortURLs.includes(id)) {
    return res.send("This short URL does not exist in your account!");
  }

  // turn current longURLs into an array
  let existedWeb = [];
  for (const id in urlDatabase) {
    const longURL = urlDatabase[id].longURL;
    existedWeb.push(longURL);
  }
  if (! existedWeb.includes(req.body.newLongURL)) {
    urlDatabase[id].longURL = req.body.newLongURL;
    return res.redirect("/urls");
  }
  return res.send("Your input has already existed.");
});