import React, { useState } from 'react';
import { Container, Card, Pagination } from "react-bootstrap";

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
        {
            id: 5,
            member: "유저5이름",
            rating: 1,
            comment: '최고.',
            createdAt: '2025-10-14T07:00:00',
        },
        {
            id: 6,
            member: "유저6이름",
            rating: 5,
            comment: '최고.',
            createdAt: '2025-10-14T07:00:00',
        },
        {
            id: 7,
            member: "유저4이름",
            rating: 1,
            comment: '최고.',
            createdAt: '2025-10-14T07:00:00',
        },
        {
            id: 8,
            member: "유저4이름",
            rating: 1,
            comment: '최고.',
            createdAt: '2025-10-14T07:00:00',
        },
    ]

    const [paging, setPaging] = useState({
        totalElements: reviews.length,
        pageSize: 5,
        totalPages: Math.ceil(reviews.length / 5),
        pageNumber: 0,
        pageCount: 10,
        beginPage: 0,
        endPage: Math.min(Math.ceil(reviews.length / 5), 10) - 1,
        pagingStatus: '',
        searchDateType: 'all',
        category: '',
        searchMode: '',
        searchKeyword: ''
    });


    const [sortOrder, setSortOrder] = useState('latest');

    const sortedInquiries = [...reviews].sort((a, b) => {
        if (sortOrder === 'latest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
    })

    const startIdx = paging.pageNumber * paging.pageSize;
    const endIdx = startIdx + paging.pageSize;
    const visibleInquiries = sortedInquiries.slice(startIdx, endIdx);

    const randerStrars = (rating) => {
        const fullStars = '★'.repeat(rating);
        const emptyStars = '☆'.repeat(5 - rating);
        return fullStars + emptyStars;
    }

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
                        onClick={() => setSortOrder('latest')}
                    >
                        최신순
                    </span>
                    <span
                        style={{
                            cursor: 'pointer',
                            color: sortOrder === 'oldest' ? 'blue' : 'inherit',
                            textDecoration: sortOrder === 'oldest' ? 'underline' : 'none',
                        }}
                        onClick={() => setSortOrder('oldest')}
                    >
                        오래된순
                    </span>
                </div>
            </div>
            {visibleInquiries.map((review) => (
                <Card key={review.id} style={{ marginBottom: '5px' }}>
                    <Card.Body>
                        <p>평점: {randerStrars(review.rating)}</p>
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
            <Pagination className="justify-content-center mt-4">
                <Pagination.First
                    onClick={() => {
                        setPaging((previous) => ({ ...previous, pageNumber: 0 }));
                    }}
                    disabled={paging.pageNumber === 0}
                    as="button"
                >
                    첫페이지
                </Pagination.First>

                <Pagination.Prev
                    onClick={() => {
                        const gotoPage = paging.pageNumber - 1;
                        setPaging((previous) => ({ ...previous, pageNumber: gotoPage }));
                    }}
                    disabled={paging.pageNumber === 0}
                    as="button"
                >
                    이전
                </Pagination.Prev>

                {[...Array(paging.endPage - paging.beginPage + 1)].map((_, idx) => {
                    const pageIndex = paging.beginPage + idx + 1;

                    return (
                        <Pagination.Item
                            key={pageIndex}
                            active={paging.pageNumber === (pageIndex - 1)}
                            onClick={() => {
                                setPaging((previous) => ({ ...previous, pageNumber: (pageIndex - 1) }));
                            }}
                        >
                            {pageIndex}
                        </Pagination.Item>
                    )
                })}


                <Pagination.Next
                    onClick={() => {
                        const gotoPage = paging.pageNumber + 1;
                        setPaging((previous) => ({ ...previous, pageNumber: gotoPage }));
                    }}
                    disabled={paging.pageNumber >= paging.totalPages - 1}
                    as="button"
                >
                    다음
                </Pagination.Next>

                <Pagination.Last
                    onClick={() => {
                        const gotoPage = paging.totalPages - 1;
                        setPaging((previous) => ({ ...previous, pageNumber: gotoPage }));
                    }}
                    disabled={paging.pageNumber === paging.totalPages - 1}
                    as="button"
                >
                    마지막페이지
                </Pagination.Last>
            </Pagination>

        </Container>
    );


}