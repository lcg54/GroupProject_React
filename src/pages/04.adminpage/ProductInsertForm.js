import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Form, Button, Card, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { CATEGORIES } from "../../constant/categories";
import { BRANDS } from "../../constant/brands";

// 상품 등록 페이지
export default function ProductInsertForm({ user }) {
  const [form, setForm] = useState({ name: "", category: "", brand: "", description: "", price: "", totalStock: "" });

  const [mainImages, setMainImages] = useState([]);
  const [mainIndex, setMainIndex] = useState(0); // 대표 이미지
  const [mainPreviews, setMainPreviews] = useState([]);
  const [detailImages, setDetailImages] = useState([]);
  const [detailPreviews, setDetailPreviews] = useState([]);

  const [previews, setPreviews] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const userRole = user?.role || storedUser?.role;
    if (userRole !== "ADMIN") {
      alert("관리자만 접근 가능한 페이지입니다.");
      navigate(`/member/login`);
    }
  }, [user]);

  // 공통 onChange: 특정 키만 교체
  const onChange = (key, value) => setForm({ ...form, [key]: value });

  // 대표/서브 이미지 선택
  const handleMainImages = (event) => {
    const newFiles = Array.from(event.target.files || []);
    const combined = [...mainImages, ...newFiles];

    if (combined.length > 5) {
      alert("대표 및 서브 이미지는 최대 5장까지 가능합니다.");
      return;
    }

    setMainImages(combined);
    setMainIndex(0);
    setMainPreviews(combined.map((file) => URL.createObjectURL(file)));
  };

  // 대표/서브 이미지 삭제
  const handleRemoveMainImage = (idx) => {
    setMainImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (idx === mainIndex) {
        setMainIndex(0);
      } else if (idx < mainIndex) {
        setMainIndex(mainIndex - 1);
      }
      return updated;
    });

    setMainPreviews((prev) => prev.filter((_, i) => i !== idx));

  };



  // 상세 이미지 선택
  const handleDetailImages = (event) => {
    const newFiles = Array.from(event.target.files || []);
    const combined = [...detailImages, ...newFiles];

    if (combined.length > 100) {
      alert("상세 이미지는 최대 100장까지 가능합니다.");
      return;
    }

    setDetailImages(combined);
    setDetailPreviews(combined.map((file) => URL.createObjectURL(file)));
  };

  // 상세 이미지 삭제
  const handleRemoveDetailImage = (idx) => {
    setDetailImages((prev) => prev.filter((_, i) => i !== idx));
    setDetailPreviews((prev) => prev.filter((_, i) => i !== idx));
  };



  // 상품 등록
  const handleSubmit = async (event) => {
    event.preventDefault();
    const { name, category, brand, price, totalStock } = form;

    if (!name || !category || !brand || !price || !totalStock || mainImages.length === 0) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (!window.confirm(`${brand} ${name} (${totalStock}) 을(를) 등록하시겠습니까?`)) return;

    const formDataToSend = new FormData();
    Object.entries(form).forEach(([key, value]) => formDataToSend.append(key, value));

    // 대표/서브 이미지 전송
    // 대표 이미지
    formDataToSend.append("mainImage", mainImages[0]);

    // 서브 이미지
    mainImages.slice(1).forEach((file) => {
      formDataToSend.append("subImages", file);
    });

    // 상세 이미지 전송
    detailImages.forEach((file) => {
      formDataToSend.append("detailImages", file);
    });


    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/product/register/${user.id}`, formDataToSend, { withCredentials: true });
      alert(`${brand} ${name} (${totalStock}) 을(를) 등록했습니다.`);
      setForm({ name: "", category: "", brand: "", description: "", price: "", totalStock: "" });
      setMainImages([]);
      setMainPreviews([]);
      setDetailImages([]);
      setDetailPreviews([]);
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
  if (loading || !user) return null;

  return (
    <Container style={{ maxWidth: 700 }} className="py-4">
      <Card className="shadow-lg border-0">
        <Card.Header className="text-center fw-bold bg-light">상품 등록</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>

            {/* 상품명 */}
            <Form.Group className="mb-3">
              <Form.Label>상품명</Form.Label>
              <Form.Control type="text" placeholder="예) LG 전자레인지 199 모델" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
            </Form.Group>

            {/* 카테고리 / 브랜드 */}
            <Row>
              <Col md={6}>
                <Form.Label>카테고리</Form.Label>
                <Form.Select value={form.category} onChange={(e) => onChange("category", e.target.value)}>
                  <option value="">선택</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>브랜드</Form.Label>
                <Form.Select value={form.brand} onChange={(e) => onChange("brand", e.target.value)}>
                  <option value="">선택</option>
                  {BRANDS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {/* 상세 설명 */}
            <Form.Group className="mt-3">
              <Form.Label>상세설명</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="예) LG의 최신 전자레인지 모델입니다. 효율성과 디자인을 모두 잡았습니다." value={form.description} onChange={(e) => onChange("description", e.target.value)} />
            </Form.Group>

            {/* 가격 / 수량 */}
            <Row className="mt-3">
              <Col md={6}>
                <Form.Label>가격</Form.Label>
                <Form.Control type="text" placeholder="예) 329000" value={form.price} onChange={(e) => onChange("price", e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>총 수량</Form.Label>
                <Form.Control type="text" placeholder="예) 120" value={form.totalStock} onChange={(e) => onChange("totalStock", e.target.value)} />
              </Col>
            </Row>

            {/* 상품 이미지 업로드 + 미리보기 */}
            <Form.Group className="mt-3">
              <Form.Label>대표 및 서브 이미지 (최대 5장)</Form.Label>
              <Form.Control type="file" multiple accept="image/*" onChange={handleMainImages} />
              {mainPreviews.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                  {mainPreviews.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setMainIndex(idx)}
                      style={{
                        position: "relative",
                        width: "100px",
                        height: "100px",
                        cursor: "pointer"
                      }}
                    >
                      <img
                        src={img}
                        alt={`대표+서브 이미지 ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: idx === mainIndex ? "3px solid #007bff" : "1px solid #ccc",
                        }}
                      />

                      {/* 대표 배지 (파랑 / 회색) */}
                      <div
                        style={{
                          position: "absolute",
                          top: "4px",
                          left: "4px",
                          backgroundColor: idx === mainIndex ? "#007bff" : "#888",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          zIndex: 10,
                        }}
                      >
                        대표
                      </div>

                      {/* 삭제 버튼 */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation(); // 이미지 클릭과 삭제 버튼 클릭 충돌 방지
                          handleRemoveMainImage(idx);
                        }}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "white",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "14px",
                          zIndex: 9999,
                        }}
                      >
                        ✕
                      </div>
                    </div>

                  ))}

                </div>
              )}

            </Form.Group>

            {/* 상세 이미지 */}
            <Form.Group className="mt-3">
              <Form.Label>상세 이미지</Form.Label>
              <Form.Control type="file" multiple accept="image/*" onChange={handleDetailImages} />
              {detailPreviews.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                  {detailPreviews.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", width: "100px", height: "100px" }}>
                      <img
                        src={img}
                        alt={`상세 이미지 ${idx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                      />

                      {/* 삭제 버튼 */}
                      <div
                        onClick={() => handleRemoveDetailImage(idx)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "white",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "14px",
                          zIndex: 9999,
                        }}
                      >
                        ✕
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            {/* 버튼 */}
            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button variant="secondary" onClick={() => navigate("/product/list")}>목록으로</Button>
              <Button variant="outline-dark" onClick={openLogs}>등록 내역</Button>
              <Button type="submit" variant="outline-primary" disabled={loading}>{loading ? "등록 중..." : "등록"}</Button>
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
                <li key={i} className="mb-2">
                  {log.productName} <small className="text-muted">({new Date(log.createdAt).toLocaleString("ko-KR")})</small>
                  <span> - {log.adminName}</span>
                </li>
              ))}
            </ul>
          ) : <div className="text-muted text-center">등록 내역이 없습니다.</div>}
        </Modal.Body>
      </Modal>
    </Container>
  );
}