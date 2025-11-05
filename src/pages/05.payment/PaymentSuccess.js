import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/url";

export default function PaymentSuccess() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const paymentKey = query.get("paymentKey");
  const orderId = query.get("orderId");
  const amount = query.get("amount");

  useEffect(async () => {
    // 백엔드로 결제 승인 요청 보내기
    try {
      const res = await axios.post(`${API_BASE_URL}/api/payments/confirm`, {
      paymentKey,
      orderId,
      amount,
    }) 
    console.log("결제 승인 성공:", res.data);
    } catch (err) {
      console.error("결제 승인 실패:", err);
    };
  }, [paymentKey, orderId, amount]);

  return <div>결제가 완료되었습니다!</div>;
}