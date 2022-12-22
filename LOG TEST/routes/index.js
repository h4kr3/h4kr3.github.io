const { response } = require("express");
var express = require("express");
const { LoggerLevel } = require("mongodb");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const client = require("twilio")(
  "AC170d14332c8da0ab64d54de6341a435f",
  "776f1b2042128947865c70f4a31f9874"
);

/* GET home page. */
router.get("/", async (req, res, next) => {
  let category = await productHelper.getAllCategory();
  let products = await productHelper.getAllProducts();

  if (req.session.userLoggedIn){
    let cartCount = await productHelper.cartCount(req.session.user._id)
    res.render("user/index", { usersi: true, category ,cartCount,products});
  }
   
  else {
    res.render("user/index", { usersi: false, category ,products});
  }
});

// xxxxxxxxxxxxxxxxxxxx home page end here xxxxxxxxxxxxxxxxxxxx



router.get("/signin", loggedin, function (req, res, next) {
  res.render("user/signin", { userlogin: true });
});

router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    if (response) {
      res.render("user/signin", {
        title: "LogIn",
        logout: "Account Created You Need To Login Now",
      });
    } else {
      res.render("user/signin", {
        title: "LogIn",
        invalid: "Email already exists",
      });
    }
  });
});

router.post("/signin", async(req, res) => {
  let category = await productHelper.getAllCategory();
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.userLoggedIn = true;
      req.session.user = response.user;
      user = req.session.user;
      if (user.status) {
        res.redirect('/')
      } else {
        res.render("user/signin", {
          title: "LogIn",
          status: "Sorry Your Account Is Blocked",
        });
      }
    } else {
      res.render("user/signin", {
        title: "LogIn",
        invalid: "Incorrect Username or Password",
      });
    }
  });
});

router.get("/product-list/:id", async function (req, res, next) {
  let category = await productHelper.getCategoryDetails(req.params.id);

  productHelper.getProductByCat(req.params.id).then(async(products) => {
    if (req.session.userLoggedIn) {
      let cartCount = await productHelper.cartCount(req.session.user._id)
      res.render("user/product-list", { usersi: true, products, category ,cartCount});
    } else {
      res.render("user/product-list", { usersi: false, products, category });
    }
  });
});

router.get("/logout", (req, res) => {
  
  req.session.userLoggedIn = false;
  res.redirect('/')
  // res.render("user/index", { title: "Logout", logout: "logout Successfull",category });
});

router.get("/otp-login", loggedin, (req, res) => {
  res.render("user/otp-login", { not: true });
});

router.post("/otp-login", loggedin, (req, res) => {
  userHelpers
    .otpLogin(req.body)
    .then((response) => {
      let phone = response.user.phone;
      client.verify
        .services("VA92277d46143755e4ba0ba6dec7cdc8d7")
        .verifications.create({
          to: `+91${phone}`,
          channel: "sms",
        })
        .then((data) => {
          req.session.user = response.user;
          res.render("user/otp-verification", { phone, not: true });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((response) => {
      res.render("user/otp-login", { invalid: "Mobile Number Not Found" });
      // res.redirect('/signin')
    });
});

router.get("/otp-verification", loggedin, (req, res) => {
  res.render("user/otp-verification", { not: true });
});

router.post("/otp-verification", loggedin, (req, res) => {
  client.verify
    .services("VA92277d46143755e4ba0ba6dec7cdc8d7")
    .verificationChecks.create({
      to: `+91${req.body.mobile}`,
      code: req.body.otp,
    })
    .then((data) => {
      if (data.valid) {
        req.session.userLoggedIn = true;
        res.redirect("/");
      } else {
        delete req.session.user;
        res.render("user/otp-verification", {
          invalid: "Ivalid OTP please Enter Valid otp",
        });
      }
    })
    .catch((err) => {
      delete req.session.user;
      res.redirect("/signin");
    });
});

router.get("/product-details/:id", async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id);
  if (req.session.userLoggedIn) {
    let cartCount = await productHelper.cartCount(req.session.user._id)
    res.render("user/product-details", { usersi: true, product,cartCount});
  } else {
    res.render("user/product-details", { product });
  }
});

router.get("/add-to-cart/:id",verifyloggedin, (req, res) => {
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
     res.json({status:true})
    // res.redirect('/')
  })
});


router.get('/view-cart',async(req,res)=>{
  if(req.session.userLoggedIn){

    let cart = await userHelpers.getUserCartProducts(req.session.user._id)
    let total = await userHelpers.getTotalAmount(req.session.user._id)
    let user = req.session.user._id
    
    
    if(total.status){
      res.render('user/view-cart',{usersi:true,cart,user,value:true})
    }
     
   else{
    res.render('user/view-cart',{usersi:true,cart,user,total})
   }
      
    
  }
  
})

router.post('/change-product-quantity',verifyloggedin,(req,res,next)=>{
      userHelpers.changeProductQuantity(req.body).then(async(response)=>{
      
      let user = req.session.user._id
      
      let  total = await userHelpers.getTotalAmount(user)
      if(total){
        response.total=total
        res.json(response)
      }else{
        res.json(response)
      }       
      })
})
router.get('/delete-cartProduct/:id',(req,res)=>{
  userHelpers.deleteCart(req.params.id,req.session.user._id).then((response)=>{
    res.json(response)
  })
})

router.get('/cod-check-out',verifyloggedin,async(req,res)=>{
  user = req.session.user
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/cod-check-out',{usersi:true,user,total})
})

router.post('/place-order',async(req,res)=>{
  let products = await userHelpers.getCartProductList(req.body.userId)
  let total = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,total).then((response)=>{
    res.json({status:true})
  })
  
})
router.get('/order-list',verifyloggedin,async(req,res)=>{
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/order-list',{orders,usersi:true})
})

router.get('/view-order/:id',verifyloggedin,async(req,res)=>{
  let products = await userHelpers.getOrderProduct(req.params.id)
  let cartCount = await productHelper.cartCount(req.session.user._id)
  res.render('user/view-order',{products,usersi:true,cartCount})
})

router.get('/cancel-order/:id',(req,res)=>{

  let orderId = req.params.id
  userHelpers.cancelOrder(orderId).then((order)=>{
    res.json(order.status)
  })

})
router.get('/shipped-order/:id',(req,res)=>{

  let orderId = req.params.id
  userHelpers.orderShipped(orderId).then((order)=>{
    res.json(order.status)
  })

})

router.get('/delivered-order/:id',(req,res)=>{

  let orderId = req.params.id
  userHelpers.deliveredOrder(orderId).then((order)=>{
    res.json(order.status)
  })

})

router.get('/user-profile',verifyloggedin,(req,res)=>{
  let user = req.session.user
  res.render('user/user-profile',{usersi:true,user})
})



function loggedin(req, res, next) {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    next();
  }
}
function verifyloggedin(req, res, next) {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/signin')
  }
}

module.exports = router;
