"use strict";

const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bookinstance = require("../models/bookinstance");

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    bookinstance_list: allBookInstances,
  });
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance: bookInstance,
  });
});

exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
  });
});

exports.bookinstance_create_post = [
  // Validation and Sanitization pipeline
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date").optional({ values: "falsy" }),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a bookInstance object with escaped and trimmed data
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back_formatted: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors so we need to rerender the form
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

      res.render({
        title: req.body.title,
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const instance = await bookinstance.findById(req.params.id).exec();
  if (instance === null) {
    res.redirect("/catalog/bookinstances");
  }
  res.render("bookinstance_delete", {
    title: "Delete Copy:",
    bookinstance: instance,
  });
});

exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const instance = await BookInstance.findByIdAndDelete(
    req.body.instanceid
  ).exec();
  res.redirect("/catalog/bookinstances");
});

exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find().exec();
  res.render("bookinstance_form", {
    title: "Update Copy",
    book_list: allBooks,
  });
});

exports.bookinstance_update_post = [
  // Validation and Sanitization pipeline
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date").optional({ values: "falsy" }),
  // Process request
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const instance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back_formatted: req.body.dueback,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      const allBooks = await Book.find().exec();
      res.render("bookinstance_form", {
        title: "Update BookInstance",
        book_list: allBooks,
        errors: errors.array(),
      });
    }
    const updatedBookInstance = await BookInstance.findByIdAndUpdate(
      req.params.id,
      instance,
      {}
    );
    res.redirect(updatedBookInstance.url);
  }),
];
