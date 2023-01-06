var db = require("../config/connection");
var collection = require("../config/collection");
var bcrypt = require("bcrypt");
const { ObjectId, Db } = require("mongodb");
const { response } = require("express");
const { use } = require("../routes");
const { RegulatoryComplianceList } = require("twilio/lib/rest/numbers/v2/regulatoryCompliance");
const { resolve } = require("path");
const Razorpay = require('razorpay');
const { ObjectID } = require("bson");
var instance = new Razorpay({
    key_id: 'rzp_test_2LtbQ9U70xjQCK',
    key_secret: 'uhukdgU5WC3p7HAxDCHwQ69N'
})

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
                let proExist = userCart.products.findIndex((product) => product.item == prodId)

                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne(
                        {
                            user: ObjectId(userId), 'products.item': ObjectId(prodId)
                        },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            { user: ObjectId(userId) },
                            {
                                $push: { products: proObj },
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
                        $unwind: '$products'
                    },
                    {
                        $project:
                        {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                        }
                    }

                ])
                .toArray();
            resolve(cartItem);
        });
    },
    changeProductQuantity: (details) => {
        count = parseInt(details.count)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne(
                {
                    _id: ObjectId(details.cart), 'products.item': ObjectId(details.product)
                },
                {
                    $inc: { 'products.$.quantity': count }
                }
            ).then((response) => {
                resolve(response)
            })
        })
    },
    deleteCart: (prodId, userId) => {
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
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .aggregate([
                    {
                        $match: { user: ObjectId(userId) },
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project:
                        {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', '$product.offerPrice'] } }
                        }
                    }

                ])
                .toArray()
            if (total == 0) {
                resolve({ status: true })
            }
            else {
                resolve(total[0].total)
            }



        });
    },
    placeOrder: (order, product, total) => {
        return new Promise((resolve, reject) => {

            let status = order.paymentMethod === 'cod' ? 'placed' : 'pending'
            let oderObj = {
                deliveryDetails: {
                    name: order.name,
                    phone: order.phone,
                    address: order.address,
                    country: order.country,
                    state: order.state,
                    pincode: order.pincode
                },
                userId: ObjectId(order.userId),
                paymentMethod: order.paymentMethod,
                products: product.products,
                totalAmount: order.total,
                status:status,
                date: new Date(),
                btn: true,

            }
            if (oderObj.paymentMethod === 'cod') {
                db.get().collection(collection.ORDER_COLLLECTION).insertOne(oderObj).then((response) => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userId) })
                    resolve(response)
                })
            }
            else {
                db.get().collection(collection.ORDER_COLLLECTION).insertOne(oderObj).then((response) => {
                    console.log(response);
                    resolve(response)
                })
            }


        })
    },
    getCartProductList: (userId) => {

        return new Promise((resolve, reject) => {
            let cart = db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            console.log(cart);
            resolve(cart)
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLLECTION).find({
                userId: ObjectId(userId)
            }).toArray()
            resolve(orders)
        })
    },
    getOrderProduct: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let cartItem = await db
                .get()
                .collection(collection.ORDER_COLLLECTION)
                .aggregate([
                    {
                        $match: { _id: ObjectId(orderId) },
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project:
                        {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                        }
                    }

                ])
                .toArray();
            console.log(cartItem);
            resolve(cartItem);
        });
    },
    cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {

            db.get()
                .collection(collection.ORDER_COLLLECTION)
                .updateOne({ _id: ObjectId(orderId) }, [
                    { $set: { status: 'cancelled', btn: false } },
                ])
                .then((response) => {

                    resolve({ status: true });
                });
        });
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLLECTION).find().toArray()
            console.log(orders);
            resolve(orders)
        })
    },
    orderShipped: (orderId) => {
        return new Promise((resolve, reject) => {

            db.get()
                .collection(collection.ORDER_COLLLECTION)
                .updateOne({ _id: ObjectId(orderId) }, [
                    { $set: { status: 'shipped', } },
                ])
                .then((response) => {

                    resolve({ status: true });
                });
        });
    },
    deliveredOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLLECTION)
                .updateOne({ _id: ObjectId(orderId) }, [
                    { $set: { status: 'delivered', btn: false, return: true } },
                ])
                .then((response) => {

                    resolve({ status: true });
                });
        });
    },
    addProfileDetails: (user) => {
        return new Promise((resolve, reject) => {
            address = {
                address: user.address,
                country: user.country,
                state: user.state,
                pincode: user.pincode
            }

            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(user.userId) }, { $set: { address: [address] } }).then((response) => {
                resolve(response)
            })

        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('New order :', order);
                    resolve(order)
                }

            })
        })
    },

    //VERIFY PAYMENT
    verifyPayment: (details, userId) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'uhukdgU5WC3p7HAxDCHwQ69N');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId) })
                resolve()
            } else {
                reject({ status: false })
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLLECTION)
                .updateOne({ _id: ObjectId(orderId) }, [
                    { $set: { status: 'placed', btn: true } },
                ])
                .then((response) => {
                    resolve({ status: true });
                });
        });
    },
    verifyPwd: (userId, userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let user = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ _id: ObjectId(userId) });

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
        })
    },
    changePwd: (pwd, userId) => {
        return new Promise(async (resolve, reject) => {
            pwd = await bcrypt.hash(pwd, 10);
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { password: pwd } }).then((response) => {
                response.status = true
                resolve(response)
            })
        })
    },
    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            let user = db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(userId) })
            resolve(user)
        })
    },
    addToWish: (prodId, userId) => {
        let response = { status: false }
        let proObj = {
            item: ObjectId(prodId),
            quantity: 1,
        };

        return new Promise(async (resolve, reject) => {
            let userWish = await db
                .get()
                .collection(collection.WISH_COLLECTION)
                .findOne({ user: ObjectId(userId) });
            if (userWish) {
                let proExist = userWish.products.findIndex((product) => product.item == prodId)

                if (proExist != -1) {
                    response.status = true
                    resolve(response)
                } else {
                    db.get()
                        .collection(collection.WISH_COLLECTION)
                        .updateOne(
                            { user: ObjectId(userId) },
                            {
                                $push: { products: proObj },
                            }
                        )
                        .then((response) => {

                            resolve();
                        });
                }


            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj],
                };
                db.get()
                    .collection(collection.WISH_COLLECTION)
                    .insertOne(cartObj)
                    .then((response) => {
                        console.log('hi am here');
                        console.log(response);
                        resolve(res);
                    });
            }
        });

    },
    getUserWishProducts: (userId) => {

        return new Promise(async (resolve, reject) => {
            let wishItem = await db
                .get()
                .collection(collection.WISH_COLLECTION)
                .aggregate([
                    {
                        $match: { user: ObjectId(userId) },
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project:
                        {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                        }
                    }

                ])
                .toArray();
            resolve(wishItem);
        });

    },
    deleteWish: (prodId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISH_COLLECTION).updateOne({
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
    returnOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLLECTION).updateOne({ _id: ObjectID(orderId) }, { $set: { status: 'Return Process Started', return: false, returnDate: new Date, productReturning: true, btn: false } }).then(() => {
                resolve()
            })
        })
    },
    returnOrderRecieved: (orderId) => {
        return new Promise(async(resolve, reject) => {
           await db.get().collection(collection.ORDER_COLLLECTION).updateOne({ _id: ObjectID(orderId) }, { $set: { status: 'Product Arrieved To Seller', return:false,productReturning:false} })

           let wallet = await db.get().collection(collection.ORDER_COLLLECTION).findOne({_id:ObjectID(orderId)})
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectID(wallet.userId)})
            if(user.wallet){
                console.log('234567897654');
                user.wallet=user.wallet+wallet.totalAmount
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectID(wallet.userId)},{$set:{wallet:parseInt(user.wallet),walletUpdate:new Date}}).then(()=>{
                    resolve()
                })
            }
            else{
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectID(wallet.userId)},{$set:{wallet:parseInt(wallet.totalAmount),walletUpdate:new Date}}).then(()=>{
                    resolve()
                })
            }
          
        })
    }
};
