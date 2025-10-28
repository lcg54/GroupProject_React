// ExtensionOrReturnDetail.js
import React from 'react';
import { Modal, Button, Image, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/url';

function Completed({ product, period, onClose }) {
  const navigate = useNavigate();
  if (!product) return null;

  return (
    <Modal
      show={true}
      onHide={onClose}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>주문이 완료되었습니다!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col>
            <strong>제품 이름:</strong> {product.name}
          </Col>
        </Row>
        <Row className="mb-3">
          {product.mainImage ? (
            <Col xs={12}>
              <Image
                src={`${API_BASE_URL}/images/${product.mainImage}`}
                thumbnail
                fluid
              />
            </Col>
          ) : (
            <p>제품 이미지가 없습니다.</p>
          )}
        </Row>
        <Row>
          <Col>
            <strong>대여 기간:</strong> {period}년
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={() => navigate('/')}>
          홈페이지
        </Button>
        <Button variant="primary" onClick={() => navigate('/product/list')}>
          상품페이지
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Completed;
