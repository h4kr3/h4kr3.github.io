const express = require("express");
const path=require("path");
const app = express();
const sessions = require("express-session");

//credential defined here
const  credential = {
    email : "admin@gmail.com",
    password : "123",
}


app.set('view engine', 'ejs');

//load static assets
app.use('/static', express.static(path.join(__dirname, 'public')))


//taking the json format data for parsing
app.use(express.json());

//checking data is string,array or object for converting
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, private,no-store,must-revalidate,max-stale=0,pre-check=0')
    next()
})

app.use(
    sessions({
        secret: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
        resave: false,
        saveUninitialized: false,
    }))


    //routeing to index
app.get("/",NotLogIn, (req, res) => {   
    res.render("index")
})


//athutication checking
app.post("/login", (req, res) => {
    if(req.body.email == credential.email && req.body.password == credential.password){
        req.session.userAuthorized=true;
        req.session.user = req.body.email;
        res.redirect('/home');
        //res.end("Login Successful...!");
    }else{

        //printing the invalid credentials in login
        res.render('login',{title:'LogIn',invalid:"Incorrect Username or Password"})
    }
})


//if user logged in and try to go back to login page it will prevent here
app.get("/login",NotLogIn, (req, res) => {
    res.render("login.ejs")
})

//if user didnt log in and try to go directly to homepage it will prevent here
app.get("/home",isLogIn, (req, res) => {
    res.render('home', {title: "Home Page",user : req.session.user})
        //console.log(req.session.user);

})

//logout
app.get('/logout',isLogIn,(req,res)=>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("Error")
        }else{
            //printing the logout info in login page
            res.render('login', { title: "Logout", logout : "logout Successfull"})
        }
    })
})
//function for checking user logged in or out
function isLogIn(req,res,next){
    if(req.session.userAuthorized){
        next()
    }else{
        res.redirect('/login')
    }
}
//function for checking if user log in the session is true it will not redirect to login
function NotLogIn (req,res,next){
    if(req.session.userAuthorized){
        res.redirect('/home')
   }else{
       next()
   }
}


app.listen(3000,() => {
    console.log('listening to the server on http://localhost:3000');})
