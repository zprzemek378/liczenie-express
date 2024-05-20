const express = require("express");
const router = express.Router();
const fs = require("fs");
const db = require("../db.js"); // MONGODB

router.get("/", async (req, res) => {
  try {
    const trucks = await db.collection("trucks").find().toArray();
    res.json(trucks);
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    await db.collection("trucks").insertOne(req.body);
    res.status(201);
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router
  .route("/:id")
  .get((req, res) => {
    //req.params.id
  })
  .put((req, res) => {
    //req.params.id
  })
  .delete((req, res) => {
    //req.params.id
  });

// router.param("id", (req, res, next, id) => {

//   next();
// });

module.exports = router;
