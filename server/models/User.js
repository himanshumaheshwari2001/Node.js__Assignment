// User Model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        require:[true,"please enter name"],
    },
    email:{
        type:String,
        required:[true,'please enter email'],
        unique:[true,"email already exists"],
        lowercase:true,
        uppercase:true,
    },
    password:{
        type:String,
        required:[true,'plese enter password'],
        minLength:[6,'password must be atleast 6 character'],
        select:false,
    },
    role:{
        type:String,
        default:'admin',
    },
    resetPasswordOtp:Number,
    resetPasswordExpire:Date,

});


//hashing password before save
userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})

//for matching password
userSchema.methods.matchPassword=async function(password){
    return bcrypt.compare(password,this.password);
}


//for generate tokens
userSchema.methods.generateToken = function(){
    return jwt.sign({_id:this._id},process.env.JWT_SECRET);
}


//Reset Password
userSchema.methods.getResetPasswordToken=function(){
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 

    return resetToken;
}

module.exports = mongoose.model("User",userSchema);