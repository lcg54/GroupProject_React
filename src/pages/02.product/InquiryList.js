import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Container, Row, Accordion, Card, Pagination, Dropdown, Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../../config/url';
import { maskName } from '../../formatter/formats';
import { Pencil, Trash } from 'react-bootstrap-icons';

export default function InquiryList() {
  const { user } = useOutletContext();
  const { id } = useParams(); // 상품 ID
  const [inquiries, setInquiries] = useState([]);
  const [adminComments, setAdminComments] = useState({});
  const [paging, setPaging] = useState({
    totalElements: 0,
    pageSize: 5,
    totalPages: 0,
    pageNumber: 0,
    beginPage: 0,
    endPage: 0,
  });
  const [activeKey, setActiveKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest');
  const [loading, setLoading] = useState(false);

  // 문의 수정 모달
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // 답변 수정 모달
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchInquiries();
  }, [paging.pageNumber, sortOrder]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/product/${id}/inquiry`, {
        params: {
          ...(user?.id ? { memberId: user.id } : {}),
          page: paging.pageNumber,
          size: paging.pageSize,
          sort: sortOrder === 'latest' ? 'desc' : 'asc',
        },
      });
      const data = response.data;

      setInquiries(data.content || []);
      setPaging({
        totalElements: data.totalElements,
        pageSize: data.size,
        totalPages: data.totalPages,
        pageNumber: data.number,
        beginPage: 0,
        endPage: Math.min(data.totalPages, 10) - 1,
      });
    } catch (err) {
      console.error('❌ 문의 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 관리자 답글 작성
  const handleAdminComment = async (inquiryId, comment) => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      await axios.post(`${API_BASE_URL}/product/${id}/inquiry/${inquiryId}/comment`, {
        adminId: user.id,
        comment: comment,
      });
      alert('답글이 등록되었습니다.');
      fetchInquiries();
    } catch (err) {
      alert('답글 등록 중 오류가 발생했습니다.');
    }
  };

  // 문의 삭제
  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm('문의를 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/product/inquiry/${inquiryId}`, {
        params: { requesterId: user.id }
      });
      alert('문의가 삭제되었습니다.');
      fetchInquiries();
    } catch (err) {
      console.error('❌ 문의 삭제 실패:', err);
      alert(err.response?.data || '문의 삭제 중 오류가 발생했습니다.');
    }
  };

  // 문의 수정 모달 열기
  const openEditInquiryModal = (inquiry) => {
    setEditingInquiry(inquiry);
    setEditTitle(inquiry.title);
    setEditContent(inquiry.content);
    setShowEditModal(true);
  };

  // 문의 수정 제출
  const handleUpdateInquiry = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/product/inquiry/${editingInquiry.id}?requesterId=${user.id}`,
        {
          title: editTitle,
          content: editContent,
        }
      );
      alert('문의가 수정되었습니다.');
      setShowEditModal(false);
      fetchInquiries();
    } catch (err) {
      console.error('❌ 문의 수정 실패:', err);
      alert(err.response?.data || '문의 수정 중 오류가 발생했습니다.');
    }
  };

  // 답변 수정 모달 열기
  const openEditCommentModal = (inquiry) => {
    setEditingComment({
      id: inquiry.id,
      productId: id  // 상품 ID 추가
    });
    setEditCommentText(inquiry.adminComment.comment);
    setShowEditCommentModal(true);
  };

  // 답변 수정 제출
  const handleUpdateComment = async () => {
    if (!editCommentText.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/product/${id}/inquiry/${editingComment.id}/comment?requesterId=${user.id}`,
        {
          comment: editCommentText,
        }
      );
      alert('답변이 수정되었습니다.');
      setShowEditCommentModal(false);
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
      await axios.delete(`${API_BASE_URL}/product/${id}/inquiry/${inquiry.id}/comment`, {
        params: { requesterId: user.id }
      });
      alert('답변이 삭제되었습니다.');
      fetchInquiries();
    } catch (err) {
      console.error('❌ 답변 삭제 실패:', err);
      alert(err.response?.data || '답변 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span>전체 {paging.totalElements}</span>

        <div className="d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary">정렬</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSortOrder('latest')}>최신순</Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOrder('oldest')}>오래된순</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Button variant="secondary" size="sm" onClick={() => navigate(`/product/${id}/inquiry/write`)}>
            문의 작성
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted">로딩 중...</p>
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
                  {inquiry.isSecret && <span className="me-1">🔒</span>}
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '60%',
                    }}
                  >
                    {inquiry.title}
                  </span>
                  <span
                    className={`ms-3 ${inquiry.adminComment ? 'text-success' : 'text-danger'}`}
                  >
                    {inquiry.adminComment ? '답변 완료' : '처리중'}
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  <p style={{ fontWeight: 'bold' }}>{inquiry.title}</p>
                  <div className="d-flex justify-content-between text-muted">
                    {inquiry.memberId === user?.id ? (
                      <span>{inquiry.member} (나)</span>
                    ) : (
                      <span>{maskName(inquiry.member)}</span>
                    )}
                    <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="my-3">
                    <p
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {inquiry.content}
                    </p>
                  </div>

                  {/* 사용자: 본인 문의만 수정/삭제, 관리자: 삭제만 */}
                  {(inquiry.memberId === user?.id || user?.role === 'ADMIN') && (
                    <div className="d-flex justify-content-end gap-2 mt-2">
                      {inquiry.memberId === user?.id && user?.role !== 'ADMIN' && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => openEditInquiryModal(inquiry)}
                        >
                          <Pencil size={14} className="me-1" /> 수정
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteInquiry(inquiry.id)}
                      >
                        <Trash size={14} className="me-1" /> 삭제
                      </Button>
                    </div>
                  )}

                  {inquiry.adminComment && (
                    <Card bg="light" className="p-3 mt-4">
                      <div className="d-flex justify-content-between text-muted">
                        <span>고객센터 (담당자: {inquiry.adminComment.admin})</span>
                        <span>{new Date(inquiry.adminComment.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="my-3">
                        <p
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word',
                          }}
                        >
                          {inquiry.adminComment.comment}
                        </p>
                      </div>

                      {/* 관리자만 답변 수정/삭제 가능 */}
                      {user?.role === 'ADMIN' && (
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => openEditCommentModal(inquiry)}
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
                      )}
                    </Card>
                  )}

                  {user && user?.role === 'ADMIN' && !inquiry.adminComment && (
                    <Card className="p-3 mt-4">
                      <Form.Group>
                        <Form.Label>관리자 답글 작성</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
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

      {!loading && paging.totalElements === 0 ? (
        <p className="text-center text-muted">문의 내역이 없습니다.</p>
      ) : (
        <Pagination className="justify-content-center mt-4">
          <Pagination.First
            onClick={() => setPaging((prev) => ({ ...prev, pageNumber: 0 }))}
            disabled={paging.pageNumber === 0}
          />
          <Pagination.Prev
            onClick={() =>
              setPaging((prev) => ({ ...prev, pageNumber: Math.max(0, prev.pageNumber - 1) }))
            }
            disabled={paging.pageNumber === 0}
          />
          {[...Array(paging.totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx}
              active={paging.pageNumber === idx}
              onClick={() => setPaging((prev) => ({ ...prev, pageNumber: idx }))}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() =>
              setPaging((prev) => ({
                ...prev,
                pageNumber: Math.min(prev.totalPages - 1, prev.pageNumber + 1),
              }))
            }
            disabled={paging.pageNumber >= paging.totalPages - 1}
          />
          <Pagination.Last
            onClick={() => setPaging((prev) => ({ ...prev, pageNumber: prev.totalPages - 1 }))}
            disabled={paging.pageNumber === paging.totalPages - 1}
          />
        </Pagination>
      )}

      {/* 문의 수정 모달 */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>문의 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>제목</Form.Label>
            <Form.Control type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>내용</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleUpdateInquiry}>
            수정 완료
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 답변 수정 모달 */}
      <Modal show={showEditCommentModal} onHide={() => setShowEditCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>답변 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>답변 내용</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditCommentModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleUpdateComment}>
            수정 완료
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}