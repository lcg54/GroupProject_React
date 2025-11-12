import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../config/url";
import { useNavigate } from "react-router-dom";

export default function MyWishListButton({ productId, user, disabled= false }) {
  const [isWished, setIsWished] = useState(false);
  const [busy, setBusy] = useState(false); // 중복 클릭 방지
  const navigate = useNavigate();

  // 서버에서 현재 찜 상태 로드
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) { setIsWished(false); return; }
      try {
        const { data } = await axios.get(`${API_BASE_URL}/wishlist/status`, {
          params: { productId, memberId: user.id },
        });
        if (!cancelled) setIsWished(!!data?.wished);
      } catch (e) {
        console.error("찜 상태 조회 실패:", e);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [productId, user]);

  // 찜하기/해제 
  const handleToggle = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/member/login");
      return;
    }
    if (busy || disabled) return;

    setBusy(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/wishlist/toggle`, {
        memberId: user.id,
        productId,
      });
      setIsWished(typeof data?.wished === "boolean" ? data.wished : !isWished);
    } catch (e) {
      console.error("찜 상태 전환 실패:", e);
      alert("찜 처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={isWished ? "success" : "outline-success"}
      onClick={handleToggle}
      disabled={busy || disabled} // 버튼 비활성화
      className="d-flex align-items-center gap-2"
      style={{ whiteSpace: "nowrap" }}
      aria-pressed={isWished}
      aria-label={isWished ? "찜 해제" : "찜하기"}  
    >
      <span style={{ fontSize: 14 }}>{isWished ? "❤️" : "🤍"}</span>
      <span>{isWished ? "찜 해제" : "찜하기"}</span>
    </Button>
  );
}