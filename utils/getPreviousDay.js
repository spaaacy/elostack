export default function (dateString) {
  // Convert the date string to a Date object
  const date = new Date(dateString);

  // Subtract one day (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
  const previousDayTimestamp = date.getTime() - 24 * 60 * 60 * 1000;

  // Create a new Date object for the previous day
  const previousDay = new Date(previousDayTimestamp);

  // Format the date as year-month-day
  const year = previousDay.getUTCFullYear();
  const month = String(previousDay.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(previousDay.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
