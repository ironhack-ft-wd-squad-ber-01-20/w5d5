const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

router.get("/rooms", (req, res) => {
  Room.find()
    .then(rooms => {
      res.render("rooms/list.hbs", { rooms, user: req.user });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/new", (req, res) => {
  res.render("rooms/add.hbs");
});

router.post("/rooms", (req, res, next) => {
  const { name, description, price } = req.body;
  Room.create({
    name,
    description,
    price
  })
    .then(() => {
      res.redirect("/rooms");
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/:id", (req, res, next) => {
  Room.findById(req.params.id)
    .then(room => {
      res.render("rooms/detail.hbs", { room });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/:id/delete", (req, res, next) => {
  Room.deleteOne({ _id: req.params.id })
    .then(() => {
      res.redirect("/rooms");
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
