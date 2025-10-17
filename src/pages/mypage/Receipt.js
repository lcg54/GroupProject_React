import { useState } from "react";
import { Alert, Card, Col, Container, Row } from "react-bootstrap";

export default function Receipt() {

    const products = [
        { id: 1, name: "제품 A", period: "2025-10-01 ~ 2025-10-31", images: ["/img1.jpg"], price: 15000 },
        { id: 2, name: "제품 B", period: "2025-10-05 ~ 2025-11-05", images: ["/img1.jpg"], price: 20000 },
        { id: 3, name: "제품 C", period: "2025-09-20 ~ 2025-10-20", images: ["/img1.jpg"], price: 3000 }
    ];


    return (
        <Container>
            <h2>000님의 결제내역</h2>

            {products.length === 0 ? (
                <Alert variant="secondary">주문 내역이 없습니다.</Alert>
            ) : (
                <Row>
                    {products.map((bean) => (
                        <Col key={bean.id} md={12} className="mb-4">
                            <Card className="h-100 Shadow-sm">
                                <div className="d-flex justify-content-between">
                                    <Card.Title>제품 이름: {bean.name}</Card.Title>
                                </div>

                                <Card.Text>{bean.images}</Card.Text>

                                <Card.Text>
                                    대여 기간: {bean.period}
                                </Card.Text>
                                <div className="d-flex justify-content-end mt-auto">
                                    <Card.Text className="text-end">
                                        {/* 여기 내용을 넣으세요 */}
                                        월 납입금: {bean.price.toLocaleString()}원
                                    </Card.Text>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
}