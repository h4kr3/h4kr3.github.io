var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectId, Db } = require("mongodb");
const { response } = require('express');
const { image } = require('../utils/cloudinary');
module.exports = {

    addProduct: (product, url, callback) => {
        return new Promise(async (resolve, reject) => {
            console.log(url);
            product.image = url
            product.price = parseInt(product.price)
            await db.get().collection('product').insertOne(product).then((data) => {
                callback(product._id)
            })
        })

    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteproduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(productId) }).then((response) => {
                resolve(response)
            })
        })
    }, deleteCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: ObjectId(categoryId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(productId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (productId, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(productId) }, {
                $set: {
                    productName: productDetails.productName,
                    category: productDetails.category,
                    description: productDetails.description,
                    brand: productDetails.brand,
                    price: parseInt(productDetails.price),
                    quantity: productDetails.quantity,
                    features: productDetails.features,

                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    updateCategory: (categoryId, categorydetails, urls) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(categoryId) }, {
                $set: {
                    category: categorydetails.category,
                    image: urls

                }
            }).then((response) => {
                resolve(response)
            })
        })
    }
    ,
    getCategoryDetails: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(categoryId) }).then((category) => {
                resolve(category)
            })
        })

    }
    ,
    categoryDelete: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: ObjectId(categoryId) }).then((response) => {
                resolve(response)
            })
        })
    }
    ,
    addCategory: (category, urls) => {
        return new Promise(async (resolve, reject) => {
            category.image = urls
            console.log(category);
            console.log(urls);
            let cat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category.category })
            if (!cat) {
                await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category)
                resolve(category._id)
            }
            else {
                resolve(false)
            }

        })
    }
    ,
    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },
    getProductByCat: (id) => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: id }).toArray()
            resolve(category)
        })
    },
    cartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })

            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })

    },
    updateImages: (productId, urls) => {
        return new Promise((resolve, reject) => {
            console.log(urls);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(productId) }, {
                $set: {
                    image: urls

                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    addcatOffer: (cat) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:ObjectId(cat.category)},{$set:{categoryOffer:parseInt(cat.offerPercentage)}})
            await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ category:cat.category},{$set:{categoryOffer:parseInt(cat.offerPercentage)}})
            
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:cat.category}).toArray()
            console.log(products);
            for (let i =0;i<products.length;i++){
                
                if(products[i].categoryOffer>=products[i].productOffer){
                    let temp = (products[i].price*products[i].categoryOffer)/100
                    let offerPrice = products[i].price-temp
                    let updateProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(products[i]._id)},{$set:{offerPrice:offerPrice}})
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(products[i]._id)},{$set:{offer:products[i].categoryOffer}})
                    resolve()
                }
                else if(products[i].categoryOffer<products[i].productOffer){
                    let temp = (products[i].price*products[i].productOffer)/100
                    let offerPrice = products[i].price-temp
                    let updateProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(products[i]._id)},{$set:{offerPrice:offerPrice}})
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(products[i]._id)},{$set:{offer:products[i].productOffer}})
                    resolve()
                }
            }

            
        })
    },
    addProdOffer:(prod)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prod.product)},{$set:{productOffer:parseInt(prod.offerPercentage)}})

            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(prod.product)})
            if(product.productOffer>=product.categoryOffer){
               let temp = (product.price*product.productOffer)/100
               let offerPrice = product.price-temp
               let updateProd = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prod.product)},{$set:{offerPrice:parseInt(offerPrice)}})
               await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prod.product)},{$set:{offer:parseInt(prod.offerPercentage)}})
               resolve(updateProd)
            }
            else if(product.productOffer<product.categoryOffer){
                let temp = (product.price*product.categoryOffer)/100
                let offerPrice = product.price-temp
                let updateProd = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prod.product)},{$set:{offerPrice:parseInt(offerPrice)}})
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prod.product)},{$set:{offer:parseInt(product.categoryOffer)}})
                resolve(updateProd)
            }
        })
    },
    deleteOffer:(prodId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prodId)},{$set:{productOffer:parseInt(0)}})
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(prodId)})
            if(product.productOffer==0&&product.categoryOffer==0){
               await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prodId)},{$set:{
                offerPrice:product.price,
                offer:parseInt(0)
               }})
               resolve()
            }
            else if(product.productOffer<product.categoryOffer){
                let temp = (product.price*product.categoryOffer)/100
                let offerPrice = product.price-temp
                let updateProd = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(product._id)},{$set:{offerPrice:parseInt(offerPrice)}})
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(product._id)},{$set:{offer:parseInt(product.categoryOffer)}})
                resolve(updateProd)
            }
        })
    },
    deleteCatOffer:(catId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.CATEGORY_COLLECTION).updateMany({_id:ObjectId(catId)},{$set:{categoryOffer:parseInt(0)}})
            await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({category:catId},{$set:{categoryOffer:parseInt(0)}})
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:catId}).toArray()

            for (let i =0;i<products.length;i++){
                
                if(products[i].categoryOffer==0&&products[i].productOffer==0){
                    
                    let updateProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(products[i]._id)},{$set:{offerPrice:products[i].price}})
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(products[i]._id)},{$set:{offer:parseInt(0)}})
                    resolve()
                }
                else if(products[i].categoryOffer<products[i].productOffer){
                    let temp = (products[i].price*products[i].productOffer)/100
                    let offerPrice = products[i].price-temp
                    let updateProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(products[i]._id)},{$set:{offerPrice:offerPrice}})
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(products[i]._id)},{$set:{offer:products[i].productOffer}})
                    resolve()
                }
            }
            
        })

    }
}