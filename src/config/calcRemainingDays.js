export default function calcRemainingDays(item) {
  const today = new Date();
  let targetDate = null;

  if (item.status === "RESERVED" && item.rentalStart) {
    targetDate = new Date(item.rentalStart);
  } else if (
    (item.status === "RENTED" || item.status === "RETURN_REQUESTED" || item.status === "RETURNED") && item.rentalEnd) {
    targetDate = new Date(item.rentalEnd);
  }

  if (!targetDate) return null;

  const diffTime = targetDate - today;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "(기간 종료)";
  if (item.status === "RESERVED") return `(대여 시작까지 D-${diffDays})`;
  if (item.status === "RENTED") return `(대여 종료까지 D-${diffDays})`;

  return null;
}
