import axios from "axios";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { CLIENT_KEY } from "../../config/Key"
import { useNavigate } from "react-router-dom";

export default function PaymentRegisterPage({ user }) {
  const navigate = useNavigate();

  const handleRegisterCard = async () => {
    try {
      const tossPayments = await loadTossPayments(CLIENT_KEY);
      const customerKey = user?.id?.toString() || "guest_" + Date.now();

      await tossPayments.requestBillingAuth("CARD", {
        customerKey,
        successUrl: "http://localhost:3000/payment/success",
        failUrl: "http://localhost:3000/payment/fail",
      });
    } catch (error) {
      console.error("카드 등록 실패:", error);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>💳 카드 등록</h2>
      <p>자동 결제를 위해 카드를 등록하세요.</p>
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#0064FF",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        onClick={handleRegisterCard}
      >
        카드 등록하기
      </button>
    </div>
  );
}
