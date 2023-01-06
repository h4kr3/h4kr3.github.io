var express = require('express');
const { PRODUCT_COLLECTION } = require('../config/collection');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var adminHelper = require('../helpers/admin-helpers');
const { response } = require('express');
const userHelpers = require('../helpers/user-helpers')
const cloudinary = require('../utils/cloudinary')

const multer = require('multer')
const path = require('path');

upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname)
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
      cb(new Error("File type is not supported"), false)
      console.log('Its workinggggggggggggggggggggg');
      return
    }
    cb(null, true)
  }
})

/* GET users listing. */
router.get('/', adminloggedin,function(req, res, next) {
  res.render('admin/index',{adminlogin:true})
});

router.get('/admin-land',adminloggedout,async(req,res)=>{
  if(req.session.adminLoggedIn){
    let totalAmount = await adminHelper.getTotalAmount()
    let data = await adminHelper.dashBoard()
    res.render('admin/admin-land',{admin:true,totalAmount,data})
  }
})

router.get('/products',adminloggedout,async(req,res)=>{
let category = await productHelper.getAllCategory
  productHelper.getAllCategory().then((category)=>{
    res.render('admin/products',{admin:true,category})
  })
})

router.get('/add-products',adminloggedout,async(req,res)=>{
 let category = await productHelper.getAllCategory()
  res.render('admin/add-products',{admin:true,category})

})

router.get('/category',adminloggedout,(req,res)=>{
  productHelper.getAllCategory().then((category)=>{
    res.render('admin/category',{admin:true,category})
  })

})

// router.post('/add-products',adminloggedout,(req,res)=>{


// productHelper.addProduct(req.body,(id)=>{
//   let image = req.files.image
//   image.mv('./public/images/product-images/'+id+".png",(err,done)=>{
//     if(!err){
//       res.render('admin/add-products',{admin:true})
//     }
//     else console.log(err);
//   })
// })
// })


//ADD PRODUCT


router.post('/add-products', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]), async (req, res) => {
  console.log(req.files);
  const cloudinaryImageUploadMethod = (file) => {
    console.log("qwertyui");
    return new Promise((resolve) => {
      cloudinary.uploader.upload(file, (err, res) => {
        console.log(err, " asdfgh");
        if (err) return res.status(500).send("Upload Image Error")
        resolve(res.secure_url)
      })
    })
  }

  const files = req.files
  let arr1 = Object.values(files)
  let arr2 = arr1.flat()
  const urls = await Promise.all(
    arr2.map(async (file) => {
      const { path } = file
      const result = await cloudinaryImageUploadMethod(path)
      return result
    })
  )
  console.log(urls);

  productHelper.addProduct(req.body, urls, (id) => {
    res.redirect('/admin/products')
  })
})





router.post('/asignin',adminloggedin,(req,res)=>{
  adminHelper.doAdminLogin(req.body).then((response)=>{
    if(response.status){
      req.session.adminLoggedIn = true
      req.session.admin = response.admin
      res.redirect('/admin/admin-land')
    }else{
      res.render('admin/index',{title:'LogIn',invalid:"Incorrect Username or Password" ,adminlogin:true})
    }
  })
})

router.get('/edit-product/:id',adminloggedout,async(req,res)=>{
  let product = await productHelper.getProductDetails(req.params.id)
  let category = await productHelper.getAllCategory()
  res.render('admin/edit-product',{product,category,admin:true})
})



router.post('/edit-products/:id', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]), async (req, res) => {
  console.log(req.files);
  const cloudinaryImageUploadMethod = (file) => {
    console.log("qwertyui");
    return new Promise((resolve) => {
      cloudinary.uploader.upload(file, (err, res) => {
        console.log(err, " asdfgh");
        if (err) return res.status(500).send("Upload Image Error")
        resolve(res.secure_url)
      })
    })
  }

  const files = req.files
  let arr1 = Object.values(files)
  let arr2 = arr1.flat()
  const urls = await Promise.all(
    arr2.map(async (file) => {
      const { path } = file
      const result = await cloudinaryImageUploadMethod(path)
      return result
    })
  )
  console.log(urls);
  productHelper.updateProduct(req.params.id, req.body, urls).then((id) => {
    res.redirect('/admin/products')
  })
})

router.get('/edit-image/:id',(req,res)=>{
  res.render('admin/edit-image')
})


router.post('/edit-category/:id', upload.fields([
  { name: 'image1', maxCount: 1 }
]), async (req, res) => {
  console.log(req.files);
  const cloudinaryImageUploadMethod = (file) => {
    console.log("qwertyui");
    return new Promise((resolve) => {
      cloudinary.uploader.upload(file, (err, res) => {
        console.log(err, " asdfgh");
        if (err) return res.status(500).send("Upload Image Error")
        resolve(res.secure_url)
      })
    })
  }

  const files = req.files
  let arr1 = Object.values(files)
  let arr2 = arr1.flat()
  const urls = await Promise.all(
    arr2.map(async (file) => {
      const { path } = file
      const result = await cloudinaryImageUploadMethod(path)
      return result
    })
  )
  console.log(urls);
  productHelper.updateCategory(req.params.id,req.body,urls).then((id)=>{
    res.redirect('/admin/category')
  })
  
})



