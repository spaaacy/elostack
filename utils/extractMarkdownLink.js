export const extractMarkdownLink = (str) => {
  // Regular expression to match the format [Label](URL)
  const regex = /^\[([^\]]+)\]\((https?:\/\/[^\s]+)\)$/;

  // Test the string against the regular expression
  const match = str.match(regex);

  if (match) {
    return {
      label: match[1],
      url: match[2],
    };
  } else {
    return null;
  }
};
