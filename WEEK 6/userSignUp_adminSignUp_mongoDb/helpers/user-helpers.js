var db = require('../config/connection')
var collection = require('../config/collection')
var bcrypt = require('bcrypt')
const { resolve } = require('path')
const { rejects } = require('assert')
const { ObjectId, Db } = require("mongodb");

module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,rejects)=>{
            let user =await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})

            if(!user){
            userData.password =await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data)
            })
        
          }else{
            console.log('sign up failed 1');
            resolve(false)
          }
          
        })
        
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,rejects)=>{
            //let loginStatus = false
            let response={}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            
                if(user != null){
                    bcrypt.compare(userData.password,user.password).then((status)=>{

                        if(status){
                            console.log('login success');
                            response.user=user
                            response.status=true
                            resolve(response)
                        }
                        else{
                            console.log('login failed');
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
    doAdminLogin:(userData)=>{
        return new Promise(async(resolve,rejects)=>{
            let response={}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({username:userData.username})
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

    addUser:(userData)=>{
        return new Promise(async(resolve,rejects)=>{
            let user =await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})

            if(!user){
            userData.password =await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data)
            })
        
          }else{
            console.log('sign up failed 1');
            resolve(false)
          }
          
        })
        
    },
    
    viewUser:()=>{
        return new Promise(async(resolve,rejects)=>{
            console.log("working")
        let list = await db.get().collection(collection.USER_COLLECTION).find().skip(1).toArray()
            console.log("likst"+list);
        resolve(list)
        })

    },
    deleteUser:(user)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).deleteOne({_id:ObjectId(user)})
            resolve()
        })
    }
        
    
}