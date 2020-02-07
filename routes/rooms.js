const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const Comment = require("../models/Comment");

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
    // .populate("owner comments")
    .populate({
      path: "owner comments",
      populate: {
        path: "author"
      }
    })
    .then(room => {
      let showDelete = false;

      if (req.user && room.owner._id.toString() === req.user._id.toString()) {
        showDelete = true;
      } else if (req.user && req.user.role === "moderator") {
        showDelete = true;
      }
      res.render("rooms/detail.hbs", {
        room,
        showDelete: showDelete,
        user: req.user
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/:id/comments", (req, res, next) => {
  // 6 the axios get request is detected and handled
  Room.findById(req.params.id)
    // .populate("owner comments")
    .populate({
      path: "comments",
      populate: {
        path: "author"
      }
    })
    .then(room => {
      const comments = room.comments.map(comment => {
        return {
          content: comment.content,
          author: comment.author.username
        };
      });
      // 7 we respond with the list of comments obtained from the database for the given room -> FRONTEND
      res.json(comments);
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/:id/delete", (req, res, next) => {
  // if (req.user.role === "moderator") {
  //   Room.deleteOne({ _id: req.params.id })
  //     .then(() => {
  //       res.redirect("/rooms");
  //     })
  //     .catch(err => {
  //       next(err);
  //     });
  // } else {
  //   Room.deleteOne({ _id: req.params.id, owner: req.user._id })
  //     .then(() => {
  //       res.redirect("/rooms");
  //     })
  //     .catch(err => {
  //       next(err);
  //     });
  // }

  const query = {
    _id: req.params.id
  };

  if (req.user.role !== "moderator") {
    query.owner = req.user._id;
  }
  // moderator: query { _id: '5e3d46e43051578b9b860b89' };
  // basic user:  { _id: '5e3d46e43051578b9b860b89', owner: 5e3d33168c73d081a5ea966b }

  Room.deleteOne(query)
    .then(() => {
      res.redirect("/rooms");
    })
    .catch(err => {
      next(err);
    });
});

router.post("/rooms/:id/comments", loginCheck, (req, res, next) => {
  // 2 the axios POST request is detected and handled
  const content = req.body.content;
  const author = req.user._id;
  const roomId = req.params.id;

  Comment.create({
    content: content,
    author: author
  })
    .then(commentDocument => {
      const commentId = commentDocument._id;

      return Room.updateOne(
        { _id: roomId },
        { $push: { comments: commentId } }
      );
    })
    .then(() => {
      // 3 once the comment has been created and the Room.comments updated, we send a response -> FRONTEND
      res.json({});
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
