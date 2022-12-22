const cloudinary = require('cloudinary').v2

// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.API_KEY,
//     api_secret: process.env.API_SECRET
// })
cloudinary.config({ 
    cloud_name: 'dfhctbevp', 
    api_key: '752549769712887',
    api_secret: '0KvzujdicTWC0m37FQsdshbLnN8'
});

module.exports = cloudinary