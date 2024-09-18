const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ message: "Username and Password are required" });
  if (isValid(username)) {
    users.push({"username":username,"password":password});
    return res.status(200).json({ message: "User created successfully" });
  } else {
    return res.status(400).json({ message: "User already exists" });
  }
});

const getallBooks = new Promise((resolve, reject) => {
  if (Object.keys(books).length > 0) {
    resolve(books);
  } else {
    reject(new Error("Books Database is empty"));
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  getallBooks.then(function (books) {
    return res.status(300).json({ message: JSON.stringify(books, null, 4) });
  }).catch(function (err) {
    return res.status(500).json({ error: err.message });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  getallBooks.then(function (books) {
    let isbn = req.params.isbn;
    // Check if the book exists in the books object
    if (isbn in books) {
      return res.status(300).json(books[isbn]);
    } else {
      // If the book doesn't exist, return a 404 error
      return res.status(404).send('Book not found with the given ISBN');
    }

  }).catch(function (err) {
    return res.status(500).json({ error: err.message });
  });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];

  // Create a new promise
  const getBooksbyauthor = new Promise(function (resolve, reject) {
    // Loop through each book in the books object
    for (const isbn in books) {
      const book = books[isbn];

      // If the book's author property matches the search term, add it to the results
      if (book.author === author) {
        booksByAuthor.push(book);
      }
    }

    // Check if any books were found
    if (booksByAuthor.length > 0) {
      // Resolve the promise with the booksByAuthor array
      resolve(booksByAuthor);
    } else {
      // Reject the promise with an error message
      reject(`No books found for author '${author}'`);
    }
  });
  // Handle the promise result
  getBooksbyauthor
    .then(function (result) {
      // The booksByAuthor array now contains all books with the specified author
      return res.status(200).json({ message: result });
    })
    .catch(function (error) {
      return res.status(404).json({ error: error });
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];
  // Create a new promise
  const getBooksbytitle = new Promise(function (resolve, reject) {
    // Loop through each book in the books object
    for (const isbn in books) {
      const book = books[isbn];
      // If the book's title property matches the search term, add it to the results
      if (book.title === title) {
        booksByTitle.push(book);
      }
    }
    // Check if any books were found
    if (booksByTitle.length > 0) {
      // Resolve the promise with the booksByTitle array
      resolve(booksByTitle);
    } else {
      // Reject the promise with an error message
      reject(`No books found for title '${title}'`);
    }
  });
  // Handle the promise result
  getBooksbytitle
    .then(function (result) {
      // The booksByTitle array now contains all books with the specified title
      return res.status(200).json({ message: result });
    })
    .catch(function (error) {
      return res.status(404).json({ error: error });
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Check if the book exists in the books object
  if (isbn in books) {
    // Return the book's review
    return res.status(200).json({ message: books[isbn].reviews });
  } else {
    // If the book doesn't exist, return a 404 error
    return res.status(404).send('Book not found with the given ISBN');
  }
});

module.exports.general = public_users;
