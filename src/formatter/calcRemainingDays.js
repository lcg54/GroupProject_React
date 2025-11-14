export default function calcRemainingDays(item) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간 초기화 (날짜 비교용)
  let targetDate = null;

  if (item.status === "RESERVED" && item.rentalStart) {
    targetDate = new Date(item.rentalStart);
  } else if (
    (item.status === "RENTED" || item.status === "RETURN_REQUESTED" || item.status === "RETURNED") &&
    item.rentalEnd
  ) {
    targetDate = new Date(item.rentalEnd);
  }

  if (!targetDate) return null;
  targetDate.setHours(0, 0, 0, 0); // 시간 초기화

  const diffTime = targetDate - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "(기간 종료)";
  if (diffDays === 0) return "(D-day)";
  if (item.status === "RESERVED") return `(대여 시작까지 D-${diffDays})`;
  if (item.status === "RENTED") return `(대여 종료까지 D-${diffDays})`;

  return null;
}
