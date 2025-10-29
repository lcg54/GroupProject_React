export const OrderStatus = [
  "RESERVED",
  "SHIPPING",
  "RENTED",
  "RETURN_REQUESTED",
  "RETURNED",
  "CANCELED",
  "REPAIR",
  "LATE",
];

export function statusLabel(status) {
  const map = {
    RESERVED: "✅ 예약 중",
    SHIPPING: "🚚 배송 중",
    RENTED: "🏠 대여 중",
    RETURN_REQUESTED: "⏳ 반납 요청 중",
    RETURNED: "📬 반납 완료",
    CANCELED: "❌ 예약 취소",
    REPAIR: "🔧 수리 중",
    LATE: "⚠️ 연체",
  };
  return map[status] || status;
}