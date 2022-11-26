var db = require("../config/connection");
var collection = require("../config/collection");
var bcrypt = require("bcrypt");
const { resolve } = require("path");
const { rejects } = require("assert");
const { ObjectId, Db } = require("mongodb");
const { response } = require("../app");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, rejects) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });

      if (!user) {
        userData.password = await bcrypt.hash(userData.password, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then((data) => {
            resolve(data);
          });
      } else {
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
          if (status) {

            response.user = user;
            response.status = true;
            resolve(response);
          } else {

            resolve({ status: false });
          }
        });
      } else {

        resolve({ status: false });
      }
    });
  },
  doAdminLogin: (userData) => {
    return new Promise(async (resolve, rejects) => {
      let response = {};
      let user = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ username: userData.username });

      if (user != null) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {

            response.admin = user;
            response.status = true;
            resolve(response);
          } else {

            resolve({ status: false });
          }
        });
      } else {

        resolve({ status: false });
      }
    });
  },

  addUser: (userData) => {
    return new Promise(async (resolve, rejects) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });

      if (!user) {
        userData.password = await bcrypt.hash(userData.password, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then((data) => {
            resolve(data);
          });
      } else {

        resolve(false);
      }
    });
  },

  viewUser: () => {
    return new Promise(async (resolve, rejects) =>{
      let list = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(list);
    });
  },
  deleteUser: (user) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .deleteOne({ _id: ObjectId(user) });
      resolve();
    });
  },
  getUserDetails:(userID)=>{
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userID)}).then((userID)=>{
        resolve(userID)
      })
    })
  },
  updateUser: (userId, userDetails) => {
    return new Promise(async(resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({$and:[{email:userDetails.email},{name:userDetails.name}]})
      if(user==null){
        await db.get().collection(collection.USER_COLLECTION)
            .updateOne({ _id: ObjectId(userId) }, {
                $set: {
                    name: userDetails.name,
                    email: userDetails.email,
                }
            })
                resolve({status:true});
              }else{
                resolve({status:false})
                } 
    })
  },
  searchUser: (userData) => {
    return new Promise(async (resolve, reject) => {
        console.log(userData.search+'here i am ')
        let user = await db.get().collection(collection.USER_COLLECTION).find({ name: userData.search }).toArray();
        if (user) {
            resolve(user)
        } else {
            resolve({ data: false });
        }
    })
}
  
};
