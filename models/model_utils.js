"use strict";
const { DateTime } = require("luxon");

class ModelUtils {
  static getShortDate = (jsDate) =>
    jsDate ? DateTime.fromJSDate(jsDate).toLocaleString(DateTime.DATE_MED) : "";

  static parseDate = (str) => {
    const formats = ["dd/MM/yyyy", "yyyy-mm-yy"];
    let result;
    for (let format of formats) {
      result = DateTime.fromFormat(str, format);
      if (result.isValid) return result.toJSDate();
    }
    return false;
  };
}

module.exports = ModelUtils;
