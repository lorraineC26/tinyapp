const express = require("express");
const cookieParser = require('cookie-parser');
const { findUserByEmail } = require("./helper");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // convert the request body from a Buffer into string

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// browse registration page
app.get("/register", (req, res) => {
  res.render("register");
});

// add new user
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const { email, password } = req.body;
  users[userID] = {id: userID, email, password};
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);
  if (user) {
    if (user.password === password) {
      // Happy path: user exists and password matches
      res.cookie("user_id", user.id);
      return res.redirect("/urls");
    } else {
      // User exists but password does not match --> respond with an error
      return res.send("User exists but password does not match");
    }
  } else {
    // User does not exist --> respond with an error
    return res.redirect("/register");
  }
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  return res.redirect("/urls");
});

// browse all existing url
app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// browse page of adding new url
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

// add new url
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  const existedWeb = Object.values(urlDatabase);
  if (! existedWeb.includes(req.body.longURL)) { // check if the new url has existed
    urlDatabase[id] = req.body.longURL;
    return res.redirect(`/urls/${id}`);
  }
  return res.send("Your input has already existed.");

});

// redirect to long url page
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// delete existed url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  return res.redirect("/urls");
});

// read specific url
app.get("/urls/:id", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// edit existing url
app.post("/urls/edit/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newLongURL;
  return res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.send(urlDatabase);
});

app.get('/Hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

