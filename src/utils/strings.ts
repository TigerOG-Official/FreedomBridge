export const shortenAddress = (value: string, chars = 4) => {
  if (!value) {return "";}
  return `${value.slice(0, chars + 2)}…${value.slice(-chars)}`;
};
