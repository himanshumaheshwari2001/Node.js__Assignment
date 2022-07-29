const Book = require("../models/Books");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middleware/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");

const Redis = require("redis");
const client = Redis.createClient();
client.connect();

//create Book  -- Admin
exports.createBook = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;

  const product = await Book.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

//Get all books -- // applied pagination and cache layer
exports.getAllBooks = catchAsync(async (req, res, next) => {

  const resultPerPage = 8;
  const bookData = await client.get(`page${req.query.page}`); // Getting data from the cache 

  
  if(bookData !=null){                                       // checking it is present or not
    return res.status(200).json(JSON.parse(bookData));
  } 

  const bookCount = await Book.countDocuments();

  const apiFeature = new ApiFeatures(Book.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);


  const books = await apiFeature.query;
  await client.setEx(`page${req.query.page}`,1800,JSON.stringify(books)); // stored in cache for 30 mins

  res.status(200).json({
    success: true,
    books,
    bookCount,
    resultPerPage,
    page:`${req.query.page}`,
  });
});

//Get Book Details
exports.getBookDetails = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorHandler("Book Not Found", 400));
  }

  res.status(200).json({
    success: true,
    book,
  });
});

// Update book details only by -- Admin
exports.updateBook = catchAsync(async (req, res, next) => {
  let books = await Book.findById(req.params.id);

  if (!books) {
    return next(new ErrorHandler("Book Not Fond"), 500);
  }

  books = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    books,
  });
});

//delete books by admin
exports.deleteBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorHandler("Book Not Found"), 500);
  }
  await book.remove();
  res.status(200).json({
    success: true,
    message: "Book Deleted Successfully!",
  });
});
