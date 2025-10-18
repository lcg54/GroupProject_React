import React, { useState } from 'react';
import { Container, Row, Accordion, Card, Pagination } from 'react-bootstrap';

function App() {

    const inquiries = [
        {
            id: 1,
            title: '문의제목 1',
            member: '작성자1',
            content: '문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 문의 내용 1 ',
            createdAt: '2025-10-17T10:00:00',
            isSecret: true,
            adminComment: {
                id: 101,
                comment: '문의 주신 내용에 대해 검토 후 연락드리겠습니다.',
                createdAt: '2025-10-17T15:00:00',
                admin: '관리자A'
            },
        },
        {
            id: 2,
            title: '문의제목이대박엄청왕길수도있는거잖아요어디까지길어도되는건가요2222222222222',
            member: '작성자2',
            content: '문의내용2 문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2문의내용2',
            createdAt: '2025-10-16T14:30:00',
            isSecret: false,
        },
        {
            id: 3,
            title: '문의제목3 3 3  3',
            member: '작성자3',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-16T14:30:00',
            isSecret: false,
            adminComment: {
                id: 101,
                comment: '문의 주신 내용에 대해 검토 후 연락드리겠습니다.',
                createdAt: '2025-10-17T15:00:00',
                admin: '관리자C'
            },
        },
        {
            id: 4,
            title: '문의제목4444444444',
            member: '작성자4',
            content: 'ㅇㅇㅇㅇㅇㅇ4ㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-16T14:30:00',
            isSecret: false,
        },
        {
            id: 5,
            title: '문의제목55',
            member: '작성자5',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-16T14:30:00',
            isSecret: false,
        },
        {
            id: 6,
            title: '문의제목666666666666',
            member: '작성자6666',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-16T14:30:00',
            isSecret: false,
        },
        {
            id: 7,
            title: '문의제목7777777',
            member: '작성자7777777',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-16T14:30:00',
            isSecret: false,
        },
    ];

    const [sortOrder, setSortOrder] = useState('latest')


    return (
        <Container style={{ maxWidth: '800px' }}>
            <h2 className="mb-3 text-center">상품문의</h2>
            <div className="text-end mb-3">
                <button>문의 작성</button>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <span>전체 {inquiries.length}</span>
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


            <Row>
                <Accordion defaultActiveKey={null}>
                    {inquiries
                        .map((inquiry, idx) => (
                            <Accordion.Item eventKey={String(idx)} key={inquiry.id}>
                                <Accordion.Header>
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
                                        {inquiry.title}
                                    </span>
                                    {inquiry.isSecret && (
                                        <span>🔒</span>
                                    )}
                                    <span className={`ms-3 ${inquiry.adminComment ? 'text-success' : 'text-danger'}`}>
                                        {inquiry.adminComment ? '답변 완료' : '처리중'}
                                    </span>

                                </Accordion.Header>
                                <Accordion.Body>
                                    <p style={{ fontWeight: 'bold' }}>{inquiry.title}</p>
                                    <div className="d-flex justify-content-between text-muted">
                                        <span>{inquiry.member}</span>
                                        <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="my-3">
                                        <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflowWrap: 'break-word' }}>{inquiry.content}</p>
                                    </div>
                                    {inquiry.adminComment && (
                                        <Card bg="light" className="p-3 mt-4">
                                            <div className="d-flex justify-content-between text-muted">
                                                <span>고객센터</span>
                                                <span>{new Date(inquiry.adminComment.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="my-3">
                                                <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflowWrap: 'break-word' }}>{inquiry.adminComment.comment}</p>
                                            </div>
                                            <span>담당자 {inquiry.adminComment.admin}</span>
                                        </Card>
                                    )}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                </Accordion>
            </Row>

        </Container >
    );
}

export default App;