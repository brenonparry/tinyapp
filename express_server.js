const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xvn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "6h8dv3"
  },
  "9sm5xk": {
    longURL: "http://www.google.com",
    userID: "dd5ts4"
  }
}
const users = {
  "6h8dv3": {
    id: "6h8dv3", 
    email: "lloyd_christmas@DD.com", 
    password: "abc"
  },
 "dd5ts4": {
    id: "dd5ts4", 
    email: "harry_dunne@DD.com", 
    password: "123"
  }
}
const generateRandomString = function() {
  return Math.random().toString(20).substring(2, 8)
}
const checkUserEmail = (email) => {
  for(const id in users) {
    const user = users[id];
    if(user.email === email) {
      return user;
    }
  }
  return null;
}


// ROUTES
app.get("/urls/register", (req, res) => {
  const id = req.cookies.user_id
  const templateVars = { 
    user: users[id]
  };
  res.render("urls_register", templateVars);
});

app.post("/urls/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email
  const password = req.body.password
  const user = checkUserEmail(email);
  
  if (!email || !password) {
    return res.status(400).send("email and/or password cannot be blank!");
  }
  
  if(user){
    return res.status(400).send("user already exists")
  }

  users[id] = {
    id: id,
    email: email,
    password: password
  }

  res.cookie("user_id", id)
  res.redirect("/urls")
})

app.get("/urls", (req, res) => {
  const id = req.cookies.user_id
  const templateVars = { 
    urlDatabase: urlDatabase,
    user: users[id]
  }; 
  
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  const id = req.cookies.user_id
  // console.log("one: ", urlDatabase);
  // console.log("two: ", randomURL)
  // console.log("three: ", req.body.longURL)
  urlDatabase[randomURL] = {}
  urlDatabase[randomURL].longURL = req.body.longURL
  urlDatabase[randomURL].userID = id
  

  console.log("four: ", urlDatabase)
  res.redirect(`/urls/${randomURL}`);      
});

// NEW
app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id

  if(!id) {
    res.redirect("/urls/login");
  }

  const templateVars = {
    user: users[id]
  };
  
  res.render("urls_new", templateVars);
});

// POST login + cookie
// app.post('/urls/login', (req,res) => {
//   const user = req.body.username;
//   res.cookie('username', user);
//   res.redirect("/urls");
// });


// LOGIN
app.get("/urls/login", (req, res) => {
  const id = req.cookies.user_id
  const templateVars = { 
    user: users[id]
  }; 

  res.render('urls_login', templateVars);
});
app.post('/urls/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password;
  const user = checkUserEmail(email)

  if(!user){
    return res.status(400).send("incorect email")
  }
  if(user.password !== password) {
    return res.status(400).send('password does not match')
  }

  const id = user.id
  res.cookie("user_id", id)
  res.redirect("/urls");
});

// LOGOUT
app.post('/urls/logout', (req,res) => {
  res.clearCookie('user_id')
  res.redirect("/urls/login");
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies.user_id
  const shortURL = req.params.shortURL
  
  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    user: users[id]
  };
  // console.log(urlDatabase[shortURL].longURL)
  res.render("urls_show", templateVars);
});

// .get redirect => LONG URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  // console.log(urlDatabase)
  // console.log(urlDatabase[shortURL].longURL)
  
  res.redirect(longURL);
});

// "EDIT URL" POST
app.post('/urls/:shortURL', (req,res) => {
  const shortURL = req.params.shortURL
  // console.log("151")
  res.redirect(shortURL);
});

// "SUBMIT NEW LONG URL" POST
app.post('/urls/:shortURL/submit', (req,res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.newURL;
  console.log("one", req.params.shortURL)
  console.log("two", urlDatabase[shortURL])
  
  res.redirect("/urls");
});

// "DELETE URL" POST
app.post('/urls/:shortURL/delete', (req,res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

