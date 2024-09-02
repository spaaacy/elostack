export default function (date, time, useLocalTimezone = true) {
  let tzString;

  if (useLocalTimezone) {
    // Get the user's timezone offset in minutes
    const tzOffset = new Date().getTimezoneOffset();

    // Convert the offset to hours and minutes
    const tzHours = Math.abs(Math.floor(tzOffset / 60))
      .toString()
      .padStart(2, "0");
    const tzMinutes = Math.abs(tzOffset % 60)
      .toString()
      .padStart(2, "0");

    // Determine the sign of the offset
    const tzSign = tzOffset > 0 ? "-" : "+";

    // Construct the timezone string
    tzString = `${tzSign}${tzHours}:${tzMinutes}`;
  } else {
    // Use UTC timezone
    tzString = "Z";
  }

  // Combine everything into the timestamptz string
  const timestamptz = `${date}T${time}:00${tzString}`;

  return timestamptz;
}
