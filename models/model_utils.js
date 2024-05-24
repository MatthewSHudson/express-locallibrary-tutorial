"use strict";
const { DateTime } = require("luxon");

class ModelUtils {
  static getShortDate = (jsDate) =>
    jsDate ? DateTime.fromJSDate(jsDate).toLocaleString(DateTime.DATE_MED) : "";
}

module.exports = ModelUtils;
