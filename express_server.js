const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xvn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "lloyd_christmas", 
    password: "abc"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "harry_dunne", 
    password: "123"
  }
}
const generateRandomString = function() {
  return Math.random().toString(20).substring(2, 8)
}


// ROUTES
app.get("/urls/register", (req, res) => {
  const templateVars = { 
    // shortURL: req.params.shortURL, 
    // longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render("urls_register", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username
  }; 
  // console.log("templateVars: ", templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);      
});

// POST login + cookie
app.post('/urls/login', (req,res) => {
  const user = req.body.username;
  res.cookie('username', user);
  res.redirect("/urls");
});

// POST LOGOUT
app.post('/urls/logout', (req,res) => {
  res.clearCookie('username')
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});

// .get redirect => LONG URL
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// "EDIT URL" POST
app.post('/urls/:shortURL', (req,res) => {
  const shortURL = req.params.shortURL
  res.redirect(shortURL);
});

// "SUBMIT NEW URL" POST
app.post('/urls/:shortURL/submit', (req,res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls");
});

// "DELETE URL" POST
app.post('/urls/:shortURL/delete', (req,res) => {
  const shortURL = req.params.shortURL
  console.log(shortURL);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

