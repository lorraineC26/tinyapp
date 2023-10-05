const express = require("express");
const cookieParser = require('cookie-parser');
const { generateRandomString, findUserByEmail, authenticateUser } = require("./helper");
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

// browse registration page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

// add new user
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const { email, password } = req.body;

  // if (email === "" || password === "") {
  //   return res.status(400).send("Error: either your email or password is empty!");
  // }
  // const user = findUserByEmail(email, users);
  // if (user) {
  //   return res.status(400).send("Error: email registered already!");
  // }

  // users[userID] = {id: userID, email, password};

  const result = authenticateUser(email, users, password);
  if (result.error !== null) {
    return res.status(400).send(result.error);
  }
  users[userID] = { id: userID, email, password };
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// browse login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
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
      return res.status(403).send("User exists but password does not match");
    }
  } else {
    // User does not exist --> respond with an error
    return res.status(403).send("User does not exist");
  }
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  return res.redirect("/login");
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
  const existedWeb = Object.values(urlDatabase);
  if (!existedWeb.includes(req.body.newLongURL)) {
    urlDatabase[id] = req.body.newLongURL;
    return res.redirect("/urls");
  }
  return res.send("Your input has already existed.");
});


app.get("/urls.json", (req, res) => {
  res.send(urlDatabase);
});

app.get('/Hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

