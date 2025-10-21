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
            createdAt: '2025-10-15T14:30:00',
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
            createdAt: '2025-10-14T14:30:00',
            isSecret: false,
        },
        {
            id: 5,
            title: '문의제목55',
            member: '작성자5',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-13T14:30:00',
            isSecret: false,
        },
        {
            id: 6,
            title: '문의제목666666666666',
            member: '작성자6666',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-12T14:30:00',
            isSecret: false,
        },
        {
            id: 7,
            title: '문의제목7777777',
            member: '작성자7777777',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-11T14:30:00',
            isSecret: false,
        },
        {
            id: 8,
            title: '문의제목88',
            member: '작성자7777777',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-10T14:30:00',
            isSecret: false,
        },
        {
            id: 9,
            title: '문의제목99',
            member: '작성자7777777',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-09T14:30:00',
            isSecret: false,
        },
        {
            id: 10,
            title: '문의제목1000000',
            member: '작성자7777777',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-08T14:30:00',
            isSecret: false,
        },
        {
            id: 11,
            title: '문의제목1111111111111111111111',
            member: '작성자7777777',
            content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ   ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            createdAt: '2025-10-07T14:30:00',
            isSecret: false,
        },
    ];

    const [paging, setPaging] = useState({
        totalElements: inquiries.length,
        pageSize: 5,
        totalPages: Math.ceil(inquiries.length / 5),
        pageNumber: 0,
        pageCount: 10,
        beginPage: 0,
        endPage: Math.min(Math.ceil(inquiries.length / 5), 10) - 1,
        pagingStatus: '',
        searchDateType: 'all',
        category: '',
        searchMode: '',
        searchKeyword: ''
    });

    const [activeKey, setActiveKey] = useState(null);
    const [sortOrder, setSortOrder] = useState('latest');

    const sortedInquiries = [...inquiries].sort((a, b) => {
        if (sortOrder === 'latest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
    })

    const startIdx = paging.pageNumber * paging.pageSize;
    const endIdx = startIdx + paging.pageSize;
    const visibleInquiries = sortedInquiries.slice(startIdx, endIdx);



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
            <Row>
                <Accordion
                    activeKey={activeKey}
                    onSelect={(eventKey) => {
                        const selectedInquiry = visibleInquiries[parseInt(eventKey)];
                        if (!selectedInquiry) {
                            setActiveKey(null);
                            return;
                        }
                        if (selectedInquiry.isSecret) {
                            alert('비공개 문의입니다.');
                            return;
                        }
                        setActiveKey(eventKey === activeKey ? null : eventKey);
                    }}
                >
                    {visibleInquiries
                        .map((inquiry, idx) => (
                            <Accordion.Item eventKey={String(idx)} key={inquiry.id}>
                                <Accordion.Header>
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
                                        {inquiry.title}
                                    </span>
                                    {inquiry.isSecret && (<span>🔒</span>)}
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


        </Container >
    );
}

export default App;