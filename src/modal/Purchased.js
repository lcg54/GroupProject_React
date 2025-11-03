import { Modal, Button, Image, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/url';

export default function Purchased({ products, onClose }) {
  const navigate = useNavigate();
  if (!products || products.length === 0) return null;

  return (
    <Modal show onHide={onClose} size="" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>주문이 완료되었습니다!</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {products.map((p, idx) => (
          <div key={idx} className="mb-3">
            <Row className="mb-2">
              <Col><strong>제품 이름:</strong> {p.name}</Col>
            </Row>
            <Row className="mb-2">
              <Col>
                {p.imageUrl ? (
                  <Image src={`${API_BASE_URL}/images/${p.imageUrl}`}
                    style={{ width: 300, height: 300, objectFit: "contain" }}
                    thumbnail
                    fluid
                  />
                ) : (
                  <p>제품 이미지가 없습니다.</p>
                )}
              </Col>
            </Row>
            <Row className="mb-1">
              <Col><strong>대여 기간:</strong> {p.rentalPeriod}년</Col>
            </Row>
            <Row className="mb-1">
              <Col><strong>수량:</strong> {p.quantity}개</Col>
            </Row>
            <Row className="mb-1">
              <Col>
                <strong>월 납부액:</strong> {(p.estimatedPrice || 0).toLocaleString()} ₩
              </Col>
            </Row>
            <hr />
          </div>
        ))}
        <Row>
          <Col>
            <strong>총 납부액:</strong>{" "}
            {products.reduce((sum, p) => sum + (p.estimatedPrice || 0) * p.rentalPeriod * 12, 0).toLocaleString()} ₩
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="danger" onClick={() => navigate('/mypage/receipt')}>
          구매내역
        </Button>
        <Button variant="primary" onClick={() => navigate('/product/list')}>
          상품목록
        </Button>
      </Modal.Footer>
    </Modal>
  );
}