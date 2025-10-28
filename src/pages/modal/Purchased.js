import { Modal, Button, Image, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/url';

export default function Purchased({ products, onClose }) {
  const navigate = useNavigate();
  if (!products || products.length === 0) return null;

  return (
    <Modal show onHide={onClose} size="lg" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>주문이 완료되었습니다!</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {products.map((p, idx) => (
          <div key={idx} className="mb-4 border-bottom pb-3">
            <Row className="mb-2">
              <Col>
                <strong>제품 이름:</strong> {p.name}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col xs={12}>
                {p.imageUrl ? (
                  <Image
                    src={`${API_BASE_URL}/images/${p.imageUrl}`}
                    thumbnail
                    fluid
                  />
                ) : (
                  <p>제품 이미지가 없습니다.</p>
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                <strong>대여 기간:</strong> {p.rentalPeriod}년
              </Col>
            </Row>
          </div>
        ))}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={() => navigate('/product/list')}>
          상품목록
        </Button>
        <Button variant="danger" onClick={() => navigate('/receipt')}>
          구매내역
        </Button>
      </Modal.Footer>
    </Modal>
  );
}