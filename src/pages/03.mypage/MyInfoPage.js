import { useEffect, useState } from "react";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate, useOutletContext } from "react-router-dom";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { CLIENT_KEY } from "../../config/Key"

export default function MyInfoPage() {
  const { user } = useOutletContext();

  const [customerKey, setCustomerKey] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setCustomerKey(user.id.toString() + "_" + Date.now());
  }, [user]);

  const handleRegisterCard = async () => {
    try {
      const tossPayments = await loadTossPayments(CLIENT_KEY);
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
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h5 className="mt-2">내 정보</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row className="mb-2 p-2">
              <Col md={6}>
                <Form.Group controlId="username">
                  <Form.Label>아이디</Form.Label>
                  <Form.Control type="text" value={user.username} disabled />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="password">
                  <Form.Label>비밀번호</Form.Label>
                  <Form.Control type="password" value={"********"} readOnly />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-2 p-2">
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>이메일</Form.Label>
                  <Form.Control type="email" value={user.email} readOnly />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="name">
                  <Form.Label>이름</Form.Label>
                  <Form.Control type="text" value={user.name} readOnly />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-2 p-2">
              <Col md={6}>
                <Form.Group controlId="phone">
                  <Form.Label>전화번호</Form.Label>
                  <Form.Control type="text" value={user.phone} readOnly />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="address">
                  <Form.Label>주소</Form.Label>
                  <Form.Control type="text" value={user.address} readOnly />
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-3 p-2">
              <Button variant="secondary" onClick={() => { navigate('/member/edit'); }}>내 정보 수정</Button>
              <Button variant="outline-primary" onClick={handleRegisterCard}>카드 등록하기</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}