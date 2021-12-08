const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xvn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

const generateRandomString = function() {
  return Math.random().toString(20).substring(2, 8)
}
// console.log(generateRandomString());
// ROUTES =>
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; 
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);      
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// SHORT URL LINK TO LONG URL
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// EDIT URL
app.post('/urls/:shortURL', (req,res) => {
  const shortURL = req.params.shortURL
  res.redirect(shortURL);
});

// SUBMIT NEW URL
app.post('/urls/:shortURL/submit', (req,res) => {
  const shortURL = req.params.shortURL
  // console.log(shortURL);
  // console.log(req.body);
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls");
});

// DELETE URL
app.post('/urls/:shortURL/delete', (req,res) => {
  const shortURL = req.params.shortURL
  console.log(shortURL);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// '/' HOME PAGE
app.get("/", (req, res) => {
  res.send("A work in progress!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

