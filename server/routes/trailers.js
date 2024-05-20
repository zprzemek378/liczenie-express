const express = require("express");
const router = express.Router();
const fs = require("fs");
const db = require("../db.js"); // MONGODB

router.get("/", async (req, res) => {
  try {
    const trailers = await db.collection("trailers").find().toArray();
    res.json(trailers);
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    await db.collection("trailers").insertOne(req.body);
    res.status(201);
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router
  .route("/:id")
  .get((req, res) => {
    //req.trailer
    //req.params.id
  })
  .put((req, res) => {
    //req.params.id
  })
  .delete((req, res) => {
    //req.params.id
  });

// router.param("id", (req, res, next, id) => {
//   req.trailer = trailers[id]; //ustawia to zanim trafi tam wyej
//   next();
// });

module.exports = router;
