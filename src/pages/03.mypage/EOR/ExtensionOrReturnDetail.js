// ExtensionOrReturnDetail.js
import React from 'react';
import { Modal, Button, Image, Row, Col } from 'react-bootstrap';

function ExtensionOrReturnDetail({ product, onMouseLeave }) {
  if (!product) return null;

  return (
    <Modal
      show={true}
      onHide={onMouseLeave}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>제품이름: {product.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          {product.images && product.images.length > 0 ? (
            product.images.map((imgSrc, idx) => (
              <Col key={idx} xs={4} className="mb-2">
                <Image src={imgSrc} thumbnail fluid />
              </Col>
            ))
          ) : (
            <p>제품 이미지가 없습니다.</p>
          )}
        </Row>
        <Row>
          <Col>
            <strong>기간: </strong> {product.period}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={() => alert('반납 클릭')}>
          반납
        </Button>
        <Button variant="primary" onClick={() => alert('연장 클릭')}>
          연장
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ExtensionOrReturnDetail;
