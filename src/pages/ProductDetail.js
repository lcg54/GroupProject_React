import { Card, Col, Container, Row } from "react-bootstrap";
import { API_BASE_URL } from "../config/config";

function App() {
    return (
        <Container className="my-4">
            <Card>
                <Row>
                {/* 이미지 */}
                <Col md={5}>
                    <Card.Img
                    src={`${API_BASE_URL}/images/${product.mainImage}`}
                    alt={product.name}
                    style={{ width: "100%", height: "400px", objectFit: "cover" }}
                    />
                </Col>

                {/* 상품 정보 */}
                <Col md={7}>
                    <Card.Body>
                    <Card.Title>
                        <h2>{product.name}</h2>
                    </Card.Title>
                    <p><strong>카테고리:</strong> {product.category}</p>
                    <p><strong>브랜드:</strong> {product.brand}</p>
                    <p><strong>가격:</strong> {product.pricePerPeriod.toLocaleString()}원</p>
                    <p><strong>상세설명:</strong></p>
                    <p>{product.description}</p>
                    </Card.Body>
                </Col>
                </Row>
            </Card>
    </Container>
    );
}

export default App;