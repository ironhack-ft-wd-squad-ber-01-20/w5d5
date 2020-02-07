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

const loginCheck = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect("/");
  }
};

router.get("/rooms/new", loginCheck, (req, res) => {
  res.render("rooms/add.hbs");
});

router.post("/rooms", loginCheck, (req, res, next) => {
  const { name, description, price } = req.body;
  Room.create({
    name,
    description,
    price,
    owner: req.user._id
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
    .populate("owner")
    .then(room => {
      const showDelete = room.owner._id.toString() === req.user._id.toString();

      res.render("rooms/detail.hbs", { room, showDelete: showDelete });
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
