export const F3M_MARKET_APPROVAL_FOR_ALL = "F3M_MARKET_APPROVAL_FOR_ALL";

export const getApprovalStatus = () => {
  const isApproved =
    localStorage.getItem(F3M_MARKET_APPROVAL_FOR_ALL) || "false";
  return JSON.parse(isApproved);
};

export const setApprovalStatus = (isApproved) => {
  localStorage.setItem(F3M_MARKET_APPROVAL_FOR_ALL, JSON.stringify(isApproved));
};
