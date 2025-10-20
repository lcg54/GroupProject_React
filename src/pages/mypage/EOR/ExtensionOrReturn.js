// ExtensionOrReturn.js
import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ProductDetail from './ExtensionOrReturnDetail';

function ExtensionOrReturn() {
  const [products, setProduct] = useState([
    { id: 1, name: "제품 A", period: "2025-10-01 ~ 2025-10-31", images: ["/img1.jpg"] },
    { id: 2, name: "제품 B", period: "2025-10-05 ~ 2025-11-05", images: ["/img1.jpg"] },
    { id: 3, name: "제품 C", period: "2025-09-20 ~ 2025-10-20", images: ["/img1.jpg"] },
    { id: 4, name: "제품 D", period: "2025-10-10 ~ 2025-11-10", images: ["/img1.jpg"] },
    { id: 5, name: "제품 E", period: "2025-10-15 ~ 2025-11-15", images: ["/img1.jpg"] },
    { id: 6, name: "제품 F", period: "2025-10-20 ~ 2025-11-20", images: ["/img1.jpg"] }
  ]);

  const [hoveredProduct, setHoveredProduct] = useState(null);

  return (
    <Container className="py-4">
      {hoveredProduct && (
        <ProductDetail
          product={hoveredProduct}
          onMouseLeave={() => setHoveredProduct(null)}
        />
      )}

      <Row>
        {products.map(product => (
          <Col md={4} key={product.id} className="mb-4">
            <Card
              onClick={() => {
                if (hoveredProduct && hoveredProduct.id === product.id) {
                  setHoveredProduct(null);
                } else {
                  setHoveredProduct(product);
                }
              }}
              className="h-100 shadow-sm"
              border="primary"
              style={{ cursor: 'pointer' }}
            >
              <Card.Body>
                <Card.Title className="text-primary fw-bold">
                  제품이름: {product.name}
                </Card.Title>
                <Card.Text className="text-muted">
                  기간: {product.period}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ExtensionOrReturn;
