import Units from "ethereumjs-units";

export const getSumFloatNumber = (
  firstValue,
  secondValue,
  numberAfterComma = 2
) => {
  const result =
    Math.round(firstValue * 10 ** numberAfterComma) +
    Math.round(secondValue * 10 ** numberAfterComma);
  return result / 10 ** numberAfterComma;
};

export const getSubtractFloatNumber = (
  firstValue,
  secondValue,
  numberAfterComma = 2
) => {
  const result =
    Math.round(firstValue * 10 ** numberAfterComma) -
    Math.round(secondValue * 10 ** numberAfterComma);
  return result / 10 ** numberAfterComma;
};

export const convertToEth = (value) => {
  if (!value) {
    return "0";
  }

  value = String(value);

  const modifier = value.search("-") === -1 ? "" : "-";

  return modifier + Units.convert(value.replace("-", ""), "wei", "eth");
};

export const convertToWei = (value) => {
  if (!value) {
    return "0";
  }

  return Units.convert(value, "eth", "wei");
};

export const getGasPrice = async () => {
  await window.web3.eth.getGasPrice();
};

export const removeZeros = (str) => {
  let i = str.length - 1;
  while (str[i] === "0") i--;
  if (str[i] === ".") i += 1;
  return str.slice(0, -(str.length - 1 - i));
};
