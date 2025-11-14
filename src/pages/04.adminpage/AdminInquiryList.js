import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Accordion, Card, Pagination, Dropdown, Form, Button, Badge } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../../config/url';
import { Pencil, Trash, Box } from 'react-bootstrap-icons';

export default function AdminInquiryList({ user }) {
    const [inquiries, setInquiries] = useState([]);
    const [adminComments, setAdminComments] = useState({});
    const [paging, setPaging] = useState({
        totalElements: 0,
        pageSize: 10,
        totalPages: 0,
        pageNumber: 0,
    });
    const [activeKey, setActiveKey] = useState(null);
    const [sortOrder, setSortOrder] = useState('latest');
    const [filterAnswered, setFilterAnswered] = useState(null); // null: 전체, true: 답변완료, false: 답변대기
    const [loading, setLoading] = useState(false);

    // 답변 수정 상태: { [inquiryId]: '수정중인 텍스트' }
    const [editingComments, setEditingComments] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            alert('관리자만 접근 가능합니다.');
            navigate('/');
            return;
        }
        fetchInquiries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paging.pageNumber, sortOrder, filterAnswered]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/admin/inquiry`, {
                params: {
                    page: paging.pageNumber,
                    size: paging.pageSize,
                    sort: sortOrder === 'latest' ? 'desc' : 'asc',
                    ...(filterAnswered !== null && { answered: filterAnswered }),
                },
            });
            const data = response.data;

            setInquiries(data.content || []);
            setPaging({
                totalElements: data.totalElements,
                pageSize: data.size,
                totalPages: data.totalPages,
                pageNumber: data.number,
            });
        } catch (err) {
            console.error('❌ 문의 불러오기 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 관리자 답글 작성
    const handleAdminComment = async (inquiryId, comment) => {
        if (!comment?.trim()) {
            alert('답변 내용을 입력해주세요.');
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/product/${inquiries.find(i => i.id === inquiryId).productId}/inquiry/${inquiryId}/comment`,
                {
                    adminId: user.id,
                    comment: comment,
                }
            );
            alert('답글이 등록되었습니다.');
            setAdminComments(prev => ({ ...prev, [inquiryId]: '' }));
            fetchInquiries();
        } catch (err) {
            alert('답글 등록 중 오류가 발생했습니다.');
        }
    };

    // 답변 수정 모드 토글 (키 존재 여부로 토글)
    const toggleEditComment = (inquiryId, currentComment) => {
        setEditingComments(prev => {
            if (Object.prototype.hasOwnProperty.call(prev, inquiryId)) {
                // 이미 수정모드면 키 삭제해서 종료
                const copy = { ...prev };
                delete copy[inquiryId];
                return copy;
            } else {
                // 수정모드로 진입, 현재 코멘트를 초기값으로 넣음
                return { ...prev, [inquiryId]: currentComment ?? '' };
            }
        });
    };

    // 답변 수정 제출
    const handleUpdateComment = async (inquiry) => {
        const newComment = editingComments[inquiry.id];
        if (!newComment?.trim()) {
            alert('답변 내용을 입력해주세요.');
            return;
        }

        try {
            await axios.put(
                `${API_BASE_URL}/product/${inquiry.productId}/inquiry/${inquiry.id}/comment?requesterId=${user.id}`,
                { comment: newComment }
            );
            alert('답변이 수정되었습니다.');
            // 수정 성공하면 해당 키 제거해서 수정모드 종료
            setEditingComments(prev => {
                const copy = { ...prev };
                delete copy[inquiry.id];
                return copy;
            });
            fetchInquiries();
        } catch (err) {
            console.error('❌ 답변 수정 실패:', err);
            alert(err.response?.data || '답변 수정 중 오류가 발생했습니다.');
        }
    };

    // 답변 삭제
    const handleDeleteComment = async (inquiry) => {
        if (!window.confirm('답변을 삭제하시겠습니까?')) return;

        try {
            await axios.delete(
                `${API_BASE_URL}/product/${inquiry.productId}/inquiry/${inquiry.id}/comment`,
                { params: { requesterId: user.id } }
            );
            alert('답변이 삭제되었습니다.');
            fetchInquiries();
        } catch (err) {
            console.error('❌ 답변 삭제 실패:', err);
            alert(err.response?.data || '답변 삭제 중 오류가 발생했습니다.');
        }
    };

    // 문의 삭제
    const handleDeleteInquiry = async (inquiryId) => {
        if (!window.confirm('문의를 삭제하시겠습니까?')) return;

        try {
            await axios.delete(`${API_BASE_URL}/product/inquiry/${inquiryId}`, {
                params: { requesterId: user.id },
            });
            alert('문의가 삭제되었습니다.');
            fetchInquiries();
        } catch (err) {
            console.error('❌ 문의 삭제 실패:', err);
            alert(err.response?.data || '문의 삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <Container className="mt-4" style={{ maxWidth: '1000px' }}>
            <h4 className="mb-4">📋 전체 상품 문의 관리</h4>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex gap-2 align-items-center">
                    <span>전체 {paging.totalElements}건</span>
                    <Badge bg={filterAnswered === false ? 'danger' : 'secondary'}>
                        답변 대기: {inquiries.filter(i => !i.adminComment).length}
                    </Badge>
                </div>

                <div className="d-flex gap-2">
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                            {filterAnswered === null ? '전체' : filterAnswered ? '답변완료' : '답변대기'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setFilterAnswered(null)}>전체</Dropdown.Item>
                            <Dropdown.Item onClick={() => setFilterAnswered(false)}>답변 대기</Dropdown.Item>
                            <Dropdown.Item onClick={() => setFilterAnswered(true)}>답변 완료</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Dropdown>
                        <Dropdown.Toggle variant="outline-primary" size="sm">정렬</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setSortOrder('latest')}>최신순</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSortOrder('oldest')}>오래된순</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>

            {loading ? (
                <p className="text-center text-muted">로딩 중...</p>
            ) : inquiries.length === 0 ? (
                <p className="text-center text-muted">문의 내역이 없습니다.</p>
            ) : (
                <Row>
                    <Accordion
                        activeKey={activeKey}
                        onSelect={(eventKey) => {
                            const selectedInquiry = inquiries[parseInt(eventKey)];
                            if (!selectedInquiry) {
                                setActiveKey(null);
                                return;
                            }
                            setActiveKey(eventKey === activeKey ? null : eventKey);
                        }}
                    >
                        {inquiries.map((inquiry, idx) => (
                            <Accordion.Item eventKey={String(idx)} key={inquiry.id}>
                                <Accordion.Header>
                                    <div className="d-flex align-items-center gap-2 w-100">
                                        {inquiry.isSecret && <span>🔒</span>}
                                        <span
                                            style={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '50%',
                                            }}
                                        >
                                            {inquiry.title}
                                        </span>
                                        <Badge bg={inquiry.adminComment ? 'success' : 'danger'} className="ms-2">
                                            {inquiry.adminComment ? '답변 완료' : '답변 대기'}
                                        </Badge>
                                        <small className="text-muted ms-auto">
                                            {inquiry.member} | {inquiry.type}
                                        </small>
                                    </div>
                                </Accordion.Header>

                                <Accordion.Body>
                                    {/* 상품 정보 */}
                                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                        <div className="d-flex align-items-center gap-2">
                                            <Box size={18} />
                                            <span className="fw-bold">상품 ID: {inquiry.productId}</span>
                                        </div>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => navigate(`/product/${inquiry.productId}`)}
                                        >
                                            상품 페이지로 이동
                                        </Button>
                                    </div>

                                    {/* 문의 내용 */}
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between text-muted mb-2">
                                            <span>{inquiry.member}</span>
                                            <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p style={{ fontWeight: 'bold' }}>{inquiry.title}</p>
                                        <p
                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-all',
                                                overflowWrap: 'break-word',
                                            }}
                                        >
                                            {inquiry.content}
                                        </p>

                                        {/* 문의 삭제 버튼 */}
                                        <div className="d-flex justify-content-end">
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteInquiry(inquiry.id)}
                                            >
                                                <Trash size={14} className="me-1" /> 문의 삭제
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 관리자 답변 */}
                                    {inquiry.adminComment && (
                                        <Card bg="light" className="p-3 mt-4">
                                            <div className="d-flex justify-content-between text-muted mb-2">
                                                <span>고객센터 (담당자: {inquiry.adminComment.admin})</span>
                                                <span>{new Date(inquiry.adminComment.createdAt).toLocaleString()}</span>
                                            </div>

                                            {Object.prototype.hasOwnProperty.call(editingComments, inquiry.id) ? (
                                                // 수정 모드
                                                <>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        value={editingComments[inquiry.id] || ''}
                                                        onChange={(e) =>
                                                            setEditingComments(prev => ({
                                                                ...prev,
                                                                [inquiry.id]: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                    <div className="d-flex justify-content-end gap-2 mt-2">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => toggleEditComment(inquiry.id, null)}
                                                        >
                                                            취소
                                                        </Button>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleUpdateComment(inquiry)}
                                                        >
                                                            저장
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                // 보기 모드
                                                <>
                                                    <p
                                                        style={{
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-all',
                                                            overflowWrap: 'break-word',
                                                        }}
                                                    >
                                                        {inquiry.adminComment.comment}
                                                    </p>
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => toggleEditComment(inquiry.id, inquiry.adminComment.comment)}
                                                        >
                                                            <Pencil size={14} className="me-1" /> 수정
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteComment(inquiry)}
                                                        >
                                                            <Trash size={14} className="me-1" /> 삭제
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </Card>
                                    )}

                                    {/* 답변 작성 폼 */}
                                    {!inquiry.adminComment && (
                                        <Card className="p-3 mt-4">
                                            <Form.Group>
                                                <Form.Label className="fw-bold">관리자 답글 작성</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="답변을 입력하세요..."
                                                    value={adminComments[inquiry.id] || ''}
                                                    onChange={(e) =>
                                                        setAdminComments({
                                                            ...adminComments,
                                                            [inquiry.id]: e.target.value,
                                                        })
                                                    }
                                                />
                                            </Form.Group>
                                            <div className="d-flex justify-content-end mt-2">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleAdminComment(inquiry.id, adminComments[inquiry.id])}
                                                    disabled={!adminComments[inquiry.id]?.trim()}
                                                >
                                                    답글 등록
                                                </Button>
                                            </div>
                                        </Card>
                                    )}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </Row>
            )}

            {/* 페이지네이션 */}
            {!loading && paging.totalPages > 0 && (
                <Pagination className="justify-content-center mt-4">
                    <Pagination.First
                        onClick={() => setPaging(prev => ({ ...prev, pageNumber: 0 }))}
                        disabled={paging.pageNumber === 0}
                    />
                    <Pagination.Prev
                        onClick={() =>
                            setPaging(prev => ({ ...prev, pageNumber: Math.max(0, prev.pageNumber - 1) }))
                        }
                        disabled={paging.pageNumber === 0}
                    />
                    {[...Array(Math.min(10, paging.totalPages))].map((_, idx) => {
                        const pageNum = Math.floor(paging.pageNumber / 10) * 10 + idx;
                        if (pageNum >= paging.totalPages) return null;
                        return (
                            <Pagination.Item
                                key={pageNum}
                                active={paging.pageNumber === pageNum}
                                onClick={() => setPaging(prev => ({ ...prev, pageNumber: pageNum }))}
                            >
                                {pageNum + 1}
                            </Pagination.Item>
                        );
                    })}
                    <Pagination.Next
                        onClick={() =>
                            setPaging(prev => ({
                                ...prev,
                                pageNumber: Math.min(prev.totalPages - 1, prev.pageNumber + 1),
                            }))
                        }
                        disabled={paging.pageNumber >= paging.totalPages - 1}
                    />
                    <Pagination.Last
                        onClick={() => setPaging(prev => ({ ...prev, pageNumber: prev.totalPages - 1 }))}
                        disabled={paging.pageNumber === paging.totalPages - 1}
                    />
                </Pagination>
            )}
        </Container>
    );
}
