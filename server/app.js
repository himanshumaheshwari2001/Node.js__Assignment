const express = require('express');
const app=express();
const cors=require('cors');
const cookieParser= require('cookie-parser');
 
// main middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(cors());


//Route Imports
const user = require('./routes/userRoutes.js');
const book = require('./routes/booksRoutes.js');
const errorMiddleware = require('./middleware/error');


//client  middlewares
app.use('/api/v1',book);
app.use('/api/v1',user);
app.use(errorMiddleware);

module.exports=app;





