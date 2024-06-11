export const formatTime = (dateTimeString, onlyDate = false) => {
  const dateTime = new Date(dateTimeString);

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  if (onlyDate) {
    const day = dateTime.getDate();
    const month = dateTime.toLocaleString("en-US", { month: "long" });
    const year = dateTime.getFullYear();
    const ordinalSuffix = getOrdinalSuffix(day);

    return `${month} ${day}${ordinalSuffix}, ${year}`;
  } else {
    const options = {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    return dateTime.toLocaleString("en-US", options);
  }
};
