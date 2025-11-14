import { useState, useEffect } from "react";
import { Container, Row, Accordion, Card, Button } from "react-bootstrap";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/url";
import { maskName } from "../../formatter/formats";
import RenderPagination from "../RenderPagination";
import { Bag } from "react-bootstrap-icons";

export default function MyInquiryList() {
  const { user } = useOutletContext();

  const [inquiries, setInquiries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert("로그인 후 이용해주세요.");
      navigate(`/member/login`);
    }
  }, [user]);

  useEffect(() => {
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

    fetchMyInquiries();
  }, [currentPage]);

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
                      className={`ms-3 ${
                        inquiry.adminComment ? "text-success" : "text-danger"
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

                    {inquiry.adminComment && (
                      <Card bg="light" className="p-3 mt-4">
                        <div className="d-flex justify-content-between text-muted">
                          <span>
                            고객센터 (담당자: {maskName(inquiry.adminComment.admin)})
                          </span>
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
    </Container>
  );
}