"use strict";

const Book = require("../models/book");
const Genre = require("../models/genre");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();
  res.render("genre_list", {
    title: "Genre List",
    genre_list: allGenres,
  });
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });
});

// We don't need to add async handling here since this one does not require a database
// query and instead is basically static data
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", {
    title: "Create Genre",
  });
};

exports.genre_create_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the same from againwith sanitized values/error messages
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (genreExists) {
        // Genre exists redirect to its detail page
        res.redirect(genreExists.url);
      } else {
        // Genre does not exist yet so save it to DB and redirect
        await genre.save();
        res.redirect(genre.url);
      }
    }
  }),
];

exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, books] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).exec(),
  ]);
  if (genre === undefined) {
    res.redirect("/catalog/genres");
  } else {
    res.render("genre_delete", {
      genre: genre,
      booksInGenre: books,
    });
  }
});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, books] = await Promise.all([
    Genre.findById(req.body.genreid).exec(),
    Book.find({ genre: req.body.genreid }).exec(),
  ]);

  if (books.length > 0) {
    // There are still books that need to be deleted
    res.render("genre_delete", {
      genre: genre,
      booksInGenre: books,
    });
  } else {
    await Genre.findByIdAndDelete(req.body.genreid);
    res.redirect("/catalog/genres");
  }
});

exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);
  if (genre === null) {
    const err = new Error(`Genre Id: ${req.params.id} not found.`);
    err.status = 404;
    throw err;
  }
  res.render("genre_form", {
    title: "Update Genre",
    genre: genre,
  });
});

exports.genre_update_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({ name: req.body.name, _id: req.params.id });
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update Form",
        genre: genre,
        errors: errors,
      });
    }
    const updatedGenre = await Genre.findByIdAndUpdate(
      req.params.id,
      genre,
      {}
    );
    res.redirect(updatedGenre.url);
  }),
];
