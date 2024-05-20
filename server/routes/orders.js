const express = require("express");
const router = express.Router();
const fs = require("fs");
const db = require("../db.js"); // MONGODB

const path = require("path");
const verifyJWT = require("../middleware/verifyJWT");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

router.get("/", verifyJWT, async (req, res) => {
  try {
    const userOrders = await db
      .collection("orders")
      .find({ email: req.email })
      .toArray();

    res.status(200).json(userOrders);
  } catch (err) {
    console.log(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      orderdate,
      ordernumber,
      pickuplocation,
      pickupdate,
      dropofflocation,
      dropoffdate,
      truck,
      trailer,
      duration,
      totalcost,
      firstname,
      lastname,
      address,
      city,
      zip,
      email,
      phone,
    } = req.body;

    const newOrder = {
      orderdate: orderdate,
      ordernumber: ordernumber,
      pickuplocation: pickuplocation,
      pickupdate: pickupdate,
      dropofflocation: dropofflocation,
      dropoffdate: dropoffdate,
      truck: truck,
      trailer: trailer,
      duration: duration,
      totalcost: totalcost,
      firstname: firstname,
      lastname: lastname,
      address: address,
      city: city,
      zip: zip,
      email: email,
      phone: phone,
    };

    await db.collection("orders").insertOne(newOrder);

    res.status(201).json({
      success: "New order added",
    });
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
