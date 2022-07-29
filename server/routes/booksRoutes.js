const express = require("express");
const { getAllBooks, createBook, deleteBook, getBookDetails,updateBook } = require("../controllers/book");
const router = express.Router();
const { isAuthenticateUser, authorizeRoles } = require("../middleware/auth");




// get all books
router.route("/books").get(getAllBooks);



// create book by - Admin
router
  .route("/book/new")
  .post(isAuthenticateUser, authorizeRoles("admin"), createBook);


// get update / delete book by admin
router
  .route("/book/:id")
  .put(isAuthenticateUser, authorizeRoles("admin"), updateBook)
  .delete(isAuthenticateUser, authorizeRoles("admin"), deleteBook);


// get single book detail by id
router.route("/book/:id").get(getBookDetails);

module.exports = router;
