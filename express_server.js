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
    keys: ["I was robbed by a sweet old lady", "I didn't even see it coming"],
  })
);

// URL DATABASE
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
// USER DATABASE
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
app.get("/", (req, res) => {
  res.redirect("/urls/")
});

app.get("/urls/register", (req, res) => {
  const id = req.session.id
  const templateVars = { 
    user: users[id]
  };
  res.render("urls_register", templateVars);
});

app.post("/urls/register", (req, res) => {
  const id = generateRandomString() // calling helper function
  const email = req.body.email
  const password = req.body.password
  const user = checkUserEmail(email, users); // calling helper function
  
  if (!email || !password) { // Checking for blank fields 
    return res.status(400).send("email and/or password cannot be blank!");
  }
  if(user){ // Checking for existing user
    return res.status(400).send("user already exists")
  }
  // create hashed password
  const hashedPassword = bcrypt.hashSync(password, 10);
  // create new user for
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  }
  // cookie time!
  req.session.id = id
  res.redirect("/urls")
})

//-----------------------------------------------//

// GENERAL
app.get("/urls", (req, res) => {
  const id = req.session.id;
  const user = users[id]
  const urls = urlsForUser(id) // calling helper function 

  const templateVars = {
    urls,
    user
  }; 
  
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString(); // calling helper function
  const id = req.session.id

  urlDatabase[randomURL] = {}
  urlDatabase[randomURL].longURL = req.body.longURL
  urlDatabase[randomURL].userID = id
  
  res.redirect(`/urls/${randomURL}`);      
});

// CREATE NEW URL
app.get("/urls/new", (req, res) => {
  const id = req.session.id

  if(!id) { // checking for valid user id
   return res.redirect("/urls/login");
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
  
  if(!user){ // Checking for existing user email
    return res.status(400).send("incorect email")
  }

  const userPassword = user.password
  const passwordMatching = bcrypt.compareSync(password, userPassword);

  if (!passwordMatching) { // checking for existing user password
    return res.status(400).send("password does not match")
  }
  
  const id = user.id
  // cookie time!
  req.session.id = id;
  res.redirect("/urls");
});

// LOGOUT & DELETE COOKIE
app.post('/urls/logout', (req,res) => {
  req.session = null; // delete the cookie
  res.redirect("/urls/login");
});

//---------------------------------------------//

// URLs SHOW
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.id
  const shortURL = req.params.shortURL
  
  if(id !== urlDatabase[shortURL].userID) { // Checking if requesting user matches url owner
    return res.status(403).send("ah ah ah, that doesnt belong to you!")
  }

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
  urlDatabase[shortURL].longURL = req.body.newURL

  res.redirect("/urls");
});

// "EDIT URL" POST
app.post('/urls/:shortURL', (req,res) => {
  const shortURL = req.params.shortURL
  
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


