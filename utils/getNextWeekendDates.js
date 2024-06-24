export default function () {
  const now = new Date();
  const currentDay = now.getDay();

  // Calculate how many days until the next Saturday (6) and Sunday (0)
  const daysUntilSaturday = (6 - currentDay + 7) % 7;
  const daysUntilSunday = (7 - currentDay) % 7;

  // If today is Saturday or Sunday, we need to add 7 days to get to the next one
  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));

  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));

  // Function to format the date to 'YYYY-MM-DDT12:00:00Z'
  const formatTimestamptz = (date) => {
    date.setUTCHours(12, 0, 0, 0); // Set time to 12:00:00 UTC
    return date.toISOString().replace(".000", ""); // Remove milliseconds
  };
  return {
    nextSaturday: formatTimestamptz(nextSaturday),
    nextSunday: formatTimestamptz(nextSunday),
  };
}
