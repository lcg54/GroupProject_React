export const formatDate = (dateString) => {
  if (!dateString) return "정보 없음";
  const d = new Date(dateString);
  if (isNaN(d)) return "잘못된 날짜";
  return d
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\. /g, "-")
    .replace(".", "");
};

export const formatPrice = (price) => {
  if (price == null || isNaN(price)) return "0원";
  return Number(price).toLocaleString("ko-KR") + "원";
};

export const maskName = (name) => {
  if (!name) return "";
  if (name.length === 1) return name;
  return name[0] + "*".repeat(name.length - 1);
};