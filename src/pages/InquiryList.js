import { useState, useEffect } from 'react';
import { Container, Row, Accordion, Card, Pagination, Dropdown, Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/url';
import { maskName } from '../config/form';
import "./commonness/commonness.css"

export default function InquiryList({ user }) {
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

  const navigate = useNavigate();

  useEffect(() => {
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

    fetchInquiries();
  }, [paging.pageNumber, sortOrder]);

  // 관리자 답글 작성
  const handleAdminComment = async (inquiryId, comment) => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      await axios.post(`${API_BASE_URL}/product/${id}/inquiry/${inquiryId}/comment`, {
        adminId: user.id,
        comment: comment,
      });
      alert('답글이 등록되었습니다.');
      window.location.reload();
      
    } catch (err) {
      alert('답글 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "800px" }}>
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

          <Button className="btn-custom" size="sm" onClick={() => navigate(`/product/${id}/inquiry/write`)}>
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
              if (!selectedInquiry) { setActiveKey(null); return; }
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
                    className={`ms-3 ${
                      inquiry.adminComment ? 'text-success' : 'text-danger'
                    }`}
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

                  {inquiry.adminComment && (
                    <Card bg="light" className="p-3 mt-4">
                      <div className="d-flex justify-content-between text-muted">
                        <span>고객센터 (담당자: {maskName(inquiry.adminComment.admin)})</span>
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
                          onClick={() =>
                            handleAdminComment(inquiry.id, adminComments[inquiry.id])
                          }
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
            onClick={() =>
              setPaging((prev) => ({ ...prev, pageNumber: prev.totalPages - 1 }))}
            disabled={paging.pageNumber === paging.totalPages - 1}
          />
        </Pagination>
      )}
    </Container>
  );
}