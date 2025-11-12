import axios from "axios";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";

export default function PaymentRegisterSuccess({ user }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const authKey = params.get("authKey");
    const customerKey = params.get("customerKey");

    if (!authKey || !customerKey || !user) {console.log(authKey, customerKey); return;}

    // 1️. billingKey 발급 요청
    axios
      .post(`${API_BASE_URL}/api/payments/billing`, { authKey, customerKey })
      .then((res) => {
        const billingKey = res.data;
        console.log("✅ billingKey 발급 완료:", billingKey);

        // 2️. billingKey를 DB에 저장
        return axios.post(`${API_BASE_URL}/api/payments/billing-key`, {
          billingKey,
          customerKey,
          memberId: user.id,
        });
      })
      .then(() => {
        alert("카드 등록 및 저장이 완료되었습니다.");
        navigate("/mypage/receipt");
      })
      .catch((err) => {
        console.error("❌ 빌링키 처리 실패:", err);
        alert("카드 등록 중 오류 발생: " + err.message);
      });
  }, [params, user, navigate]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>결제 인증 중...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
}