const db = require("../config/db");

exports.handleChat = async (req, res) => {

    const message = req.body.message.toLowerCase();

    try {

        const keywords = message.split(" ");

        const query = `
        SELECT * FROM items
        WHERE status='found'
        AND (
            name LIKE ? OR
            description LIKE ?
        )
        LIMIT 5
        `;

        const keyword = `%${keywords[1]}%`;

        const [results] = await db.query(query,[keyword,keyword]);

        if(results.length === 0){
            return res.json({
                reply: "Sorry, I could not find similar items."
            });
        }

        return res.json({
            reply: "I found some similar items",
            items: results
        });

    } catch(error){
        console.log(error);
        res.status(500).json({error:"Server error"});
    }

};