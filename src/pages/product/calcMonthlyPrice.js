export default function calcMonthlyPrice( period, price ) {
  return Math.round(price / (period * 20) - 5100);
}