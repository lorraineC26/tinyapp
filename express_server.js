const express = require("express");
const cookieParser = require('cookie-parser');
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

const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

// login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  return res.redirect("/urls");
});

// browse
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
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

// delete
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  return res.redirect("/urls");
});

// read
app.get("/urls/:id", (req, res) => {
  const templateVars = { username: req.cookies["username"], id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// edit
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

