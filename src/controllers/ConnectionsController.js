const db = require("../database/connection");

module.exports = {
  async index(req, res) {
    const totalConnections = await db("connections").count("* as total");

    const { total } = totalConnections[0];

    return res.json({ total });
  },

  async store(req, res) {
    const { user_id } = req.body;

    await db("connections").insert({
      user_id,
    });

    return res.status(201).send();
  },
};
