import { StarFill, StarHalf, Star } from "react-bootstrap-icons";
import { FaCreditCard } from "react-icons/fa";

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

export const renderStars = (rating) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // 0.5 단위로 반올림

  for (let i = 1; i <= 5; i++) {
    if (roundedRating >= i) {
      stars.push(<StarFill key={`full-${i}`} color="#FFD700" />);
    } else if (roundedRating >= i - 0.5) {
      stars.push(<StarHalf key={`half-${i}`} color="#FFD700" />);
    } else {
      stars.push(<Star key={`empty-${i}`} color="#ccc" />);
    }
  }
  return <span>{stars}</span>;
};

export const maskCardNumber = (cardNum) => {
  if (!cardNum) return "";
  const visible = cardNum.slice(-4);
  return '****-****-****-' + visible;
};