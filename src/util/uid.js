const crypto = require("crypto-browserify");

export default function uid() {
  return crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]+/g, "");
}
