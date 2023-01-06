var db = require('../config/connection')
var collection = require('../config/collection')
var bcrypt = require('bcrypt')
const { resolve } = require('path')
const { rejects } = require('assert')

module.exports = {
    doAdminLogin:(userData)=>{
        return new Promise(async(resolve,rejects)=>{
            let response={}
            let user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({username:userData.username})
            console.log(user);
            if(user != null){
                bcrypt.compare(userData.password,user.password).then((status)=>{

                    if(status){
                        console.log('login success');
                        response.admin=user
                        response.status=true
                        resolve(response)
                    }
                    else{
                        console.log('login failed here');
                        resolve({status:false})
                    }

                })

            }
            else{
                console.log('login failed last');
                resolve({status:false})
            }

    })
    },
    getTotalAmount:()=>{
        return new Promise(async(resolve,rejects)=>{
            let totalAmount = {}
            totalAmount.total= await db.get().collection(collection.ORDER_COLLLECTION).aggregate([
                {
                    $match:{
                        status:'delivered'
                    }
                },{
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()
            totalAmount.cod = await db.get().collection(collection.ORDER_COLLLECTION).aggregate([
                {
                    $match:{
                        'status': 'delivered', 
                        'paymentMethod': 'cod'
                      }
                },{
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()

            totalAmount.online = await db.get().collection(collection.ORDER_COLLLECTION).aggregate([
                {
                    $match:{
                        'status': 'delivered', 
                        'paymentMethod': 'online'
                      }
                },{
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()
            console.log(totalAmount);
            resolve(totalAmount)
        })
        
       
    },
    dashBoard:()=>{
        return new Promise(async(resolve,rejects)=>{
            let data = {}

            data.deliveredProd = await db.get().collection(collection.ORDER_COLLLECTION).find({status:'delivered'}).count()
            data.cancelledProd = await db.get().collection(collection.ORDER_COLLLECTION).find({status:'cancelled'}).count()
            data.placedProd = await db.get().collection(collection.ORDER_COLLLECTION).find({status:'placed'}).count()
            data.pendingProd = await db.get().collection(collection.ORDER_COLLLECTION).find({status:'pending'}).count()
            data.onlineProd = await db.get().collection(collection.ORDER_COLLLECTION).find({paymentMethod:'online'}).count()
            data.codProd = await db.get().collection(collection.ORDER_COLLLECTION).find({paymentMethod:'cod'}).count()
            resolve(data)
        })
    },
    getDeliveredReport:()=>{
        return new Promise(async(resolve,rejects)=>{
            let report = await db.get().collection(collection.ORDER_COLLLECTION).find({status:"delivered"}).toArray()
            console.log(report);
            resolve(report)
        })
    }
}