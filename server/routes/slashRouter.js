const express = require("express");
const router = express.Router();
const db = require("../db.js"); // MONGODB

router.get("/", async (req, res) => {
  try {
    const names = await db.collection("names").find().toArray();

    res.status(200).json(names);
  } catch (err) {
    console.log(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    const newName = { name: name };

    await db.collection("names").insertOne(newName);

    res.status(201).json({
      success: "New order added",
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
