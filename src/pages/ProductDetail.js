import { Card, Col, Container, Row, Table } from "react-bootstrap";
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
                </Row>
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

                {/* 대여 정보 */}
                <Table className="my-3">
                    <tbody>
                        <tr>
                            <td><strong>총 재고</strong></td>
                            <td>{product.totalStock}</td>
                        </tr>
                        <tr>
                            <td><strong>예약 중</strong></td>
                            <td>{product.reservedStock}</td>
                        </tr>
                        <tr>
                            <td><strong>대여 중</strong></td>
                            <td>{product.rentedStock}</td>
                        </tr>
                        <tr>
                            <td><strong>수리 중</strong></td>
                            <td>{product.repairStock}</td>
                        </tr>
                    </tbody>
                </Table>
            </Card>
    </Container>
    );
}

export default App;