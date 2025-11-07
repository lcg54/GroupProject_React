import axios from "axios";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../../config/url';

export default function PaymentSuccessPage({ user }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const authKey = params.get("authKey");
    const customerKey = params.get("customerKey");

    if (!authKey) return;

    axios
      .post(`${API_BASE_URL}/api/payments/billing`, { authKey, customerKey })
      .then((res) => {
        alert("✅ 카드 등록 완료!\nBillingKey: " + res.data);
        navigate("/mypage/receipt");
      })
      .catch((err) => {
        console.error("빌링키 발급 실패:", err);
        alert("빌링키 발급 실패: " + err.message);
      });
  }, [params]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>결제 인증 중...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
}
