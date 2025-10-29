import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Container, Form, Button, Alert, Card, Row, Col, InputGroup, Badge, Modal, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { FILTER_OPTIONS } from "../product/Filter";
import { prettyLabel, onlyDigits } from "../../config/replace"

export default function ProductInsertForm() {
  const navigate = useNavigate();

  // -- 최소 상태만 유지
  const [formData, setFormData] = useState({
    name: "", category: "", brand: "", description: "", price: "", totalStock: "", available: true,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);

  const fileRef = useRef(null);

  const onChange = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
  };
  const removeImageAt = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  // -- 미리보기 관리
  useEffect(() => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    const next = images.map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setPreviews(next);
    return () => next.forEach((p) => URL.revokeObjectURL(p.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const resetForm = () => {
    setFormData({ name: "", category: "", brand: "", description: "", price: "", totalStock: "", available: true });
    setImages([]); setPreviews([]); setErrorMsg(""); setSubmitted(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  // -- 최소 검증(제출 시에만 붉은선)
  const errors = {
    name: submitted && !formData.name.trim() ? "상품명을 입력하세요." : "",
    category: submitted && !formData.category ? "카테고리를 선택하세요." : "",
    brand: submitted && !formData.brand ? "브랜드를 선택하세요." : "",
    price: submitted && (!(+onlyDigits(formData.price)) || +onlyDigits(formData.price) <= 0) ? "가격은 0보다 커야 합니다." : "",
    totalStock: submitted && (!(+onlyDigits(formData.totalStock)) || +onlyDigits(formData.totalStock) <= 0) ? "총 보유 수량은 1개 이상이어야 합니다." : "",
    images: submitted && images.length === 0 ? "상품 이미지는 최소 1개 이상 필요합니다." : "",
  };

  const hasError = Object.values(errors).some(Boolean);

  const buildFormData = () => {
    const fd = new FormData();
    fd.set("name", formData.name.trim());
    fd.set("category", formData.category);
    fd.set("brand", formData.brand);
    fd.set("description", formData.description ?? "");
    fd.set("price", String(+onlyDigits(formData.price) || 0));
    fd.set("available", String(!!formData.available));
    fd.set("totalStock", String(+onlyDigits(formData.totalStock) || 0));
    fd.set("adminName", "관리자");
    images.forEach((f) => fd.append("images", f, f.name));
    return fd;
  };

  // -- 등록
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasError) return setErrorMsg("입력값을 확인해 주세요.");
    setErrorMsg(""); setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/product/register`, buildFormData(), { withCredentials: true });
      resetForm();
      alert("상품 등록이 완료되었습니다.");
      // navigate("/product/list"); // 필요 시 즉시 이동
    } catch (err) {
      setErrorMsg(`상품 등록 실패: ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // -- 등록 내역
  const openLogs = async () => {
    setShowLogs(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/product/logs`, { withCredentials: true });
      setLogs(Array.isArray(data) ? data : (data?.items || data?.content || []));
    } catch (e) {
      setLogs([]);
    }
  };

  return (
    <Container style={{ maxWidth: 760 }} className="py-4">
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: 20, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #fffaf0, #fff5e6)", padding: "22px 24px" }}>
          <div className="text-center text-dark py-2">
            <h3 className="mb-0">상품 등록</h3>
          </div>
        </div>

        <Card.Body className="p-4">
          {errorMsg && (
            <Alert variant="danger" className="mb-4" onClose={() => setErrorMsg("")} dismissible>
              {errorMsg}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="fw-semibold">📋 상품명</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="예) LG 건조기 219 모델"
                  value={formData.name}
                  isInvalid={!!errors.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-semibold">📂 카테고리</Form.Label>
                <Form.Select
                  value={formData.category}
                  isInvalid={!!errors.category}
                  onChange={(e) => onChange("category", e.target.value)}
                >
                  <option value="">카테고리 선택</option>
                  {FILTER_OPTIONS.category.map((c) => (
                    <option key={c.value} value={c.value}>{prettyLabel(c.label)}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-semibold">🏷️ 브랜드</Form.Label>
                <Form.Select
                  value={formData.brand}
                  isInvalid={!!errors.brand}
                  onChange={(e) => onChange("brand", e.target.value)}
                >
                  <option value="">브랜드 선택</option>
                  {FILTER_OPTIONS.brand.map((b) => (
                    <option key={b.value} value={b.value}>{prettyLabel(b.label)}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.brand}</Form.Control.Feedback>
              </Col>

              <Col md={12}>
                <Form.Label className="fw-semibold">📄 상세설명</Form.Label>
                <Form.Control
                  as="textarea" rows={3} placeholder="상품에 대한 상세 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => onChange("description", e.target.value)}
                />
                <div className="text-end text-muted small mt-1">{formData.description.length}/1000</div>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-semibold">💰 가격</Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type="text" inputMode="numeric" placeholder="예) 329000"
                    value={formData.price}
                    isInvalid={!!errors.price}
                    onChange={(e) => onChange("price", onlyDigits(e.target.value))}
                  />
                  <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                </InputGroup>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-semibold">📦 총 보유 수량</Form.Label>
                <Form.Control
                  type="text" inputMode="numeric" placeholder="예) 120"
                  value={formData.totalStock}
                  isInvalid={!!errors.totalStock}
                  onChange={(e) => onChange("totalStock", onlyDigits(e.target.value))}
                />
                <Form.Control.Feedback type="invalid">{errors.totalStock}</Form.Control.Feedback>
              </Col>

              <Col md={12}>
                <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                  📷 상품 이미지 {images.length > 0 && <Badge bg="secondary" className="ms-1">{images.length}</Badge>}
                </Form.Label>
                <Form.Control
                  type="file" multiple accept="image/*"
                  ref={fileRef}
                  isInvalid={!!errors.images}
                  onChange={handleImagesChange}
                />
                {errors.images && <div className="invalid-feedback d-block">{errors.images}</div>}

                {previews.length > 0 && (
                  <Row className="g-2 mt-2">
                    {previews.map((p, idx) => (
                      <Col key={idx} xs={6} sm={4} md={3} lg={3}>
                        <Card className="h-100 border-0 shadow-sm position-relative" style={{ borderRadius: 12 }}>
                          <Card.Img variant="top" src={p.url} style={{ objectFit: "cover", height: 140 }} />
                          <Button
                            variant="light" size="sm"
                            className="position-absolute top-0 end-0 m-1 rounded-circle shadow-sm"
                            onClick={() => removeImageAt(idx)}
                            aria-label={`remove ${p.name}`}
                          >
                            ✕
                          </Button>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Col>

              <div style={{ height: 1, background: "#eef1f4", margin: "18px 0" }} />

              <Col md={12}>
                <Stack direction="horizontal" gap={2} className="justify-content-center flex-wrap mt-2">
                  <Button type="submit" variant="outline-primary" disabled={loading} className="px-4">
                    {loading ? "⏳ 등록 중..." : "✅ 상품 등록"}
                  </Button>
                  <Button type="button" variant="outline-danger" onClick={resetForm} disabled={loading} className="px-4">
                    🔄 초기화
                  </Button>
                  <Button variant="secondary" onClick={() => navigate("/product/list")} disabled={loading} className="px-4">
                    📋 목록으로
                  </Button>
                  <Button variant="outline-secondary" onClick={openLogs} disabled={loading} className="px-4">
                    🕓 등록 내역
                  </Button>
                </Stack>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* 등록 내역  */}
      <Modal show={showLogs} onHide={() => setShowLogs(false)} centered>
        <Modal.Header closeButton><Modal.Title>상품 등록 내역</Modal.Title></Modal.Header>
        <Modal.Body className="py-3">
          {logs.length > 0 ? (
            <ul className="list-unstyled mb-0">
              {logs.map((log, i) => (
                <li key={i} className="mb-2">
                  <div className="fw-semibold">{log.productName}</div>
                  <small className="text-muted">
                    {new Date(log.createdAt).toLocaleString("ko-KR")} · {log.adminName || "관리자"}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted text-center">등록 내역이 없습니다.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogs(false)}>닫기</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}