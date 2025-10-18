import React, { useState } from 'react';
import { Container, Card } from "react-bootstrap";

export default function App() {


    const reviews = [
        {
            id: 1,
            member: "유저1이름",
            rating: 5,
            comment: '정말 만족스러운 제품이에요!',
            createdAt: '2025-10-16T10:30:00',
            productImage: "리뷰이미지1",
        },
        {
            id: 2,
            member: "유저2이름",
            rating: 4,
            comment: '좋아요. 근데 배송이 조금 늦었어요.',
            createdAt: '2025-10-15T14:20:00',
            productImage: "리뷰이미지2",
        },
        {
            id: 3,
            member: "유저3이름",
            rating: 2,
            comment: '생각보다 별로였어요.',
            createdAt: '2025-10-14T09:00:00',
        },
        {
            id: 4,
            member: "유저4이름",
            rating: 1,
            comment: '최고.',
            createdAt: '2025-10-14T07:00:00',
        },
    ]


    const [sortOrder, setSortOrder] = useState('latest')

    return (
        <Container style={{ maxWidth: '800px' }}>
            <h2 className="mb-3 text-center">상품 후기</h2>
            <div className="text-end mb-3">
                <button>후기 작성</button>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <span>전체 {reviews.length}</span>
                <div>
                    <span
                        style={{
                            cursor: 'pointer',
                            color: sortOrder === 'latest' ? 'blue' : 'inherit',
                            textDecoration: sortOrder === 'latest' ? 'underline' : 'none',
                            marginRight: '10px',
                        }}
                    >
                        최신순
                    </span>
                    <span
                        style={{
                            cursor: 'pointer',
                            color: sortOrder === 'oldest' ? 'blue' : 'inherit',
                            textDecoration: sortOrder === 'oldest' ? 'underline' : 'none',
                        }}
                    >
                        오래된순
                    </span>
                </div>
            </div>
            {reviews.map((review) => (
                <Card key={review.id} style={{ marginBottom: '5px' }}>
                    <Card.Body>
                        <p>평점: {review.rating}</p>
                        <div className="d-flex justify-content-between text-muted">
                            <span>{review.member}</span>
                            <span>{new Date(review.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="my-2">
                            {review.comment}
                            <div>
                                {review.productImage && (
                                    <img src={review.productImage} />
                                )}
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );


}