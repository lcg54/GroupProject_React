import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/url";

export default function PaymentConfirm() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const paymentKey = query.get("paymentKey");
  const orderId = query.get("orderId");
  const amount = Number(query.get("amount"));
  const username = query.get("username");
  const subscriptionId = query.get("subscriptionId");

  const itemsParam = query.get("items");
  const items = itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : [];

  const navigate = useNavigate();

  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentKey || !orderId || !amount || !username || items.length === 0) {
        console.error("결제 승인에 필요한 정보가 부족합니다.");
        return;
      }
      try {
        await axios.post(`${API_BASE_URL}/fake/subscriptions/confirm/${subscriptionId}`, {
          paymentKey,
          orderId,
          amount,
          username,
          items,
        });
      } catch (err) {
        alert("결제 실패: " + (err.response?.data?.message || err.message));
      } finally {
        navigate(`/mypage/receipt`)
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, username, items]);

  return <div>결제가 진행 중입니다.</div>;
}