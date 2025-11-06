import axios from "axios";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { API_BASE_URL } from "../../config/url";
import { CLIENT_KEY } from "./Key"

export default function PaymentPage({ user }) {
  
  const handlePayment = async () => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const username = user?.username || storedUser?.username;

    console.log("💬 결제 요청 사용자:", username);

    if (!username) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 1. 백엔드에 결제 준비 요청
    const readyRes = await axios.post(`${API_BASE_URL}/api/payments/ready`, {
      username,
      items: [
        { productId: 1, quantity: 2, periodYears: 6 },
      ],
      totalAmount: 1,
    });

    const { orderId, amount, customerName } = readyRes.data;

    // 2. Toss 결제창 호출
    const tossPayments = await loadTossPayments(CLIENT_KEY);
    tossPayments.requestPayment("카드", {
      amount,
      orderId,
      orderName: "상품 결제",
      customerName,
      successUrl: "http://localhost:3000/payment/success",
      failUrl: "http://localhost:3000/payment/fail",
    });
  };

  return (
    <div>
      <h1>결제 페이지</h1>
      <button onClick={handlePayment}>결제하기</button>
    </div>
  );
}