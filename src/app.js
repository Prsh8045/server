require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

require("./db/conn");
const app = express();
const userData = require("./models/schema");

const port = process.env.PORT;
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("./router/auth"));

app.listen(port, () => {
  console.log(`listing to the port no. ${port}`);
});
