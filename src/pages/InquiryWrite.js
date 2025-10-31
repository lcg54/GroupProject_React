import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/url";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Container, Row, Col, Button, Alert, Card, Spinner } from "react-bootstrap";
import axios from "axios";

export default function InquiryWrite({ user }) {
  const { id } = useParams(); // 상품 ID

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const timeout = setTimeout(() => {
        if (!user) {
          alert("로그인이 필요합니다.");
          navigate("/member/login");
        }
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setCheckingUser(false);
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!title.trim()) return "문의 제목을 입력하세요.";
    if (!type) return "문의 사유를 선택하세요.";
    if (!content.trim()) return "문의 내용을 입력하세요.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/product/${id}/inquiry/write`, {
        memberId: user.id,
        title,
        content,
        type,
        isSecret,
      });
      alert("상품 문의가 등록되었습니다.");
      navigate(`/product/${id}`);
    } catch (err) {
      console.error(err);
      setError("상품 문의 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingUser) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "500px" }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ backgroundColor: "#f1f1f1ff", maxWidth: "1000px", minHeight: "1000px" }}>
      <Card style={{ width: "1000px", padding: "30px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", minHeight: "1000px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Card.Body className="d-flex flex-column justify-content-between">
          <div>
            <h2 className="text-center mb-4">문의사항 작성</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Card className="mb-3 shadow-sm">
                <Card.Body>
                  <Form.Group as={Row}>
                    <Form.Label column sm={3}>문의 제목</Form.Label>
                    <Col sm={9}>
                      <Form.Control placeholder="제목 작성" value={title} maxLength={35} onChange={(e) => setTitle(e.target.value)} required />
                    </Col>
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-3 shadow-sm">
                <Card.Body>
                  <Form.Group as={Row}>
                    <Form.Label column sm={3}>문의 사유</Form.Label>
                    <Col sm={9}>
                      <Form.Select value={type} onChange={(e) => setType(e.target.value)} required>
                        <option value="">선택</option>
                        <option value="DELIVERY">배송 관련</option>
                        <option value="PRODUCT">상품 관련</option>
                        <option value="ETC">기타 문의</option>
                      </Form.Select>
                    </Col>
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-3 shadow-sm" style={{ flexGrow: 1 }}>
                <Card.Body>
                  <Form.Group as={Row}>
                    <Form.Label column sm={3}>문의 내용</Form.Label>
                    <Col sm={9}>
                      <Form.Control as="textarea" rows={10} placeholder="내용 작성" value={content} maxLength={4000} onChange={(e) => setContent(e.target.value)} required style={{ height: "100%", minHeight: "500px" }} />
                    </Col>
                  </Form.Group>
                </Card.Body>
              </Card>

              <div className="mt-3 d-flex align-items-center" style={{ justifyContent: "flex-end", gap: "10px" }}>
                <Form.Check type="checkbox" label="비공개 문의" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} />
                <Button variant="primary" type="submit" disabled={loading}>{loading ? "⏳ 등록 중..." : "제출"}</Button>
              </div>
            </Form>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}