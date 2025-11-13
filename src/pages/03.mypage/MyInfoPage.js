import { useEffect, useState } from "react";
import { Container, Card, Row, Col, Form, Button, ListGroup } from "react-bootstrap";
import { useNavigate, useOutletContext } from "react-router-dom";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import axios from "axios";
import { CLIENT_KEY, CUSTOMER_KEY } from "../../config/keys";
import { API_BASE_URL } from '../../config/url';
import { PencilSquare } from "react-bootstrap-icons";
import { FaCreditCard } from "react-icons/fa";

export default function MyInfoPage() {
  const { user } = useOutletContext();
  const [cards, setCards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchRegisteredCards(CUSTOMER_KEY(user.id));
  }, [user]);

  const fetchRegisteredCards = async (key) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/payment/cards/${key}`);
      setCards(res.data.data);
    } catch (err) {
      console.error("카드 조회 실패:", err);
    }
  };

  const handleRegisterCard = async () => {
    try {
      const tossPayments = await loadTossPayments(CLIENT_KEY);
      await tossPayments.requestBillingAuth("CARD", {
        customerKey: CUSTOMER_KEY(user.id),
        successUrl: "http://localhost:3000/payment/success",
        failUrl: "http://localhost:3000/payment/fail",
      });
    } catch (error) {
      console.error("카드 등록 실패:", error);
    }
  };

  return (
    <Container className="mt-4 rounded-4">
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
            
            <Row className="p-2">
              <Col md={6}>
                <h6>결제수단</h6>
                {cards.length > 0 ? (
                  <ListGroup>
                    {cards.map((card) => (
                      <ListGroup.Item key={card.billingKey}>
                        💳 {card.cardCompany} ****{card.lastFourDigits}  
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-muted mt-2">등록된 결제수단이 없습니다.</p>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
        
        <Card.Footer>
          <div className="p-2 d-flex justify-content-end gap-3">
            <Button variant="outline-primary" onClick={handleRegisterCard}><FaCreditCard /> 결제 수단 등록</Button>
            <Button variant="outline-dark" onClick={() => navigate('/member/edit')}><PencilSquare /> 내 정보 수정</Button>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  );
}