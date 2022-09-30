const express = require("express");

const router = express.Router();
const userData = require("../models/schema");
const postData = require("../models/postdata");
const bcrypt = require("bcrypt");
const Authanticate = require("../middleware/authanticate");

router.get("/", (req, res) => {
  res.send("i am from router");
});

router.post("/register", async (req, res) => {
  try {
    let data = {
      name: "admin",
      email: "adminrajput@gmail.com",
      password: "nitinrajput",
      user_name: "prashant",
      gender: "male",
      mobile: 9876543210,
    };

    const { name, email, password, user_name, gender, mobile } = data;
    console.log(req.body);
    if (!name || !email || !password || !user_name || !gender || !mobile) {
      res.status(422).json({ error: "please filled properly" });
    } else {
      const document = await userData.findOne({ email: email });
      if (document) {
        res.status(422).json({ error: "email already exist" });
      } else {
        const userdata = new userData({
          name,
          email,
          password,
          user_name,
          gender,
          mobile,
        });

        const result = await userdata.save();
        if (result) {
          res.status(201).json({ message: "registered successfully" });
        } else {
          res.status(500).json({ message: "registration failed" });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    let data = {
      email: "adminrajput@gmail.com",
      password: "nitinrajput",
    };
    const { password, email } = data;
    if (!password & !email) {
      res.status(422).json({ error: "please fill properly" });
    }

    const document = await userData.findOne({ email: email });

    if (document) {
      const isMatch = await bcrypt.compare(password, document.password);

      const token = await document.genreateToken();

      console.log(token);

      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 1000000),
      });

      if (!isMatch) {
        res.status(400).json({ message: "user error" });
      } else {
        res.status(200).json({ message: "user login successfully" });
      }
    } else {
      res.status(400).json({ message: "user error" });
    }
  } catch (error) {
    console.log(error);
  }
});

// router.get("/cart", Authanticate, (req, res) => {
//   res.send(req.user);
// });

router.post("/createpost", Authanticate, (req, res) => {
  let data = {
    title: "my first post",
    body: "picture",
    pic: "image",
  };
  const { title, body, pic } = data;
  if (!title || !body || !pic) {
    return res.status(422).json({ error: "Plase add all the fields" });
  }
  const postdata = new postData({
    title,
    body,
    pic,
  });
  postdata
    .save()
    .then((result) => {
      res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/like", Authanticate, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});

router.put("/unlike", Authanticate, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});

router.put("/comment", Authanticate, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

router.delete("/deletepost/:postId", Authanticate, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(422).json({ error: err });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            res.json(result);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
});

module.exports = router;
