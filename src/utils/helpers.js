
/*
  Возвращает true с указанной вероятностью в процентах
  @param {number} percent - Вероятность в процентах (0-100)
  @returns {boolean}
*/
export const probability = (percent) => {
  if (percent <= 0) return false;
  if (percent >= 100) return true;
  return Math.random() * 100 < percent;
};