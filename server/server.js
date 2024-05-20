const express = require("express");
const app = express();
const db = require("./db.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use(express.json());

const port = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://zprzemek378.github.io/fresh-car-rental/",
  "https://zprzemek378.github.io/liczenie/",
  "https://github.io",
  "https://zprzemek378.github.io",
];

app.use(cors({ credentials: true, origin: allowedOrigins }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});

app.use(express.static("public"));

app.use(cookieParser());

const slashRouter = require("./routes/slashRouter");

app.use("/", slashRouter);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
