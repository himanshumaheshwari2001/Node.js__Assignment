const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter book title"],
    trim: true,
    unique:[true,"book is already present!"]
  },
  author: {
    type: String,
    required: [true, "Please enter book author"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter book description"],
  },
  price: {
    type: Number,
    required: [true, "Please enter  price"],
    max: [5000, "Price cannot exceed 8 figures"],
  },
  pages: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [true, "pleae enter book category"],
  },
  publisher: {
    type: String,
    required: [true, "Please enter book publisher"],
    trim: true,
  },
  // publishedAt: {
  //   type: Date,
  //   required: [true, "Please enter the Year of Publish"],
  //   default:0
  // },
  
});

module.exports = mongoose.model("Book", productSchema);
