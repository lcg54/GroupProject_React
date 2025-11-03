import axios from "axios";
import { useEffect, useRef, useState, useMemo } from "react";
import { Container, Form, Button, Alert, Card, Row, Col, InputGroup, Badge, Stack, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { FILTER_OPTIONS } from "../02.product/ProductListFilter";
import { prettyLabel, onlyDigits } from "../../util/replace"

export default function ProductUpdateForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "", category: "", brand: "", description: "",
    price: "", totalStock: "", available: true,
    reservedStock: "", rentedStock: "", repairStock: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);

  const fileRef = useRef(null);

  const fmt = (digits) => (digits ? Number(digits)?.toLocaleString("ko-KR") : "");

  // 상품 로드
  useEffect(() => {
    (async () => {
      try {
        if (!id || id === "undefined" || id === ":id") {
          setErrorMsg("❌ 유효하지 않은 상품 ID 입니다.");
          setTimeout(() => navigate("/product/list"), 1200);
          return;
        }
        setInitialLoading(true);

        const { data: product } = await axios.get(`${API_BASE_URL}/product/${id}`, { withCredentials: true });

        const toStr = (n) => (n != null ? fmt(String(n)) : "");
        setFormData({
          name: product.name ?? "",
          category: product.category ?? "",
          brand: product.brand ?? "",
          description: product.description ?? "",
          price: toStr(product.price),
          totalStock: toStr(product.totalStock),
          available: product.available ?? true,
          reservedStock: toStr(product.reservedStock),
          rentedStock: toStr(product.rentedStock),
          repairStock: toStr(product.repairStock),
        });

        let urls = [];
        if (Array.isArray(product.images) && product.images.length > 0) {
          urls = product.images
            .map((img) => (typeof img === "string" ? img : img?.url))
            .filter(Boolean)
            .map((u) => (u.startsWith("http") ? u : `${API_BASE_URL}/images/${u}`));
        } else if (product.mainImage) {
          urls = [product.mainImage.startsWith("http") ? product.mainImage : `${API_BASE_URL}/images/${product.mainImage}`];
        }
        setExistingImages(urls);
      } catch (err) {
        setErrorMsg(`❌ 상품 정보를 불러오지 못했습니다: ${err.response?.data?.message || err.message}`);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [id, navigate]);

  // 입력 핸들러
  const onChange = (k, v) => setFormData((p) => ({ ...p, [k]: v }));
  const onBlurFmt = (k) => {
    const raw = onlyDigits(formData[k]);
    if (!raw) return;
    const n = Number(raw);
    if (!Number.isNaN(n)) onChange(k, n === 0 ? "" : n.toLocaleString("ko-KR"));
  };

  // 이미지 업로드/삭제/미리보기
  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImages((prev) => [...prev, ...files]);
  };
  const removeExistingImage = (url) => setExistingImages((prev) => prev.filter((u) => u !== url));
  const removeNewImageAt = (idx) => setNewImages((prev) => prev.filter((_, i) => i !== idx));
  const resetImages = () => {
    setExistingImages([]);
    setNewImages([]);
    if (fileRef.current) fileRef.current.value = "";
  };
  useEffect(() => {
    newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    const previews = newImages.map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setNewPreviews(previews);
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [newImages]); // OK

  // 검증(간단)
  const errors = useMemo(() => {
    const e = {};
    const priceNum = Number(onlyDigits(formData.price));
    const totalNum = Number(onlyDigits(formData.totalStock));
    const reserved = Number(onlyDigits(formData.reservedStock || "0")) || 0;
    const rented   = Number(onlyDigits(formData.rentedStock   || "0")) || 0;
    const repair   = Number(onlyDigits(formData.repairStock   || "0")) || 0;

    if (!formData.name.trim()) e.name = "상품명을 입력하세요.";
    if (!formData.category) e.category = "카테고리를 선택하세요.";
    if (!formData.brand) e.brand = "브랜드를 선택하세요.";
    if (!priceNum || priceNum <= 0) e.price = "가격은 0보다 커야 합니다.";
    if (Number.isNaN(totalNum) || totalNum < 0) e.totalStock = "총 보유 수량을 확인하세요.";
    if ((existingImages.length + newImages.length) === 0) e.images = "상품 이미지는 최소 1개 이상 필요합니다.";
    if (!e.totalStock && totalNum < (reserved + rented + repair)) {
      e.substocks = `예약/대여/수리 합(${reserved + rented + repair}개)이 총 보유 수량(${totalNum}개)을 초과했습니다.`;
    }
    return e;
  }, [formData, existingImages, newImages]);

  // FD 생성
  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("category", formData.category);
    fd.append("brand", formData.brand);
    fd.append("description", formData.description ?? "");
    fd.append("price", String(Number(onlyDigits(formData.price)) || 0));
    fd.append("totalStock", String(Number(onlyDigits(formData.totalStock)) || 0));
    fd.append("available", String(!!formData.available));
    fd.append("reservedStock", String(Number(onlyDigits(formData.reservedStock || "0")) || 0));
    fd.append("rentedStock",   String(Number(onlyDigits(formData.rentedStock   || "0")) || 0));
    fd.append("repairStock",   String(Number(onlyDigits(formData.repairStock   || "0")) || 0));

    const keep = existingImages.map((url) => (url.includes("/images/") ? url.split("/images/")[1] : url));
    fd.append("existingImages", JSON.stringify(keep));
    newImages.forEach((img) => fd.append("images", img));
    return fd;
  };

  // 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      setErrorMsg("입력값을 확인해 주세요.");
      return;
    }
    const ok = window.confirm(`"${formData.name}" 상품을 수정하시겠습니까?`);
    if (!ok) return;

    setSaving(true);
    setErrorMsg("");
    try {
      await axios.put(`${API_BASE_URL}/product/${id}`, buildFormData(), { withCredentials: true });
      alert("상품 수정이 완료되었습니다.");
      navigate("/product/list");
    } catch (err) {
      const data = err.response?.data;
      const msg = (data && typeof data === "object" && data.message) ? data.message
                : (typeof data === "string" ? data : err.message);
      setErrorMsg(`상품 수정 중 오류가 발생했습니다: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!id) return setErrorMsg("삭제할 상품 ID를 찾을 수 없습니다.");
    const ok = window.confirm(`"${formData.name}" 상품을 정말로 삭제하시겠습니까?`);
    if (!ok) return;

    setDeleting(true);
    setErrorMsg("");
    try {
      await axios.delete(`${API_BASE_URL}/product/${id}`, { withCredentials: true });
      alert(`상품 "${formData.name}"이(가) 삭제되었습니다.`);
      navigate("/product/list");
    } catch (err) {
      setErrorMsg(`상품 삭제 중 오류: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // 수정(삭제) 내역
  const openLogs = async () => {
    setShowLogs(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/product/logs/changes`, { withCredentials: true });
      const arr = Array.isArray(data) ? data : (data?.logs || data?.content || []);
      setLogs(arr);
    } catch {
      setLogs([]);
    }
  };

  // 가용 재고
  const availableStock = Math.max(
    (Number(onlyDigits(formData.totalStock)) || 0) -
    ((Number(onlyDigits(formData.reservedStock)) || 0) +
     (Number(onlyDigits(formData.rentedStock))  || 0) +
     (Number(onlyDigits(formData.repairStock))  || 0)),
    0
  );

  if (initialLoading) {
    return (
      <Container style={{ maxWidth: 760 }} className="py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted">⏳ 상품 정보를 불러오는 중...</p>
      </Container>
    );
  }

  const Line = () => <div style={{ height: 1, background: "#eef1f4", margin: "18px 0" }} />;

  return (
    <Container style={{ maxWidth: 760 }} className="py-4">
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: 20, overflow: "hidden" }}>
        <div style={{ background:"linear-gradient(135deg, #fffaf0, #fff5e6)", padding:"22px 24px" }}>
          <div className="text-center text-dark py-2"><h3 className="mb-0">상품 수정</h3></div>
        </div>

        <Card.Body className="p-4">
          {errorMsg && (
            <Alert variant="danger" className="mb-4" dismissible onClose={() => setErrorMsg("")}>
              {errorMsg}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* 이름 */}
              <Col md={12}>
                <Form.Label className="fw-semibold">📋 상품명</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="예) LG 건조기 219 모델"
                  value={formData.name}
                  isInvalid={submitted && !!errors.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Col>

              {/* 카테고리/브랜드 */}
              <Col md={6}>
                <Form.Label className="fw-semibold">📂 카테고리</Form.Label>
                <Form.Select
                  value={formData.category}
                  isInvalid={submitted && !!errors.category}
                  onChange={(e) => onChange("category", e.target.value)}
                >
                  <option value="">카테고리 선택</option>
                  {FILTER_OPTIONS.category.map((c) => <option key={c.value} value={c.value}>{prettyLabel(c.label)}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-semibold">🏷️ 브랜드</Form.Label>
                <Form.Select
                  value={formData.brand}
                  isInvalid={submitted && !!errors.brand}
                  onChange={(e) => onChange("brand", e.target.value)}
                >
                  <option value="">브랜드 선택</option>
                  {FILTER_OPTIONS.brand.map((b) => <option key={b.value} value={b.value}>{prettyLabel(b.label)}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.brand}</Form.Control.Feedback>
              </Col>

              {/* 설명 */}
              <Col md={12}>
                <Form.Label className="fw-semibold">📄 상세설명</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  placeholder="상품에 대한 상세 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => onChange("description", e.target.value)}
                />
                <div className="text-end text-muted small mt-1">{formData.description.length}/1000</div>
              </Col>

              {/* 가격/총 보유 수량 */}
              <Col md={6}>
                <Form.Label className="fw-semibold">💰 가격</Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type="text" inputMode="numeric" placeholder="예) 329,000" autoComplete="off"
                    value={formData.price}
                    isInvalid={submitted && !!errors.price}
                    onBlur={() => onBlurFmt("price")}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => onChange("price", fmt(onlyDigits(e.target.value)))}
                  />
                  <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                </InputGroup>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-semibold">📦 총 보유 수량</Form.Label>
                <Form.Control
                  type="text" inputMode="numeric" placeholder="예) 120"
                  value={formData.totalStock}
                  isInvalid={submitted && !!errors.totalStock}
                  onBlur={() => onBlurFmt("totalStock")}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => onChange("totalStock", fmt(onlyDigits(e.target.value)))}
                />
                <Form.Control.Feedback type="invalid">{errors.totalStock}</Form.Control.Feedback>
              </Col>

              {/* 재고 현황 */}
              <Col md={12} className="mt-2">
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <h6 className="mb-3">📊 현재 재고 현황</h6>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Label>✅ 대여 가능</Form.Label>
                        <Form.Control value={fmt(String(availableStock))} readOnly disabled className="fw-bold bg-white" />
                      </Col>
                      <Col md={6}>
                        <Form.Label>🚚 대여 중</Form.Label>
                        <Form.Control
                          type="text" inputMode="numeric"
                          value={formData.rentedStock}
                          onBlur={() => onBlurFmt("rentedStock")}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => onChange("rentedStock", fmt(onlyDigits(e.target.value)))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label>⏳ 예약 중</Form.Label>
                        <Form.Control
                          type="text" inputMode="numeric"
                          value={formData.reservedStock}
                          onBlur={() => onBlurFmt("reservedStock")}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => onChange("reservedStock", fmt(onlyDigits(e.target.value)))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label>🔧 수리 중</Form.Label>
                        <Form.Control
                          type="text" inputMode="numeric"
                          value={formData.repairStock}
                          onBlur={() => onBlurFmt("repairStock")}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => onChange("repairStock", fmt(onlyDigits(e.target.value)))}
                        />
                      </Col>
                    </Row>
                    {submitted && errors.substocks && <div className="text-danger small mt-2">{errors.substocks}</div>}
                  </Card.Body>
                </Card>
              </Col>

              {/* 이미지 */}
              <Col md={12} className="position-relative">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                    📷 상품 이미지 {(existingImages.length + newImages.length) > 0 &&
                      <Badge bg="secondary" className="ms-1">{existingImages.length + newImages.length}</Badge>}
                  </Form.Label>
                  {(existingImages.length + newImages.length) > 0 && (
                    <Button type="button" size="sm" variant="outline-danger" onClick={resetImages} className="py-0 px-2">
                      🔄 이미지 초기화
                    </Button>
                  )}
                </div>

                {existingImages.length > 0 && (
                  <Row className="g-2 mb-2">
                    {existingImages.map((url, idx) => (
                      <Col key={`exist-${idx}`} xs={6} sm={4} md={3} lg={3}>
                        <Card className="h-100 border-0 shadow-sm position-relative" style={{ borderRadius: 12 }}>
                          <Card.Img variant="top" src={url} style={{ objectFit: "cover", height: 140 }} />
                          <Button
                            variant="light" size="sm"
                            className="position-absolute top-0 end-0 m-1 rounded-circle shadow-sm"
                            onClick={() => removeExistingImage(url)} aria-label="remove existing"
                          >
                            ✕
                          </Button>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}

                <Form.Control
                  type="file" multiple accept="image/*"
                  ref={fileRef}
                  isInvalid={submitted && !!errors.images}
                  onChange={handleNewImagesChange}
                />
                {submitted && errors.images && <div className="invalid-feedback d-block">{errors.images}</div>}

                {newPreviews.length > 0 && (
                  <>
                    <div className="small text-muted mt-2">추가될 새 이미지</div>
                    <Row className="g-2 mt-1">
                      {newPreviews.map((p, idx) => (
                        <Col key={`new-${idx}`} xs={6} sm={4} md={3} lg={3}>
                          <Card className="h-100 border-0 shadow-sm position-relative" style={{ borderRadius: 12 }}>
                            <Card.Img variant="top" src={p.url} style={{ objectFit: "cover", height: 140 }} />
                            <Button
                              variant="light" size="sm"
                              className="position-absolute top-0 end-0 m-1 rounded-circle shadow-sm"
                              onClick={() => removeNewImageAt(idx)} aria-label={`remove ${p.name}`}
                            >
                              ✕
                            </Button>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}
              </Col>

              <Line />

              {/* 버튼 */}
              <Col md={12}>
                <Stack direction="horizontal" gap={2} className="justify-content-center flex-wrap mt-2">
                  <Button type="submit" variant="outline-primary" disabled={saving || deleting} className="px-4">
                    ✅ 상품 수정
                  </Button>
                  <Button type="button" variant="outline-danger" onClick={handleDelete} disabled={saving || deleting} className="px-4">
                    🗑️ 상품 삭제
                  </Button>
                  <Button variant="outline-secondary" onClick={openLogs} disabled={saving || deleting} className="px-4">
                    🕓 수정(삭제) 내역
                  </Button>
                </Stack>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* 수정(삭제) 내역 */}
      <Modal show={showLogs} onHide={() => setShowLogs(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>수정 / 삭제 내역</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          {logs.length > 0 ? (
            <ul className="list-unstyled mb-0">
              {logs.map((log, i) => (
                <li key={log.id ?? i} className="mb-2">
                  <div className={`fw-semibold ${log.event === "DELETE" ? "text-danger" : ""}`}>
                    {log.productName}
                  </div>
                  <small className="text-muted">
                    {new Date(log.createdAt).toLocaleString("ko-KR")} · {log.adminName || "관리자"}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted text-center">수정 또는 삭제 내역이 없습니다.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogs(false)}>닫기</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}