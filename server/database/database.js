const mongoose = require('mongoose');

const connectDatabase = ()=>{
    mongoose.connect(process.env.DB_URII).then((data)=>{
        console.log(`Mongoose connect with server : ${data.connection.host}`)
    })
    // catch error is already handled in server. 
}

module.exports = connectDatabase;