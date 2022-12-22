var db = require("../config/connection");
var collection = require("../config/collection");
var bcrypt = require("bcrypt");
const { ObjectId, Db } = require("mongodb");
const { response } = require("express");
const { use } = require("../routes");
const { RegulatoryComplianceList } = require("twilio/lib/rest/numbers/v2/regulatoryCompliance");

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, rejects) => {
            let user = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({
                    $or: [{ email: userData.email }, { phone: userData.phone }],
                });

            if (!user) {
                userData.password = await bcrypt.hash(userData.password, 10);
                userData.status = true;
                db.get()
                    .collection(collection.USER_COLLECTION)
                    .insertOne(userData)
                    .then((data) => {
                        resolve(data);
                    });
            } else {
                console.log("sign up failed 1");
                resolve(false);
            }
        });
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, rejects) => {
            //let loginStatus = false
            let response = {};
            let user = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ email: userData.email });

            if (user != null) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    console.log(status);

                    if (status) {
                        response.user = user;
                        response.status = true;

                        resolve(response);
                    } else {
                        console.log("login failed");
                        resolve({ status: false });
                    }
                });
            } else {
                console.log("login failed last");
                resolve({ status: false });
            }
        });
    },
    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .find()
                .toArray();
            resolve(user);
        });
    },
    userBlock: (userId) => {
        return new Promise((resolve, reject) => {
            console.log(userId);
            db.get()
                .collection(collection.USER_COLLECTION)
                .updateOne({ _id: ObjectId(userId) }, [
                    { $set: { status: { $not: "$status" } } },
                ])
                .then((response) => {
                    resolve(response);
                });
        });
    },
    otpLogin: (userData) => {
        let response = {};
        return new Promise(async (resolve, reject) => {
            let user = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ phone: userData.phone });
            console.log(user);
            if (user) {
                response.user = user;
                response.status = true;
                resolve(response);
            } else {
                console.log("Login Failed");
                resolve({ status: false });
            }
        });
    },
    addToCart: (prodId, userId) => {
        let proObj = {
            item: ObjectId(prodId),
            quantity: 1,
        };

        return new Promise(async (resolve, reject) => {
            let userCart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: ObjectId(userId) });
            if (userCart) {
                let proExist = userCart.products.findIndex( (product) => product.item == prodId)
                
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne(
                        {
                           user:ObjectId(userId),'products.item':ObjectId(prodId)
                        },
                        {
                            $inc:{'products.$.quantity':1}
                        }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                    db.get()
                    .collection(collection.CART_COLLECTION)
                    .updateOne(
                        { user: ObjectId(userId) },
                        {
                            $push: { products:proObj },
                        }
                    )
                    .then((response) => {
                        console.log(response);
                        resolve();
                    });
                }

               
            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj],
                };
                db.get()
                    .collection(collection.CART_COLLECTION)
                    .insertOne(cartObj)
                    .then((response) => {
                        resolve();
                    });
            }
        });
    },
    getUserCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItem = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .aggregate([
                    {
                        $match: { user: ObjectId(userId) },
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:
                        {
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'products'
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
                        }
                    }
                    
                ])
                .toArray();
            resolve(cartItem);
        });
    },
    changeProductQuantity:(details)=>{
        count = parseInt(details.count)
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.CART_COLLECTION).updateOne(
                    {
                       _id:ObjectId(details.cart),'products.item':ObjectId(details.product)
                    },
                    {
                        $inc:{'products.$.quantity':count}
                    }
                ).then((response)=>{
                    resolve(response)
                })
            })
    },
    deleteCart:(prodId,userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({
                user: ObjectId(userId)
            },
                {
                    $pull: { products: { item: ObjectId(prodId) } }
                }
            ).then((response) => {
                resolve(response)
            })
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let total = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .aggregate([
                    {
                        $match: { user: ObjectId(userId) },
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:
                        {
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'products'
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
                        }
                    },
                    {
                        $group:{ 
                            _id:null,
                            total:{$sum:{$multiply:['$quantity','$product.price']}}
                        }
                    }
                    
                ])
                .toArray()
                if(total==0){
                    resolve({status:true})
                }
                else{
                    resolve(total[0].total)
                }
            
            
            
        });
    },
    placeOrder:(order,product,total)=>{
            return new Promise((resolve,reject)=>{
            
                let status=order.paymentMethod==='cod'?'placed':'pending'
                let oderObj={
                    deliveryDetails:{
                        name:order.name,
                        phone:order.phone,
                        address:order.address,
                        country:order.country,
                        state:order.state,
                        pincode:order.pincode
                    },
                    userId:ObjectId(order.userId),
                    paymentMethod:order.paymentMethod,
                    products:product.products,
                    totalAmount:total,
                    status:status,
                    date:new Date(),
                    btn:true
                }
                console.log(oderObj);
                db.get().collection(collection.ORDER_COLLLECTION).insertOne(oderObj).then((response)=>{
                        db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(order.userId)})
                        resolve()
                })

            })
    },
    getCartProductList:(userId)=>{

            return new Promise((resolve,reject)=>{
                let cart = db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
                console.log(cart);
                resolve(cart)
            })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>
        {
            let orders = await db.get().collection(collection.ORDER_COLLLECTION).find({
                userId:ObjectId(userId)
            }).toArray()
           resolve(orders)
        })
    },
    getOrderProduct:(orderId)=>{
        return new Promise(async (resolve, reject) => {
            let cartItem = await db
                .get()
                .collection(collection.ORDER_COLLLECTION)
                .aggregate([
                    {
                        $match: { _id: ObjectId(orderId) },
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:
                        {
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'products'
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
                        }
                    }
                    
                ])
                .toArray();
                console.log(cartItem);
            resolve(cartItem);
        });
    },
    cancelOrder:(orderId)=>{
        return new Promise((resolve, reject) => {
           
            db.get()
                .collection(collection.ORDER_COLLLECTION)
                .updateOne({ _id: ObjectId(orderId) }, [
                    { $set: { status: 'cancelled',btn:false} },
                ])
                .then((response) => {
                   
                    resolve({status:true});
                });
        });
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>
        {
            let orders = await db.get().collection(collection.ORDER_COLLLECTION).find().toArray()
            console.log(orders);
           resolve(orders)
        })
    },
    orderShipped:(orderId)=>{
        return new Promise((resolve, reject) => {
           
            db.get()
                .collection(collection.ORDER_COLLLECTION)
                .updateOne({ _id: ObjectId(orderId) }, [
                    { $set: { status: 'shipped',} },
                ])
                .then((response) => {
                   
                    resolve({status:true});
                });
        });
    },
    deliveredOrder:(orderId)=>{
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLLECTION)
                .updateOne({ _id: ObjectId(orderId) }, [
                    { $set: { status: 'delivered',btn:false} },
                ])
                .then((response) => {
                   
                    resolve({status:true});
                });
        });
    }
};
