const mongoose = require("mongoose");
const utils = require("./model_utils");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

AuthorSchema.virtual("name").get(function () {
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.first_name} ${this.family_name}`;
  }
  return fullname;
});

AuthorSchema.virtual("url").get(function () {
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual("date_of_birth_formatted").get(function () {
  return utils.getShortDate(this.date_of_birth);
});

AuthorSchema.virtual("date_of_death_formatted").get(function () {
  return utils.getShortDate(this.date_of_death);
});

module.exports = mongoose.model("Author", AuthorSchema);
