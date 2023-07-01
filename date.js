exports.getDate = () => {
  const date = new Date();
  const options = { weekday: "long" };
  const day = date.toLocaleDateString("en-US", options);
  return day;
};
