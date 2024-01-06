"use strict";
const mongoose = require("mongoose");

module.exports = function (app) {
  mongoose.connect(process.env.DB);
  const replySchema = new mongoose.Schema({
    text: { type: String, required: true },
    created_on: { type: Date, default: Date.now },
    reported: { type: Boolean, default: false },
    delete_password: { type: String, required: true },
  });
  const threadSchema = new mongoose.Schema({
    text: { type: String, required: true },
    created_on: { type: Date, default: Date.now },
    bumped_on: { type: Date, default: Date.now },
    reported: { type: Boolean, default: false },
    delete_password: { type: String, required: true },
    replies: [replySchema],
  });
  const Reply = mongoose.model("Reply", replySchema);
  const Thread = mongoose.model("Thread", threadSchema);

  app.route("/api/threads/:board")
    .post(async (req, res) => {
      try {
        const board = req.params.board;
        const { text, delete_password } = req.body;
        const thread = new Thread({
          text,
          delete_password,
          replies: [],
        });
        await thread.save();
        res.redirect(`/b/${board}/`);
      } catch (err) {
        res.json({ error: "post thread error" });
      }
    })
    .get(async (req, res) => {
      try {
        const board = req.params.board;
        const threads = await Thread.find(
          {},
          { reported: 0, delete_password: 0 },
        )
          .sort({ bumped_on: -1 })
          .limit(10);
        const limitThreads = threads.map((t) => {
          const { _id, text, created_on, bumped_on, replies } = t;
          const limitReply = replies.slice(0, 3).map((r) => ({
            _id: r._id,
            text: r.text,
            created_on: r.created_on,
          }));
          return {
            _id,
            text,
            created_on,
            bumped_on,
            replies: limitReply,
            replycount: replies.length,
          };
        });
        res.json(limitThreads);
      } catch (err) {
        res.json({ error: "get thread error" });
      }
    })
    .delete(async (req, res) => {
      try {
        const board = req.params.board;
        const { thread_id, delete_password } = req.body;
        const thread = await Thread.findById(thread_id);
        if (thread.delete_password === delete_password) {
          await Thread.findByIdAndDelete(thread_id);
          return res.send("success");
        } else {
          return res.send("incorrect password");
        }
      } catch (err) {
        res.json({ error: "delete thread error" });
      }
    })
    .put(async (req, res) => {
      try {
        const board = req.params.board;
        const { thread_id } = req.body;
        const thread = await Thread.findByIdAndUpdate(
          thread_id,
          { reported: true },
          { new: true },
        );
        res.send("reported");
      } catch (err) {
        res.json({ error: "put thread error" });
      }
    });

  app.route("/api/replies/:board")
    .post(async (req, res) => {
      try {
        const board = req.params.board;
        const { thread_id, text, delete_password } = req.body;
        const newReply = {
          text,
          delete_password,
          created_on: Date.now(),
          reported: false,
        };
        const thread = await Thread.findByIdAndUpdate(
          thread_id,
          { $push: { replies: newReply }, $set: { bumped_on: Date.now() } },
          { new: true },
        );
        res.redirect(`/b/${board}/${thread_id}/`);
      } catch (err) {
        res.json({ error: "post reply error" });
      }
    })
    .get(async (req, res) => {
      try {
        const board = req.params.board;
        const { thread_id } = req.query;
        const thread = await Thread.findById(thread_id, {
          reported: 0,
          delete_password: 0,
          "replies.reported": 0,
          "replies.delete_password": 0,
        });
        res.json(thread);
      } catch (err) {
        res.json({ error: "get reply error" });
      }
    })
    .put(async (req, res) => {
      try {
        const board = req.params.board;
        const { thread_id, reply_id } = req.body;
        const thread = await Thread.findById(thread_id);
        if (thread) {
          const reply = thread.replies.id(reply_id);
          reply.reported = true;
          await thread.save();
          res.send("reported");
        }
      } catch (err) {
        res.json({ error: "put reply error" });
      }
    })
    .delete(async (req, res) => {
      const board = req.params.board;
      const { thread_id, reply_id, delete_password } = req.body;
      const thread = await Thread.findById(thread_id);
      if (thread) {
        const reply = thread.replies.id(reply_id);
        if (reply.delete_password === delete_password) {
          reply.text = "[deleted]";
          await thread.save();
          res.send("success");
        } else {
          res.send("incorrect password");
        }
      }
    });
};
