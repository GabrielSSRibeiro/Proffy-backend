const db = require("../database/connection");
const convertHoursToMinutes = require("../utils/convertHoursToMinutes");

module.exports = {
  async index(req, res) {
    const { week_day, subject, time } = req.query;

    if (!week_day || !subject || !time) {
      return res.status(400).json({ error: "Missing filters to search classes" });
    }

    const timeInMinutes = convertHoursToMinutes(time);

    const classes = await db("classes")
      .whereExists(function () {
        this.select("class_schedule.*")
          .from("class_schedule")
          .whereRaw("`class_schedule`. `class_id` = `classes`.`id`")
          .whereRaw("`class_schedule`. `week_day` = ??", [Number(week_day)])
          .whereRaw("`class_schedule`. `from` <= ??", [timeInMinutes])
          .whereRaw("`class_schedule`. `to` > ??", [timeInMinutes]);
      })
      .where("classes.subject", "=", subject)
      .join("users", "classes.user_id", "=", "users.id")
      .select(["classes.*", "users.*"]);

    return res.json(classes);
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
