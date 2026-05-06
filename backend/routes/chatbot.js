const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/ask", (req, res) => {

  const message = req.body.message.toLowerCase().trim();

  // remove common words
  const stopWords = [
    "i","lost","my","a","the","near","at","in","on","please","find"
  ];

  const words = message.split(" ");

  const keywords = words.filter(w => !stopWords.includes(w));

  if(keywords.length === 0){
    return res.json({
      reply: "Please describe the lost item."
    });
  }

  const searchWord = keywords[0];

  const sql = `
    SELECT DISTINCT title, description, location, location_text
    FROM items
    WHERE LOWER(title) LIKE ?
       OR LOWER(description) LIKE ?
  `;

  const search = `%${searchWord}%`;

  db.query(sql,[search,search],(err,rows)=>{

    if(err){
      console.log("CHATBOT ERROR:",err);
      return res.json({reply:"Error searching items."});
    }

    if(rows.length === 0){
      return res.json({
        reply:`No items found related to "${searchWord}".`
      });
    }

    let reply = `I found these items related to "${searchWord}":\n\n`;

    rows.slice(0,5).forEach(item=>{

      const place =
        item.location_text ||
        item.location ||
        "Unknown location";

      reply += `• ${item.title} found at ${place}\n`;

    });

    res.json({reply});

  });

});

module.exports = router;