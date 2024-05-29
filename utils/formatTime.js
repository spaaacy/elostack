export const formatTime = (dateTimeString) => {
  const dateTime = new Date(dateTimeString);
  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  return dateTime.toLocaleString("en-US", options);
};
