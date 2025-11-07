import axios from "axios";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { API_BASE_URL } from "../../config/url";
import { CLIENT_KEY } from "./Key"
import { useNavigate } from "react-router-dom";

export default function PaymentPage({ user }) {
  const navigate = useNavigate();

  const handlePayment = async () => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const username = user?.username || storedUser?.username;

    if (!username) {
      alert("로그인이 필요합니다.");
      return;
    }

    const itemsToOrder = [
      { productId: 2, quantity: 1, periodYears: 6 },
    ];

    // 1. 결제 준비
    const readyRes = await axios.post(`${API_BASE_URL}/api/payments/ready`, {
      username,
      items: itemsToOrder,
      totalAmount: 1,
    });

    const { orderId, amount, customerName, items } = readyRes.data;

    // 2. Toss 결제창
    const tossPayments = await loadTossPayments(CLIENT_KEY);
    tossPayments.requestPayment("카드", {
      amount,
      orderId,
      orderName: "상품 결제",
      customerName,
      successUrl: `${window.location.origin}/payment/confirm?orderId=${orderId}&amount=${amount}&username=${username}&items=${encodeURIComponent(JSON.stringify(items))}`,
      failUrl: `${window.location.origin}/payment/fail`,
    });
  };

  return (
    <div>
      <h1>결제 페이지</h1>
      <button onClick={handlePayment}>테스트: 단건결제 (productId: 2, quantity: 1, periodYears: 6, price: 1원)</button>
      <br />
      <button onClick={() => navigate("/payment/register")}>
        테스트: 카드 등록
      </button>
    </div>
  );
}