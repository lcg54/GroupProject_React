import { useEffect, useState } from "react";
import { Container, Card, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { CLIENT_KEY, CUSTOMER_KEY } from "../../constant/keys";
import { API_BASE_URL } from '../../config/url';
import { PencilSquare } from "react-bootstrap-icons";
import { FaCreditCard, FaTimes } from "react-icons/fa";
import TossCardRegisterModal from "../05.payment/TossCardResisterModal";
import { maskCardNumber } from "../../formatter/formats";

export default function MyInfoPage() {
  const { user } = useOutletContext();
  const [cards, setCards] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchCards();
  }, [user]);

  const fetchCards = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fake/payments/cards/${user.id}`);
      setCards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("정말 이 카드를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/fake/payments/card/${cardId}/${user.id}`);
      setCards(cards.filter(card => card.id !== cardId));
      alert("등록된 카드가 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      alert("카드 삭제 중 오류가 발생했습니다.");
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
            
            <Row className="mb-2 p-2">
              <Col md={6}>
                <Form.Label>결제수단</Form.Label>
                {cards.length > 0 ? (
                  <Form>
                    {cards.map(card => (
                      <Form.Group key={card.id} className="mb-2" controlId={`card-${card.id}`}>
                        <InputGroup>
                          <InputGroup.Text>
                            <FaCreditCard />
                          </InputGroup.Text>
                          <Form.Control type="text" value={maskCardNumber(card.cardNum)} readOnly />
                          <Button 
                            variant="outline-danger" 
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            <FaTimes />
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    ))}
                  </Form>
                ) : (
                  <p>등록된 결제수단이 없습니다.</p>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
        
        <Card.Footer>
          <div className="p-2 d-flex justify-content-end gap-3">
            <Button variant="outline-primary" onClick={() => setShowModal(true)}><FaCreditCard /> 결제 수단 등록</Button>
            <Button variant="outline-dark" onClick={() => navigate('/member/edit')}><PencilSquare /> 내 정보 수정</Button>
          </div>
        </Card.Footer>
      </Card>

      {showModal && (
        <TossCardRegisterModal user={user} customerKey={CUSTOMER_KEY(user.id)} onClose={() => {setShowModal(false); fetchCards();}} />
      )}
    </Container>
  );
}