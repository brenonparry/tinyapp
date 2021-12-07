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
console.log(generateRandomString());
// ROUTES =>
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; 
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  
  res.send("Ok");        
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  if (!templateVars.longURL) {
    res.status(400).send("I got robbed by a sweet old lday on a motorized cart...and I didn't even see it coming");
    return;
  }
  res.render("urls_show", templateVars);
});

// app.get("/new", (req, res) => {
//   res.sendFile(photo);
// });

app.get("/", (req, res) => {
  res.send("A work in progress!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

