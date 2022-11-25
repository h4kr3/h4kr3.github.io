const { response } = require('express');
var express = require('express');
const session = require('express-session');
const { LoggerLevel } = require('mongodb');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')

/* GET home page. */
router.get('/', loggedin,function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/login',loggedin,function(req, res, next) {
  res.render('login', { title: 'Express' });
});


router.get('/signup',loggedin,function(req, res, next) {
  res.render('signup', { title: 'Express' });
});


router.get('/userhome',loggedout,function(req, res, next) {
  let user = req.session.user
  console.log(user);
  res.render('userhome', {user});
});

router.get('/adminhome',adminloggedout,function(req, res, next) {
  let user = req.session.admin
  console.log(user);
  res.render('adminhome', {user});
});

router.get('/admin',adminloggedin,function(req, res, next) {
  res.render('adminlogin');
});

router.get('/admin_user_signup',adminloggedout,function(req, res, next) {
  res.render('admin_user_signup');
});

router.post('/submit',(req,res) => {
    userHelpers.doSignup(req.body).then((response)=>{
      if(response){
        console.log(response);
        console.log('HAIII');
      res.redirect('/login')
      }
      else{
        console.log('signup failed in index');
        res.render('signup',{title:'LogIn',invalid:"Email already exists"})
      }
    })
})


router.post('/signin',(req,res)=>{

      userHelpers.doLogin(req.body).then((response)=>{
        if(response.status){
          req.session.userLoggedIn = true
          req.session.user = response.user
         res.redirect('/userhome')
        }else{
          //res.redirect('/login')
          res.render('login',{title:'LogIn',invalid:"Incorrect Username or Password"})
        }
      })
})

router.post('/asignin',(req,res)=>{
  userHelpers.doAdminLogin(req.body).then((response)=>{
    if(response.status){
      req.session.adminLoggedIn = true
      req.session.admin = response.admin
      res.redirect('/adminhome')
    }else{
      //res.redirect('/admin')
      res.render('adminlogin',{title:'LogIn',invalid:"Incorrect Username or Password"})
    }
  })
})

router.get('/admin_user_view',adminloggedout,async(req,res)=>{
  console.log("please")
  let data = await userHelpers.viewUser()
  console.log(data)
    res.render('admin_user_view',{data})
})


router.get('/logout',(req,res)=>{
  req.session.userLoggedIn=false
  //res.redirect('/')
  res.render('login', { title: "Logout", logout : "logout Successfull"})
})
router.get('/alogout',(req,res)=>{
  req.session.adminLoggedIn=false
  //res.redirect('/admin')
  res.render('adminlogin', { title: "Logout", logout : "logout Successfull"})
})

router.get('/udelete',adminloggedout,async(req,res)=>{
  let userId=req.query.userId
  await userHelpers.deleteUser(userId)
  res.redirect('/admin_user_view')
})

function loggedout(req,res,next){
  if(req.session.userLoggedIn){
    next()
  }else{
    
    res.redirect('/login')
  }

}
function adminloggedout(req,res,next){
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin')
  }

}

function loggedin(req,res,next){
  if(req.session.userLoggedIn){
    res.redirect('/userhome')
  }else{
    next()
  }

}
function adminloggedin(req,res,next){
  if(req.session.adminLoggedIn){
    console.log('123455');
    res.redirect('/adminhome')
  }else{
    next()
  }

}


router.post('/ucreate',(req,res)=>{
  console.log('ucreate')
  //userHelpers.addUser(req.body)
  userHelpers.addUser(req.body).then((response)=>{
    if(response){
      console.log(response);
    //res.redirect('/login')
    res.render('adminhome',{title:'LogIn',invalid:"User Ctreated"})
    }
    else{
      console.log('signup failed in index');
      res.render('admin_user_signup',{title:'LogIn',invalid:"Email already exists"})
    }
  })
})





module.exports = router;
