const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//Task 6: Register New user
public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if both fields are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Check if username already exists
    if (isValid(username)) {
      return res.status(409).json({ message: "Username already exists. Choose another." });
    }
  
    // Store new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully!" });
});

//Task 10: Get all books – Using async callback function
function getBooks() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}
// Task 1: Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const bks = await getBooks();
        res.json(bks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
});

//Task 11: Search by ISBN – Using Promises
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found for the given ISBN");
      }
    });
  }
//Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

  getBookByISBN(isbn)
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
 });
  
 //Task 12: Search by Author
 const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      const filteredBooks = [];
  
      for (let key in books) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          filteredBooks.push({ isbn: key, ...books[key] });
        }
      }
  
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found for the given author");
      }
    });
  };
//TASk 3: Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    const author = req.params.author;

  try {
    const booksByAuthor = await getBooksByAuthor(author);
    res.status(200).json(booksByAuthor);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//Task 13: Search by Title
const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      const filteredBooks = [];
  
      for (let key in books) {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          filteredBooks.push({ isbn: key, ...books[key] });
        }
      }
  
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found for the given title");
      }
    });
  };
// Task 4: Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const title = req.params.title;

  try {
    const booksByTitle = await getBooksByTitle(title);
    res.status(200).json(booksByTitle);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//Task 5:  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
      const reviews = book.reviews || {};
      res.status(200).json({ reviews });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
