const mongoose = require("mongoose");

const mySchema = new mongoose.Schema({
  title: {
    type: "String",
    required: true,
  },
  body: {
    type: "String",
    required: true,
  },
  pic: {
    type: "String",
    required: true,
  },
});

const postData = mongoose.model("postData", mySchema);

module.exports = postData;
