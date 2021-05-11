const db = require("../database/connection");
const convertHoursToMinutes = require("../utils/convertHoursToMinutes");

module.exports = {
  index(req, res) {
    return res.json("myGet");
  },

  async store(req, res) {
    const { name, avatar, whatsapp, bio, subject, cost, schedule } = req.body;

    const trx = await db.transaction();

    try {
      // users
      const insertedUsersIds = await trx("users").insert({ name, avatar, whatsapp, bio });
      const user_id = insertedUsersIds[0];

      // classes
      const insertedClassesIds = await trx("classes").insert({ subject, cost, user_id });
      const class_id = insertedClassesIds[0];

      // schedule
      const classSchedule = schedule.map((item) => ({
        class_id,
        week_day: item.week_day,
        from: convertHoursToMinutes(item.from),
        to: convertHoursToMinutes(item.to),
      }));
      await trx("class_schedule").insert(classSchedule);

      await trx.commit();

      return res.status(201).send();
    } catch (error) {
      console.log(error);
      await trx.rollback();

      return res.status(400).json({ error: "Unexpected error while creating new class" });
    }
  },
};
