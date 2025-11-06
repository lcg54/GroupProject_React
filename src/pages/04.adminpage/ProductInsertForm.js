import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Container, Form, Button, Card, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { FILTER_OPTIONS } from "../02.product/ProductListFilter";
import { prettyLabel } from "../../util/replace"

// 상품 등록 페이지
export default function ProductInsertForm({ user }) {
  const navigate = useNavigate();
  
  // 권한 경고를 한 번만 띄우기 위한
  const warned = useRef(false);
  
  useEffect(() => {
  const isBlocked = !(user && user.role === "ADMIN");
  if (user === undefined) return; // 로딩 중이면 아무것도 하지 않음
  if (isBlocked && !warned.current) {
  if (user === null) {
    // 비로그인 상태인 경우
  const timeoutId = setTimeout(() => {
    warned.current = true;
    alert("접근 권한이 없습니다.");
    navigate("/", { replace: true });
  }, 100);
    return () => clearTimeout(timeoutId);
  }
    // 로그인은 했지만 ADMIN이 아닌 경우
    warned.current = true;
    alert("접근 권한이 없습니다.");
    navigate("/", { replace: true });
  }
  }, [user,navigate]);

  // 상품 기본 정보 상태
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    totalStock: "",
  });

  // 이미지 업로드, 미리보기, 등록 로그, 모달 표시, 로딩 상태 관리용 state
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(false);

  // 공통 onChange: 특정 키만 교체
  const onChange = (key, value) => setFormData({ ...formData, [key]: value });

  
  // 이미지 추가
  const handleImages = (event) => {
    const files = Array.from(event.target.files || []);
    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  // 상품 등록
  const handleSubmit = async (event) => {
    event.preventDefault();
    const {name, category, brand, price, totalStock } = formData;
    if (!name || !category || !brand || !price || !totalStock || images.length === 0) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // 입력한 상품 정보(formData)와 선택한 이미지 파일들을 서버에 보낼 수 있게 하나로 묶는 작업
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value));
    images.forEach((file) => formDataToSend.append("images", file));

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/product/register`, formDataToSend, { withCredentials: true });
      alert("상품 등록 완료!");
      // 폼 초기화
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

  // user 정보가 없거나 등록 요청 중이면 화면 렌더링 안 함
  if(loading || !user) return null ;

  return (
    
    <Container style={{ maxWidth: 700 }} className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="text-center fw-bold bg-light">상품 등록</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>

            {/* 상품명 */}
            <Form.Group className="mb-3">
              <Form.Label>상품명</Form.Label>
              <Form.Control type="text" placeholder="예) LG 전자레인지 199 모델" value={formData.name} onChange={(e) => onChange("name", e.target.value)} />
            </Form.Group>

            {/* 카테고리 / 브랜드 */}
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

            {/* 상세 설명 */}
            <Form.Group className="mt-3">
              <Form.Label>상세설명</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="예) LG의 최신 전자레인지 모델입니다. 효율성과 디자인을 모두 잡았습니다." value={formData.description} onChange={(e) => onChange("description", e.target.value)} />
            </Form.Group>

            {/* 가격 / 수량 */}
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

            {/* 상품 이미지 업로드 + 미리보기 */}
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

            {/* 버튼 */}
            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button type="submit" variant="outline-primary" disabled={loading}>{loading ? "등록 중..." : "등록"}</Button>
              <Button variant="secondary" onClick={() => navigate("/product/list")}>목록</Button>
              <Button variant="outline-info" onClick={openLogs}>등록내역</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* 등록 내역 모달 */}
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