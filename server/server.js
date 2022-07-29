require('dotenv').config({path:"config.env"});
const app = require('./app');
const connectDatabase = require('./database/database');

//config
const PORT = process.env.PORT || 8080 ;

//connecting to server
connectDatabase();
const server = app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`)
});



// Unhandled Promise Rejection for async 
process.on('unhandledRejection',err=>{
    console.log('Shuting down the server due to unhandled promise rejection');
    console.log(`Error :${err.message}`);

    server.close(()=>{
        process.exit(1);
    });
});


// Uncaught exceptions for sync 
process.on('uncaughtException',err=>{
    console.log('Shutting down server due to uncaught exressions');
    console.log('Error : ',err);
    
    server.close(()=>{
        process.exit(1);
    })
})

