import { Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentRegisterFail({ user }) {
  const navigate = useNavigate();

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const code = query.get("code");
  const message = decodeURIComponent(query.get("message") || "");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-red-500 mb-4">결제 실패 😥</h2>
        <p className="text-gray-700 mb-2">코드: {code}</p>
        <p className="text-gray-700 mb-6">메시지: {message}</p>
        <Button onClick={() => navigate(`/`)}>홈으로 돌아가기</Button>
      </div>
    </div>
  );
}