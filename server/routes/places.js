const express = require("express");
const router = express.Router();
const fs = require("fs");
const db = require("../db.js"); // MONGODB

router.get("/", async (req, res) => {
  try {
    const places = await db.collection("places").find().toArray();
    res.json(places);
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    await db.collection("places").insertOne(req.body);
    res.status(201);
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router
  .route("/:id")
  .get((req, res) => {})
  .put((req, res) => {})
  .delete((req, res) => {});

// router.param("id", (req, res, next, id) => {
//   next();
// });

module.exports = router;
