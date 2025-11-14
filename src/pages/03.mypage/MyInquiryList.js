import { useState, useEffect } from "react";
import { Container, Row, Accordion, Card, Button, Modal, Form } from "react-bootstrap";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/url";
import { maskName } from "../../formatter/formats";
import RenderPagination from "../RenderPagination";
import { Bag, Pencil, Trash } from "react-bootstrap-icons";

export default function MyInquiryList() {
  const { user } = useOutletContext();

  const [inquiries, setInquiries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(null);

  // 문의 수정 모달
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // 답변 수정 모달
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert("로그인 후 이용해주세요.");
      navigate(`/member/login`);
    }
  }, [user]);

  useEffect(() => {
    fetchMyInquiries();
  }, [currentPage]);

  const fetchMyInquiries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/member/${user.id}/inquiry`, {
        params: {
          page: currentPage - 1,
          size: 5,
        },
      });

      const data = response.data;
      setInquiries(data.content || []);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("❌ 회원 문의 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 문의 삭제
  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm("문의를 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/product/inquiry/${inquiryId}`, {
        params: { requesterId: user.id }
      });
      alert("문의가 삭제되었습니다.");
      fetchMyInquiries();
    } catch (err) {
      console.error("❌ 문의 삭제 실패:", err);
      alert(err.response?.data || "문의 삭제 중 오류가 발생했습니다.");
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
      alert("제목과 내용을 입력해주세요.");
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
      alert("문의가 수정되었습니다.");
      setShowEditModal(false);
      fetchMyInquiries();
    } catch (err) {
      console.error("❌ 문의 수정 실패:", err);
      alert(err.response?.data || "문의 수정 중 오류가 발생했습니다.");
    }
  };

  // 답변 수정 모달 열기
  const openEditCommentModal = (inquiry) => {
    setEditingComment({
      id: inquiry.id,
      productId: inquiry.productId  // productId 명시적으로 전달
    });
    setEditCommentText(inquiry.adminComment.comment);
    setShowEditCommentModal(true);
  };

  // 답변 수정 제출
  const handleUpdateComment = async () => {
    if (!editCommentText.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/product/${editingComment.productId}/inquiry/${editingComment.id}/comment?requesterId=${user.id}`,
        {
          comment: editCommentText,
        }
      );
      alert("답변이 수정되었습니다.");
      setShowEditCommentModal(false);
      fetchMyInquiries();
    } catch (err) {
      console.error("❌ 답변 수정 실패:", err);
      alert(err.response?.data || "답변 수정 중 오류가 발생했습니다.");
    }
  };

  // 답변 삭제
  const handleDeleteComment = async (inquiry) => {
    if (!window.confirm("답변을 삭제하시겠습니까?")) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/product/${inquiry.productId}/inquiry/${inquiry.id}/comment`,
        {
          params: { requesterId: user.id }
        }
      );
      alert("답변이 삭제되었습니다.");
      fetchMyInquiries();
    } catch (err) {
      console.error("❌ 답변 삭제 실패:", err);
      alert(err.response?.data || "답변 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "800px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>내 문의글 목록</h5>
        <span>전체 {inquiries.length}</span>
      </div>

      {loading ? (
        <p className="text-center text-muted">로딩 중...</p>
      ) : inquiries.length === 0 ? (
        <p className="text-center text-muted">작성한 문의가 없습니다.</p>
      ) : (
        <>
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
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "70%",
                      }}
                    >
                      {inquiry.title}
                    </span>
                    <span
                      className={`ms-3 ${inquiry.adminComment ? "text-success" : "text-danger"
                        }`}
                    >
                      {inquiry.adminComment ? "답변 완료" : "처리중"}
                    </span>
                  </Accordion.Header>

                  <Accordion.Body>
                    <div className="d-flex justify-content-between text-muted mb-2">
                      <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/product/${inquiry.productId}`)}
                      >
                        <Bag size={14} className="me-1" /> 상품페이지로 이동
                      </Button>
                    </div>

                    <p style={{ fontWeight: "bold" }}>{inquiry.title}</p>
                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                      }}
                    >
                      {inquiry.content}
                    </p>

                    {/* 사용자: 답변 완료 전에만 수정/삭제, 관리자: 삭제만 */}
                    {!inquiry.adminComment && (
                      <div className="d-flex justify-content-end gap-2 mt-2">
                        {user?.role !== "ADMIN" && (
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

                    {inquiry.adminComment && user?.role === "ADMIN" && (
                      <div className="d-flex justify-content-end gap-2 mt-2">
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
                          <span>
                            {new Date(inquiry.adminComment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="my-3">
                          <p
                            style={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-all",
                              overflowWrap: "break-word",
                            }}
                          >
                            {inquiry.adminComment.comment}
                          </p>
                        </div>

                        {/* 관리자만 답변 수정/삭제 가능 */}
                        {user?.role === "ADMIN" && (
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
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Row>

          <div className="mt-4">
            <RenderPagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </>
      )}

      {/* 문의 수정 모달 */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>문의 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>제목</Form.Label>
            <Form.Control
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
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