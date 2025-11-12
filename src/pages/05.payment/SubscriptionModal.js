import { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Image } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../config/url";
import { useNavigate } from "react-router-dom";

export default function SubscriptionModal({ user, item, onClose }) {
  const memberId = user?.id;
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [firstBillingDate, setFirstBillingDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const rentalStartDate = item.rentalStart ? new Date(item.rentalStart) : new Date();
  const formatDate = (d) => d.toISOString().split("T")[0];

  const navigate = useNavigate();

  // 결제일 제한
  const today = new Date();
  const minDate = new Date(Math.max(today, rentalStartDate.getTime() - 14 * 24 * 60 * 60 * 1000));
  const maxDate = new Date(rentalStartDate.getTime() + 14 * 24 * 60 * 60 * 1000);

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
        setIsLoading(false);
      }
    };

    if (memberId && item?.itemId) {
      fetchSubscription();
    }
  }, [memberId, item]);

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
      alert(`✅ 구독 생성 완료!\nSubscription ID: ${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert("등록된 결제 수단이 없습니다. 먼저 결제 수단을 등록해주세요.");
    }
  };

  const handleChargeNow = async () => {
    if (!subscriptionId) return alert("먼저 구독을 생성하세요.");
    try {
      await axios.post(`${API_BASE_URL}/api/subscriptions/charge-now/${subscriptionId}`);
      alert("결제가 완료되었습니다.");
    } catch (err) {
      console.error(err);
      alert("결제 실패: " + (err.response?.data?.message || err.message));
    }
  };

  if (isLoading) return null;

  return (
    <Modal show onHide={onClose} centered backdrop="static" keyboard={false}>
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
                src={`${API_BASE_URL}/images/${item.mainImage}`}
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
            <span style={{ fontSize: "0.9rem", color: "#6c757d"}}>&nbsp;부터 매 월 자동납부</span>
          </Col>
          {!subscriptionId && (
            <p className="mt-2" style={{ fontSize: "0.8rem", color: "#6c757d", margin: 0 }}>
              대여 시작일로부터 2주 이내로 정기 결제일을 지정할 수 있습니다.
            </p>
          )}
        </Row>
      </Modal.Body>

      <Modal.Footer>
        {!subscriptionId ? (
          <>
            <Button variant="secondary" onClick={() => navigate(`/payment/register`)}>💳 결제 수단 등록</Button>
            <Button variant="outline-primary" onClick={handleCreate}>✅ 정기 결제 등록</Button>
          </>

        ) : (
          <>
            <Button variant="outline-primary" onClick={handleChargeNow}>💳 이번 달 요금 즉시 납부하기</Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}