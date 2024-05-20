const express = require("express");
const router = express.Router();
const fs = require("fs");
const db = require("../db.js"); // MONGODB

const jwt = require("jsonwebtoken");

const path = require("path");
// require("dotenv").config({ path: path.join(__dirname, "..", ".env") }); //NIE WIEM CO Z TYM

//refreshing-token
router.get("/", async (req, res) => {
  try {
    const users = await db.collection("users").find().toArray();
    const cookies = req.cookies;
    console.log(cookies);
    if (!cookies?.jwt) return res.sendStatus(401);
    console.log(cookies.jwt);

    const refreshToken = cookies.jwt;

    const foundUser = await db
      .collection("users")
      .findOne({ refreshToken: refreshToken });
    if (!foundUser) {
      res.sendStatus(403);
      return;
    }

    //JWT:

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser.email !== decoded.email) {
          return res.sendStatus(403);
        }
        const accessToken = jwt.sign(
          {
            UserInfo: {
              email: decoded.email,
              roles: Object.values(foundUser.roles),
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "30s" }
        );
        res.json({
          email: foundUser.email,
          accessToken,
          roles: Object.values(foundUser.roles),
          firstname: foundUser.firstname,
          lastname: foundUser.lastname,
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
