const { response } = require("express");
var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/user-helpers");//in user helper writind the mongo db commands delting insering checking

/* GET home page. */
router.get("/", loggedin, function (req, res, next) {
  res.render("index", { title: "Express" });
});
///routing login signup
router.get("/login", loggedin, function (req, res, next) {
  res.render("login", { title: "Express" });
});
///routing user signup
router.get("/signup", loggedin, function (req, res, next) {
  res.render("signup", { title: "Express" });
});
///routing user home
router.get("/userhome", loggedout, function (req, res, next) {
  let user = req.session.user;

  res.render("userhome", { user });
});


///routing admin home
router.get("/adminhome", adminloggedout, function (req, res, next) {
  let user = req.session.admin;

  res.render("adminhome", { user });
});
///routing admin 
router.get("/admin", adminloggedin, function (req, res, next) {
  res.render("adminlogin");
});
///routing admin signup
router.get("/admin_user_signup", adminloggedout, function (req, res, next) {
  res.render("admin_user_signup");
});


////////user signup
router.post("/submit", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    if (response) {

      res.redirect("/login");
    } else {

      res.render("signup", { title: "LogIn", invalid: "Email already exists" });
      //res.redirect("/signup");
    }
  });
});


///////user sign in

router.post("/signin", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.userLoggedIn = true;
      req.session.user = response.user;
      res.redirect("/userhome");
    } else {
      //res.redirect('/login')
      res.render("login", {
        title: "LogIn",
        invalid: "Incorrect Username or Password",
      });
    }
  });
});


//////admin sign in

router.post("/asignin", (req, res) => {
  userHelpers.doAdminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/adminhome");
    } else {
      //res.redirect('/admin')
      res.render("adminlogin", {
        title: "LogIn",
        invalid: "Incorrect Username or Password",
      });
    }
  });
});


//////admin can view users list

router.get("/admin_user_view", adminloggedout, async (req, res) => {
  let error = false;
  error = req.session.userDeleted;
  req.session.userDeleted = false;
  let data = await userHelpers.viewUser();
  res.render("admin_user_view", { data,error});
});
/////admin user edit view
router.get("/admin_user_edit", adminloggedout, async (req, res) => {
  let error = false;
  error2 = req.session.userUpdated;
  req.session.userUpdated = false;
  let data = await userHelpers.viewUser();
  res.render("admin_user_edit", { data,error2});
});


///////user logout
router.get("/logout", (req, res) => {
  req.session.userLoggedIn = false;
  //res.redirect('/')
  res.render("login", { title: "Logout", logout: "logout Successfull" });
});


//////admin log out
router.get("/alogout", (req, res) => {
  req.session.adminLoggedIn = false;
  //res.redirect('/admin')
  res.render("adminlogin", { title: "Logout", logout: "logout Successfull" });
});

//////////////admin can delte user

router.get("/udelete", adminloggedout, async (req, res) => {
  let userId = req.query.userId;
  await userHelpers.deleteUser(userId);
  req.session.userDeleted = true;
  res.redirect("/admin_user_view");
  // res.render('admin/_user_view',{invalid:userId+'_id is deleted'})
});



///////////admin user creating

router.post("/ucreate",adminloggedout, (req, res) => {

  //userHelpers.addUser(req.body)
  userHelpers.addUser(req.body).then((response) => {
    if (response) {

      //res.redirect('/login')
      res.render("adminhome", { title: "LogIn", invalid: "User Ctreated" });
    } else {

      res.render("admin_user_signup", {
        title: "LogIn",
        invalid: "Email already exists",
      });
    }
  });
});

////////edit user

  router.get('/uedit1/:id',async(req,res)=>{
    let user=await userHelpers.getUserDetails(req.params.id)

    res.render('admin_user_edit',{user})
  })

/////////update user

// router.post('/uedit/:id',(req,res) => {
//   let userId = req.query.userId;
//   userHelpers.editUserDetails(userId,req.body).then((response)=>{

//     req.session.userUpdated = true;
//     res.redirect('/admin_user_view')
//   })
// })

router.post("/uedit",adminloggedout,async(req, res) => {
  let userId = req.query.userId;
  let stat = await userHelpers.updateUser(userId, req.body)
  if(stat.status){
    res.redirect('/admin_user_view');
  
  }else{
    res.render("admin_user_view", {
      title: "LogIn",
      invalid: "Email already exists",
    });
  }
    
})





///////////search user

router.post('/search', (req, res) => {
  userHelpers.searchUser(req.body).then((userData) => {
    console.log(userData);
    if (userData[0]) {
      res.render('admin_user_search', { userData })
    }
    else {
      res.send('<h1>No user Found</h1>');
    }
  })
})






///////////////middle wares

function loggedout(req, res, next) {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
}
function adminloggedout(req, res, next) {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
}

function loggedin(req, res, next) {
  if (req.session.userLoggedIn) {
    res.redirect("/userhome");
  } else {
    next();
  }
}
function adminloggedin(req, res, next) {
  if (req.session.adminLoggedIn) {

    res.redirect("/adminhome");
  } else {
    next();
  }
}


module.exports = router;
