const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================
   SEND MESSAGE
========================= */

router.post("/send", (req, res) => {

  let { sender_id, receiver_id, message } = req.body;

  sender_id = parseInt(sender_id);
  receiver_id = parseInt(receiver_id);

  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  /* -------------------------
     CHECK IF CHAT ALLOWED
  ------------------------- */

  const checkSQL = `
    SELECT * FROM claims
    WHERE claimant_id = ?
       OR claimant_id = ?
    LIMIT 1
  `;

  db.query(checkSQL,[sender_id,receiver_id],(err,rows)=>{

    if(err){
      console.log("❌ Claim check error:",err);
      return res.status(500).json({error:"Database error"});
    }

    if(rows.length === 0){
      return res.status(403).json({error:"Chat not allowed"});
    }

    /* -------------------------
       INSERT MESSAGE
    ------------------------- */

    const sql = `
      INSERT INTO chat_messages (sender_id, receiver_id, message)
      VALUES (?, ?, ?)
    `;

    db.query(sql,[sender_id,receiver_id,message],(err,result)=>{

      if(err){
        console.log("❌ Chat insert error:",err);
        return res.status(500).json({error:"Database error"});
      }

      res.json({
        id: result.insertId,
        sender_id,
        receiver_id,
        message,
        created_at: new Date()
      });

    });

  });

});

/* =========================
   GET CHAT HISTORY
========================= */

router.get("/history/:user1/:user2",(req,res)=>{

  let {user1,user2} = req.params;

  user1 = parseInt(user1);
  user2 = parseInt(user2);

  const sql = `
    SELECT * FROM chat_messages
    WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `;

  db.query(sql,[user1,user2,user2,user1],(err,rows)=>{

    if(err){
      console.log("❌ Fetch chat history error:",err);
      return res.status(500).json({error:"Database error"});
    }

    res.json(rows);

  });

});

/* =========================
   DELETE CHAT
========================= */

// -------------------------
// DELETE CHAT (OWNER ONLY)
// -------------------------
router.delete("/delete/:user1/:user2", (req, res) => {

  let { user1, user2 } = req.params;

  user1 = parseInt(user1);
  user2 = parseInt(user2);

  const sql = `
    DELETE FROM chat_messages
    WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
  `;

  db.query(sql, [user1, user2, user2, user1], (err, result) => {

    if (err) {
      console.log("❌ Delete chat error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      message: "Chat deleted successfully"
    });

  });

});

module.exports = router;