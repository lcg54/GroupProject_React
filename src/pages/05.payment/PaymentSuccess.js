import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/url";

export default function PaymentSuccess() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const paymentKey = query.get("paymentKey");
  const orderId = query.get("orderId");
  const amount = Number(query.get("amount"));
  const username = query.get("username");

  const itemsParam = query.get("items");
  const items = itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : [];

  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentKey || !orderId || !amount || !username || items.length === 0) {
        console.error("결제 승인에 필요한 정보가 부족합니다.");
        return;
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/api/payments/confirm`, {
          paymentKey,
          orderId,
          amount,
          username,
          items,
        });
        console.log("결제 승인 성공:", res.data);
      } catch (err) {
        console.error("결제 승인 실패:", err);
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, username, items]);

  return <div>결제가 완료되었습니다!</div>;
}