router.get('/delete-product/:id',adminloggedout,(req,res)=>{
  let productId = req.params.id
 productHelper.deleteproduct(productId).then((response)=>{
  
  res.redirect('/admin/products')

 })
})

router.get('/delete-category/:id',adminloggedout,(req,res)=>{
  let categoryid = req.params.id
  productHelper.deleteCategory(categoryid).then((response)=>{
    res.redirect('/admin/category')
  })
})






// router.post('/category',adminloggedout,(req,res)=>{
//   productHelper.addCategory(req.body).then((id)=>{
//     if(id){
//       let image = req.files.image
//       image.mv('./public/images/category-images/'+id+".png",(err,done)=>{
//         if(!err){
//           res.render('admin/add-category',{admin:true})
//         }
//         else console.log(err);
//       })
//     }
//     else{
//       res.render('admin/add-category',{admin:true,invalid:'Category name Already exists'})
//     }
   
    
//   })

// })
router.post('/category', upload.fields([
  { name: 'image1', maxCount: 1 }
]), async (req, res) => {
  console.log(req.files);
  const cloudinaryImageUploadMethod = (file) => {
    console.log("qwertyui");
    return new Promise((resolve) => {
      cloudinary.uploader.upload(file, (err, res) => {
        console.log(err, " asdfgh");
        if (err) return res.status(500).send("Upload Image Error")
        resolve(res.secure_url)
      })
    })
  }

  const files = req.files
  let arr1 = Object.values(files)
  let arr2 = arr1.flat()
  const urls = await Promise.all(
    arr2.map(async (file) => {
      const { path } = file
      const result = await cloudinaryImageUploadMethod(path)
      return result
    })
  )
  console.log(urls);
  productHelper.addCategory(req.body,urls).then((id)=>{
    if(id){
          res.render('admin/add-category',{admin:true})
      }
    else{
      res.render('admin/add-category',{admin:true,invalid:'Category name Already exists'})
    }
  })
  
})






router.get('/edit-category/:id',adminloggedout,async(req,res)=>{
let category = await productHelper.getCategoryDetails(req.params.id)
res.render('admin/cat-edit',{admin:true,category})


})




router.get('/alogout',adminloggedout,(req,res)=>{
  req.session.adminLoggedIn=false
  res.render('admin/index', { title: "Logout", logout : "logout Successfull" , adminlogin:true})
})

router.get('/add-category',adminloggedout,(req,res)=>{
  res.render('admin/add-category',{admin:true})
})


router.get('/view-user',adminloggedout,(req,res)=>{
  userHelpers.getAllUser().then((user)=>{
    console.log(user);
    res.render('admin/view-user',{admin:true,user})
  })
})

router.get('/block-user/:id', (req, res) => {
  let userId = req.params.id
  userHelpers.userBlock(userId).then((user) => {
   res.redirect('/admin/view-user')
  })


})

router.get('/product-list/:id',adminloggedout,function(req, res, next) {
  
  productHelper.getProductByCat(req.params.id).then((products)=>{
    
          res.render('admin/product-list', {admin:true,products});
        
  })
})

router.get('/orders',adminloggedout,async(req,res)=>{
  let orders = await userHelpers.getAllOrders()
  res.render('admin/orders',{orders,admin:true})
})

router.get('/view-orderAdmin/:id',adminloggedout,async(req,res)=>{
  let products = await userHelpers.getOrderProduct(req.params.id)
  res.render('admin/view-order',{products,admin:true,orders})
})


router.get('/sales-repo',adminloggedout,async(req,res)=>{
  let deliveredReport = await adminHelper.getDeliveredReport()
  res.render('admin/sales-report',{admin:true,deliveredReport})
})

router.get('/coupon',adminloggedout,async(req,res)=>{
let category = await productHelper.getAllCategory()
let product = await productHelper.getAllProducts()
let coupon = await productHelper.listCoupon()
res.render('admin/coupon',{category,product,coupon,admin:true})
})

router.post('/add-catOffer',(req,res)=>{
  productHelper.addcatOffer(req.body).then(()=>{
    res.redirect('/admin/coupon')
  })
})
router.post('/add-prodOffer',(req,res)=>{
  productHelper.addProdOffer(req.body).then(()=>{
    res.redirect('/admin/coupon')
  })
})

router.get('/delete-prod-offer/:id',(req,res)=>{
  productHelper.deleteOffer(req.params.id).then(()=>{
    res.json({status:true})
  })
})
router.get('/delete-cat-offer/:id',(req,res)=>{
  productHelper.deleteCatOffer(req.params.id).then(()=>{
    res.json({status:true})
  })
})

router.get('/return-order-recieved/:id',(req,res)=>{
  userHelpers.returnOrderRecieved(req.params.id).then(()=>{
    res.json({status:true})
  })
})

router.post('/add-coupon',(req,res)=>{
  productHelper.addCoupon(req.body).then(()=>{
    res.redirect('/admin/coupon')
  })
})

router.get('/delete-coupon-offer/:id',(req,res)=>{
  productHelper.deleteCoupon(req.params.id).then(()=>{
    res.json({status:true})
  })
})

function adminloggedin(req,res,next){
  if(req.session.adminLoggedIn){
    res.render('admin/admin-land',{admin:true})
  }else{
    next()
  }

}

function adminloggedout(req,res,next){
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin')
  }

}

module.exports = router;

