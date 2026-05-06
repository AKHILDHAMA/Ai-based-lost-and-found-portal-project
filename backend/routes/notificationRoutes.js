module.exports = function (io) {

  const express = require("express");
  const router = express.Router();
  const db = require("../db");

  /* =========================
     MARK ALL NOTIFICATIONS READ
  ========================= */

  router.post("/mark-read",(req,res)=>{

    const { email } = req.body;

    db.query(
      "UPDATE notifications SET is_read=1 WHERE user_email=?",
      [email],
      (err)=>{

        if(err){
          console.log("Mark read error:",err);
          return res.status(500).send("DB error");
        }

        res.json({message:"Notifications marked read"});

      }
    );

  });

  /* =========================
     GET USER NOTIFICATIONS
  ========================= */

  router.get("/:email",(req,res)=>{

    const email = req.params.email;

    db.query(
      "SELECT * FROM notifications WHERE user_email=? ORDER BY created_at DESC",
      [email],
      (err,rows)=>{

        if(err){
          console.log("Notification fetch error:",err);
          return res.status(500).send("DB error");
        }

        res.json(rows);

      }
    );

  });

  return router;

};