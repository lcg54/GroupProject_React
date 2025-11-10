import { useLocation } from "react-router-dom";

export default function PaymentFail() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const code = query.get("code");
  const message = query.get("message");

  return (
    <div style={{ padding: "2rem" }}>
      <h1>결제 실패 😢</h1>
      <p>에러 코드: {code}</p>
      <p>사유: {message}</p>
      <a href="/payment">다시 시도하기</a>
    </div>
  );
}