const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');
const cookieSession = require("cookie-session");
const { checkUserEmail, generateRandomString } = require('./helpers')


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(cookieSession({
    name: "session",
    keys: ["I was robbed by a sweet old lady", "I didn't eve see it coming"],
  })
);

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

const urlsForUser = (id) => {
  const userUrls = {};
  for(const key in urlDatabase) {
    const userID = urlDatabase[key].userID
    if (userID === id) {
      userUrls[key] = urlDatabase[key]
      
    }
  }
  return userUrls;
}

// ROUTES =>

// REGISTER
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
  const user = checkUserEmail(email, users);
  
  if (!email || !password) {
    return res.status(400).send("email and/or password cannot be blank!");
  }
  
  if(user){
    return res.status(400).send("user already exists")
  }
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  }

  // res.cookie("user_id", id)
  req.session.id = id
  res.redirect("/urls")
})

//-----------------------------------------------//

// GENERAL
app.get("/urls", (req, res) => {
  const id = req.session.id;
  const user = users[id]
  const urls = urlsForUser(id)

  const templateVars = {
    urls,
    user
  }; 
  
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  const id = req.session.id

  urlDatabase[randomURL] = {}
  urlDatabase[randomURL].longURL = req.body.longURL
  urlDatabase[randomURL].userID = id
  
  res.redirect(`/urls/${randomURL}`);      
});

// CREATE NEW URL
app.get("/urls/new", (req, res) => {
  const id = req.session.id

  if(!id) {
    res.redirect("/urls/login");
  }

  const templateVars = {
    user: users[id]
  };
  
  res.render("urls_new", templateVars);
});

//---------------------------------------------//

// LOGIN && LOGOUT
app.get("/urls/login", (req, res) => {
  const id = req.session.id
  const templateVars = { 
    user: users[id]
  }; 

  res.render('urls_login', templateVars);
});

app.post('/urls/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password;
  const user = checkUserEmail(email, users)
  
  if(!user){
    return res.status(400).send("incorect email")
  }

  const userPassword = user.password
  const passwordMatching = bcrypt.compareSync(password, userPassword);

  if (!passwordMatching) {
    return res.status(400).send("password does not match")
  }
  
  const id = user.id
  req.session.id = id
  res.redirect("/urls");
});

app.post('/urls/logout', (req,res) => {
  // res.clearCookie('user_id')
  delete req.session.id
  res.redirect("/urls/login");
});

//---------------------------------------------//

// URLS SHOW
app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies.user_id
  const shortURL = req.params.shortURL
  
  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    user: users[id]
  };

  res.render("urls_show", templateVars);
});

// Redirect => LONG URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  
  res.redirect(longURL);
});


// "SUBMIT NEW LONG URL" POST
app.post('/urls/:shortURL/submit', (req,res) => {
  const shortURL = req.params.shortURL
  // const id = req.cookies.user_id
  console.log("I entered submit")
  // urlDatabase[shortURL] = {}
  urlDatabase[shortURL].longURL = req.body.newURL
  // urlDatabase[shortURL].userID = id
 
  res.redirect("/urls");
});

// "EDIT URL" POST
app.post('/urls/:shortURL', (req,res) => {
  const shortURL = req.params.shortURL
  console.log("shortURL: ", shortURL)
  res.redirect(shortURL);
});

// "DELETE URL" POST
app.post('/urls/:shortURL/delete', (req,res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


