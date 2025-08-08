const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ 
    return users.some(
        (user) => user.username === username && user.password === password
    );
}

//Task 7: Login as a Registered user
//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    // ✅ Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // ✅ Check credentials
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
  
    // ✅ Generate JWT
    const token = jwt.sign({ username }, "access", { expiresIn: "1h" });
  
    // ✅ Store token in session
    req.session.authorization = {
      token,
      username
    };
  
    return res.status(200).json({ message: "User logged in successfully." });
});

//Task 8: Add/Modify a book review
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!review) {
      return res.status(400).json({ message: "Review query is missing" });
    }

    if (books[isbn]) {
      books[isbn].reviews[username] = review;
      return res.status(200).json({
        message: `Review by '${username}' added/updated successfully.`,
        reviews: books[isbn].reviews
      });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

//Task 9: Delete book review added by that particular user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    const book = books[isbn];
  
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "No review by this user found to delete" });
    }
  
    delete book.reviews[username];
  
    return res.status(200).json({
      message: `Review by '${username}' deleted successfully`,
      reviews: book.reviews
    });
  });
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
