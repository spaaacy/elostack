export const formatTime = (dateTimeString, type = null) => {
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

  if (type === "date") {
    const day = dateTime.getDate();
    const month = dateTime.toLocaleString("en-US", { month: "long" });
    const year = dateTime.getFullYear();
    const ordinalSuffix = getOrdinalSuffix(day);

    return `${month} ${day}${ordinalSuffix}, ${year}`;
  } else if (type === "time") {
    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    return dateTime.toLocaleString("en-US", options);
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
