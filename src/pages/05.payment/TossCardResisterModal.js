import { useState } from "react";
import "./TossBillingAuthClone.css";
import axios from "axios";
import { API_BASE_URL } from "../../config/url";

export default function TossCardResisterModal({ user, customerKey, onClose }) {
  const [card1, setCard1] = useState("");
  const [card2, setCard2] = useState("");
  const [card3, setCard3] = useState("");
  const [card4, setCard4] = useState("");

  const [expiry, setExpiry] = useState("");
  const [rrnFront, setRrnFront] = useState("");
  const [rrnBack, setRrnBack] = useState("");

  const [agree, setAgree] = useState(false);
  const [isPersonal, setIsPersonal] = useState(true);
  const [loading, setLoading] = useState(false);

  const registerCard = async () => {
    try {
      setLoading(true);
      let cardNum = `${card1}-${card2}-${card3}-${card4}`;
      await axios.post(`${API_BASE_URL}/fake/payments/billing`, { memberId: user.id, customerKey, cardNum });
      alert(`카드가 등록되었습니다.`);
      onClose(true);
    } catch (err) {
      console.error("카드 등록 실패:", err);
      alert(`서버 오류로 인해 카드 등록에 실패했습니다. 재시도해주세요.`)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tb-modal-backdrop">
      <div className="tb-modal">
        {/* LEFT SIDE */}
        <div className="tb-left">
          <div className="tb-left-header">
            <img
              src="https://media-cdn.linkareer.com/activity_manager/logos/490152"
              alt="toss"
              className="tb-logo"
            />
            <div className="tb-title">등록할 카드를</div>
            <div className="tb-title">입력해주세요</div>
            <div className="tb-merchant">(주) 비버리퍼블리카</div>
          </div>

          <div className="tb-test-badge">실제 결제가 안되는 테스트입니다</div>
        </div>

        {/* RIGHT SIDE */}
        <div className="tb-right">
          {/* CLOSE */}
          <button className="tb-close" onClick={onClose}>✕</button>

          {/* PERSONAL / BUSINESS TAB */}
          <div className="tb-tabs">
            <div
              className={`tb-tab ${isPersonal ? "active" : ""}`}
              onClick={() => setIsPersonal(true)}
            >
              개인
            </div>
            <div
              className={`tb-tab ${!isPersonal ? "active" : ""}`}
              onClick={() => setIsPersonal(false)}
            >
              법인
            </div>
          </div>

          {/* CARD NUMBER */}
          <div className="tb-label">카드번호</div>
          <div className="tb-card-row">
            <input maxLength="4" value={card1} onChange={(e) => setCard1(e.target.value)} />
            <input maxLength="4" value={card2} onChange={(e) => setCard2(e.target.value)} />
            <input maxLength="4" value={card3} onChange={(e) => setCard3(e.target.value)} />
            <input maxLength="4" value={card4} onChange={(e) => setCard4(e.target.value)} />
          </div>

          {/* EXPIRY */}
          <div className="tb-label">유효기간</div>
          <input
            className="tb-input tb-expiry"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />

          {/* RRN */}
          <div className="tb-label">주민등록번호 앞 7자리</div>
          <div className="tb-rrn-row">
            <input
              maxLength="6"
              value={rrnFront}
              onChange={(e) => setRrnFront(e.target.value)}
            />
            <div className="tb-dash">-</div>

            <input
              maxLength="1"
              value={rrnBack}
              onChange={(e) => setRrnBack(e.target.value)}
            />

            <div className="tb-hidden-dots">
              ● ● ● ● ● ●
            </div>
          </div>

          {/* AGREEMENT */}
          <label className="tb-agree">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
            />
            <span>[필수] 서비스 이용약관, 개인정보 처리 동의</span>
          </label>

          {/* BUTTON */}
          <button
            className="tb-submit-btn"
            onClick={registerCard}
            disabled={loading}
          >
            {loading ? "로딩 중..." : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
