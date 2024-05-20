const express = require("express");
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcrypt");
const db = require("../db.js"); // MONGODB

const jwt = require("jsonwebtoken");

const path = require("path");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const fsPromises = require("fs").promises;

const maxAge = 1 * 60 * 60 * 1000;

router.get(
  "/allUsers",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  async (req, res) => {
    try {
      const users = await db.collection("users").find().toArray();
      const allUsers = users.map((u) => ({
        email: u.email,
        firstname: u.firstname,
        lastname: u.lastname,
        roles: Object.values(u.roles),
      }));

      res.status(200).json(allUsers);
    } catch (err) {
      console.log(err);
    }
  }
);

//logowanie
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    const foundUser = await db.collection("users").findOne({ email: email });
    if (!foundUser) {
      res.status(401).json({ error: "No user in database" });
      return;
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    //JWT:
    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: foundUser.email,
          roles: Object.values(foundUser.roles),
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" } //moze 5-15 minut
    );
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    //zapisywanie do bazy refreshTokenu danego uzytkownika

    await db
      .collection("users")
      .findOneAndUpdate(
        { email: email },
        { $set: { refreshToken: refreshToken } }
      );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,

      maxAge: maxAge,
      sameSite: "None",
      secure: true,
    });
    console.log("ciastko pewnie wysłane");
    //moze wysylac accessToken tez jako httponly cookie
    res.json({
      email: foundUser.email,
      roles: Object.values(foundUser.roles),
      accessToken,
      firstname: foundUser.firstname,
      lastname: foundUser.lastname,
    });
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//rejestracja
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstname, lastname, roles } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required" });

    const duplicate = await db.collection("users").findOne({ email: email });
    if (duplicate) return res.sendStatus(409); //409 - podany przy rejestracji email juz istnieje

    //tworzenie nowego uzytkownika
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email: email,
      password: hashedPassword,
      firstname: firstname,
      lastname: lastname,
      roles: roles,
    };

    await db.collection("users").insertOne(newUser);
    res.status(201).json({
      success: "New user created",
    });
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//wylogowywanie
router.get("/logout", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(204); //no content

    const refreshToken = cookies.jwt;

    const foundUser = await db
      .collection("users")
      .findOne({ refreshToken: refreshToken });

    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        maxAge: maxAge,
        sameSite: "None",
        secure: true,
      });

      res.sendStatus(204);
      return;
    }

    //usuwanie z bazy refreshTokenu danego uzytkownika
    await db
      .collection("users")
      .findOneAndUpdate(
        { refreshToken: refreshToken },
        { $set: { refreshToken: "" } }
      );

    res.clearCookie("jwt", {
      httpOnly: true,
      maxAge: maxAge,
      sameSite: "None",
      secure: true,
    });
    res.sendStatus(204);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
