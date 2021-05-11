module.exports = function convertHoursToMinutess(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const timeInMinutes = hours * 60 + minutes;

  return timeInMinutes;
};
