import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Container, Form, Button, Card, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { FILTER_OPTIONS } from "../02.product/ProductListFilter";
import { prettyLabel } from "../../util/replace"

export default function ProductInsertForm({ user }) {
  const navigate = useNavigate();
  const warned = useRef(false);
  
  useEffect(() => {
  const isBlocked = !(user && user.role && String(user.role).toUpperCase() === "ADMIN");
  if (user === undefined) return;
  if (isBlocked && !warned.current) {
  if (user === null) {
  const timeoutId = setTimeout(() => {
    warned.current = true;
    alert("접근 권한이 없습니다.");
    navigate("/", { replace: true });
  }, 100);
    return () => clearTimeout(timeoutId);
  }
    warned.current = true;
    alert("접근 권한이 없습니다.");
    navigate("/", { replace: true });
  }
  }, [user,navigate]);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    totalStock: "",
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (k, v) => setFormData({ ...formData, [k]: v });

  
  // 이미지 추가
  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // 상품 등록
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.brand || !formData.price || !formData.totalStock || images.length === 0) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    images.forEach((f) => fd.append("images", f));

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/product/register`, fd, { withCredentials: true });
      alert("상품 등록 완료!");
      setFormData({ name: "", category: "", brand: "", description: "", price: "", totalStock: "" });
      setImages([]);
      setPreviews([]);
    } catch (err) {
      alert("등록 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 등록 내역 보기
  const openLogs = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/product/logs`, { withCredentials: true });
      setLogs(Array.isArray(data) ? data : []);
      setShowLogs(true);
    } catch {
      setLogs([]);
      setShowLogs(true);
    }
  };

  if(loading || !user) return null ;

  return (
    
    <Container style={{ maxWidth: 700 }} className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="text-center fw-bold bg-light">상품 등록</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>상품명</Form.Label>
              <Form.Control type="text" placeholder="예) LG 전자레인지 199 모델" value={formData.name} onChange={(e) => onChange("name", e.target.value)} />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Label>카테고리</Form.Label>
                <Form.Select value={formData.category} onChange={(e) => onChange("category", e.target.value)}>
                  <option value="">선택</option>
                  {FILTER_OPTIONS.category.filter(c => c.label !== "전체").map(c => (
                    <option key={c.value} value={c.value}>{prettyLabel(c.label)}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>브랜드</Form.Label>
                <Form.Select value={formData.brand} onChange={(e) => onChange("brand", e.target.value)}>
                  <option value="">선택</option>
                  {FILTER_OPTIONS.brand.filter(b => b.label !== "전체").map(b => (
                    <option key={b.value} value={b.value}>{prettyLabel(b.label)}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>상세설명</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="예) LG의 최신 전자레인지 모델입니다. 효율성과 디자인을 모두 잡았습니다." value={formData.description} onChange={(e) => onChange("description", e.target.value)} />
            </Form.Group>

            <Row className="mt-3">
              <Col md={6}>
                <Form.Label>가격</Form.Label>
                <Form.Control type="text" placeholder="예) 329000" value={formData.price} onChange={(e) => onChange("price", e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>총 수량</Form.Label>
                <Form.Control type="text" placeholder="예) 120" value={formData.totalStock} onChange={(e) => onChange("totalStock", e.target.value)} />
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>상품 이미지</Form.Label>
              <Form.Control type="file" multiple accept="image/*" onChange={handleImages} />
              {previews.length > 0 && (
                <Row className="mt-2">
                  {previews.map((p, i) => (
                    <Col key={i} xs={6} md={4} className="mb-2">
                      <img src={p} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }} />
                    </Col>
                  ))}
                </Row>
              )}
            </Form.Group>

            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button type="submit" variant="outline-primary" disabled={loading}>{loading ? "등록 중..." : "등록"}</Button>
              <Button variant="secondary" onClick={() => navigate("/product/list")}>목록</Button>
              <Button variant="outline-info" onClick={openLogs}>등록내역</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showLogs} onHide={() => setShowLogs(false)} centered>
        <Modal.Header closeButton><Modal.Title>등록 내역</Modal.Title></Modal.Header>
        <Modal.Body>
          {logs.length > 0 ? (
            <ul className="list-unstyled mb-0">
              {logs.map((log, i) => (
                <li key={i}>{log.productName} <small className="text-muted">({new Date(log.createdAt).toLocaleString("ko-KR")})</small></li>
              ))}
            </ul>
          ) : <div className="text-muted text-center">등록 내역이 없습니다.</div>}
        </Modal.Body>
      </Modal>
    </Container>
  );
}