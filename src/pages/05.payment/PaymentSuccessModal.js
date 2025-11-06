import { Modal, Button, Image, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/url';

export default function PaymentSuccessModal({ products, onClose }) {
  const navigate = useNavigate();
  if (!products?.length) return null;

  const totalAmount = products.reduce(
    (sum, p) => sum + (p.estimatedPrice || 0) * p.rentalPeriod * 12,
    0
  );

  return (
    <Modal show onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>결제가 완료되었습니다 🎉</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {products.map((p, idx) => (
          <div key={idx} className="mb-4">
            <Row>
              <Col className="text-center">
                <Image
                  src={`${API_BASE_URL}/images/${p.imageUrl}`}
                  style={{ width: 200, height: 200, objectFit: 'contain' }}
                  fluid
                  thumbnail
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col><strong>제품:</strong> {p.name}</Col>
            </Row>
            <Row><Col><strong>기간:</strong> {p.rentalPeriod}년</Col></Row>
            <Row><Col><strong>수량:</strong> {p.quantity}개</Col></Row>
            <Row><Col><strong>월 납부액:</strong> {p.estimatedPrice.toLocaleString()} ₩</Col></Row>
            <hr />
          </div>
        ))}
        <h5 className="text-end text-danger">
          총 납부액: {totalAmount.toLocaleString()} ₩
        </h5>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="danger" onClick={() => navigate('/mypage/receipt')}>
          구매내역 보기
        </Button>
        <Button variant="primary" onClick={() => navigate('/product/list')}>
          상품 목록으로
        </Button>
      </Modal.Footer>
    </Modal>
  );
}