const jwt = require("jsonwebtoken");
require('dotenv').config()

class Token {
  constructor() {
    this.SECRET_KEY = process.env.JWT_SECRET_KEY;
  }

  create(data) {
    this.token = jwt.sign(data, this.SECRET_KEY);
    return this.token;
  }

  verify(token) {
    try {
      this.decoded = jwt.verify(token, this.SECRET_KEY);
    } catch (err) {
      return false;
    }

    return true;
  }

  decode() {
    return this.decoded;
  }
}

module.exports = Token;
