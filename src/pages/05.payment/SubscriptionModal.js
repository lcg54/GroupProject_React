import { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Image, Spinner } from "react-bootstrap";
import { CreditCard, PlusCircle, CheckCircle } from "react-bootstrap-icons";
import axios from "axios";
import { API_BASE_URL } from "../../config/url";
import TossCardRegisterModal from "../05.payment/TossCardResisterModal";
import { useNavigate } from "react-router-dom";
import { CUSTOMER_KEY, CLIENT_KEY } from "../../constant/keys";
import { loadTossPayments } from "@tosspayments/payment-sdk";

export default function SubscriptionModal({ user, item, onClose }) {
  const memberId = user?.id;
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [firstBillingDate, setFirstBillingDate] = useState("");

  const rentalStartDate = item.rentalStart ? new Date(item.rentalStart) : new Date();
  const formatDate = (d) => d.toISOString().split("T")[0];
  
  const [showChargeOption, setShowChargeOption] = useState(false);
  const [showCardReg, setShowCardReg] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);

  const [paymentItems, setPaymentItems] = useState([item]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

  const today = new Date();
  const minDate = new Date(Math.max(today, rentalStartDate.getTime() - 21 * 24 * 60 * 60 * 1000));
  const maxDate = new Date(rentalStartDate.getTime());

  // 기존 구독 정보 불러오기
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/subscriptions/by-item/${item.itemId}`);
        if (res.data && res.data.id) {
          setSubscriptionId(res.data.id);
          setFirstBillingDate(res.data.firstBillingDate.split("T")[0]);
        } else {
          setFirstBillingDate(formatDate(rentalStartDate)); // 기본값
        }
      } catch (err) {
        setFirstBillingDate(formatDate(rentalStartDate));
      } finally {
        setLoading(false);
      }
    };
    if (memberId && item?.itemId) fetchSubscription();
    fetchCards();
  }, [memberId, item]);

  const fetchCards = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fake/payments/cards/${user.id}`);
      setCards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!memberId || !item.itemId || !firstBillingDate) {
      alert("정보가 올바르지 않습니다.");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/subscriptions/create`, {
        memberId,
        rentalItemId: item.itemId,
        amount: item.pricePerUnit,
        firstBillingDate,
      });
      setSubscriptionId(res.data.id);
      alert(`정기결제 등록이 완료되었습니다.`);
    } catch (err) {
      console.error(err);
      alert("등록된 결제수단이 없습니다. 먼저 결제수단을 등록해주세요.");
    }
  };

  const handleChargeNowWithCard = async () => {
    if (!selectedCardId) return alert("결제할 카드를 선택해주세요.");
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await axios.post(`${API_BASE_URL}/fake/subscriptions/charge-now/${subscriptionId}`, {
        cardId: selectedCardId
      });
      alert("선택한 카드로 결제가 완료되었습니다.");
      setShowChargeOption(false);
      navigate(`/mypage/receipt`);
    } catch (err) {
      console.error(err);
      alert("결제 실패: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // 총 금액 계산
      const totalAmount = paymentItems.reduce(
        (sum, item) => sum + (item.pricePerUnit || 0) * item.quantity,
        0
      );

      // 결제 준비
      const readyRes = await axios.post(`${API_BASE_URL}/api/payments/ready`, {
        username: user.username,
        items: paymentItems,
        totalAmount,
      });

      const { orderId, amount, customerName, items: orderedItems } = readyRes.data;

      // Toss 결제 요청
      const tossPayments = await loadTossPayments(CLIENT_KEY);
      tossPayments.requestPayment("카드", {
        amount,
        orderId,
        orderName: "상품 결제",
        customerName,
        successUrl: `${window.location.origin}/payment/confirm?orderId=${orderId}&amount=${amount}&username=${user.username}&items=${encodeURIComponent(JSON.stringify(orderedItems))}&subscriptionId=${subscriptionId}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      console.error("결제 준비 실패:", err);
      alert("결제 준비에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return null;

  return (
    <>
      {/* 처리 중 오버레이 (모달은 유지되며 화면 전체에 띄움) */}
      {processing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.45)",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontSize: "1.1rem",
            gap: "12px",
          }}
        >
          <Spinner animation="border" role="status" />
          <div>결제 처리 중...</div>
        </div>
      )}

      <Modal show onHide={onClose} centered backdrop="static" keyboard={false} enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title>결제 정보</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="mb-3">
            <Col><strong>제품명:</strong> {item.productName}</Col>
          </Row>

          <Row className="mb-4">
            <Col>
              {item.mainImage ? (
                <Image
                  src={item.mainImage && `${API_BASE_URL}/images${item.mainImage.replace(/.*images/, '')}`}
                  style={{ width: 300, height: 300, objectFit: "contain" }}
                  thumbnail
                  fluid
                />
              ) : (
                <p>제품 이미지가 없습니다.</p>
              )}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col><strong>요금제:</strong> <span className="text-primary">월 {item.pricePerUnit?.toLocaleString()}원</span></Col>
          </Row>

          <Row className="mb-1">
            <Col className="d-flex align-items-center">
              <strong>정기 결제일:&nbsp;</strong>
              <input
                type="date"
                value={firstBillingDate}
                onChange={(e) => setFirstBillingDate(e.target.value)}
                className="form-control"
                style={{ maxWidth: "150px" }}
                min={formatDate(minDate)}
                max={formatDate(maxDate)}
                disabled={!!subscriptionId} // 이미 구독중이면 수정 불가
              />
              <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>&nbsp;부터 매 월 자동납부</span>
            </Col>
            {!subscriptionId && (
              <p className="mt-2" style={{ fontSize: "0.8rem", color: "#6c757d", margin: 0 }}>
                대여 시작일로부터 3주 이내로 정기 결제일을 지정할 수 있습니다.
              </p>
            )}
          </Row>
        </Modal.Body>

        <Modal.Footer>
          {!subscriptionId ? (
            <>
              <Button variant="outline-danger" onClick={() => setShowCardReg(true)}>
                <CreditCard className="me-1" /> 결제 수단 등록
              </Button>
              <Button variant="outline-primary" onClick={handleCreate}>
                <CheckCircle className="me-1" /> 정기 결제 등록
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline-primary" onClick={() =>  {fetchCards(); setShowChargeOption(true);}}>
                <CreditCard className="me-1" /> 이번 달 요금 즉시 납부하기
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {showChargeOption && (
        <Modal show onHide={() => setShowChargeOption(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>결제 수단 선택</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-2">등록된 카드</p>

            {cards.length > 0 ? (
              <>
                {cards.map((card) => (
                  <div key={card.id} className="d-flex align-items-center mb-2">
                    <input
                      type="radio"
                      name="cardSelect"
                      value={card.id}
                      checked={selectedCardId === card.id}
                      onChange={() => setSelectedCardId(card.id)}
                      className="me-2"
                    />
                    <span><CreditCard /> ****-****-****-{card.cardNum.slice(-4)}</span>
                  </div>
                ))}

                {/* 버튼 정렬 영역 */}
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="primary" onClick={handleChargeNowWithCard}>
                    <CreditCard className="me-1" /> 선택 카드로 결제
                  </Button>
              
                  <Button
                    variant="dark"
                    onClick={() => {
                      setPaymentItems([item]);
                      setShowChargeOption(false);
                      handlePayment();
                    }}
                  >
                    <PlusCircle className="me-1" /> 다른 결제수단 사용
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p>등록된 카드가 없습니다.</p>
            
                <div className="d-flex justify-content-end mt-3">
                  <Button
                    variant="primary"
                    onClick={() => {setShowChargeOption(false); setShowCardReg(true);}}>
                    <CreditCard className="me-1" /> 카드 등록
                  </Button>
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>
      )}

      {showCardReg && (
        <TossCardRegisterModal user={user} customerKey={CUSTOMER_KEY(memberId)} onClose={(registered) => {setShowCardReg(false);}} />
      )}
    </>
  );
}