import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Container, Form, Button, Alert, Card, Row, Col, InputGroup,
  Badge, Toast, ToastContainer, ProgressBar, Modal, OverlayTrigger, Tooltip, Stack
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/url";

const CATEGORY_OPTIONS = [
  "REFRIGERATOR", "WASHER", "DRYER", "AIRCON",
  "TV", "OVEN", "MICROWAVE", "OTHER"
];

const BRAND_OPTIONS = ["SAMSUNG", "LG", "DAEWOO", "WINIA", "CUCKOO", "SK_MAGIC"];

const prettyLabel = (s) => s.replaceAll("_", " ");
const onlyDigits = (s) => (s || "").replace(/[^0-9]/g, "");
const fmt = (digits) => (digits ? Number(digits).toLocaleString("ko-KR") : "");

export default function ProductUpdateForm({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();

  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",          
    totalStock: "",
    available: true,
    reservedStock: "",  
    rentedStock: "",
    repairStock: "",
  });

  const [touched, setTouched] = useState({});
  const [existingImages, setExistingImages] = useState([]); 
  const [newImages, setNewImages] = useState([]);           
  const [newPreviews, setNewPreviews] = useState([]);       
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fileRef = useRef(null);

  
  useEffect(() => {
    if (!id || id === "undefined" || id === ":id") {
      setInitialLoading(false);
      setErrorMsg("❌ 유효하지 않은 상품 ID 입니다.");
      return;
    }

    (async () => {
      try {
        setInitialLoading(true);
        setErrorMsg("");
        const { data: product } = await axios.get(`${API_BASE_URL}/product/${id}`, { withCredentials: true });

        // 숫자 필드는 콤마포맷 문자열로 세팅(등록 폼과 동일 UX)
        const numToStr = (n) => (n != null ? fmt(String(n)) : "");
        setFormData({
          name: product.name ?? "",
          category: product.category ?? "",
          brand: product.brand ?? "",
          description: product.description ?? "",
          price: numToStr(product.price),
          totalStock: numToStr(product.totalStock),
          available: product.available !== undefined ? product.available : true,
          reservedStock: numToStr(product.reservedStock),
          rentedStock: numToStr(product.rentedStock),
          repairStock: numToStr(product.repairStock),
        });

        // 이미지 URL 
        let imageUrls = [];
        if (product.images && Array.isArray(product.images)) {
          imageUrls = product.images.map((img) => {
            if (typeof img === "string") {
              return img.startsWith("http") ? img : `${API_BASE_URL}/images/${img}`;
            }
            return img.url ? (img.url.startsWith("http") ? img.url : `${API_BASE_URL}/images/${img.url}`) : "";
          }).filter(Boolean);
        } else if (product.mainImage) {
          imageUrls = [product.mainImage.startsWith("http") ? product.mainImage : `${API_BASE_URL}/images/${product.mainImage}`];
        }
        setExistingImages(imageUrls);
      } catch (err) {
        setErrorMsg(`❌ 상품 정보를 불러오지 못했습니다: ${err.response?.data?.message || err.message}`);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [id]);

  
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceBlur = () => {
    const raw = onlyDigits(formData.price);
    if (!raw) return;
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    handleInputChange("price", n === 0 ? "" : n.toLocaleString("ko-KR"));
  };

  const handleStockBlur = (field) => {
    const raw = onlyDigits(formData[field]);
    if (!raw) return;
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    handleInputChange(field, n === 0 ? "" : n.toLocaleString("ko-KR"));
  };

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const removeNewImageAt = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // 새 이미지 미리보기
  useEffect(() => {
    newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setNewPreviews(newImages.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
    })));
    
    return () => newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    
  }, [newImages]);

  
  const invalid = useMemo(() => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "상품명을 입력하세요.";
    if (!formData.category) errs.category = "카테고리를 선택하세요.";
    if (!formData.brand) errs.brand = "브랜드를 선택하세요.";

    const priceNumber = Number(onlyDigits(formData.price));
    if (!priceNumber || priceNumber <= 0) errs.price = "가격은 0보다 커야 합니다.";

    const totalStockNum = Number(onlyDigits(formData.totalStock));
    if (Number.isNaN(totalStockNum) || totalStockNum < 0) errs.totalStock = "총 보유 수량을 확인하세요.";

    const reservedNum = Number(onlyDigits(formData.reservedStock || "0")) || 0;
    const rentedNum   = Number(onlyDigits(formData.rentedStock   || "0")) || 0;
    const repairNum   = Number(onlyDigits(formData.repairStock   || "0")) || 0;

    if (reservedNum < 0 || rentedNum < 0 || repairNum < 0) {
      errs.substocks = "세부 재고 수량은 0 미만이 될 수 없습니다.";
    }
    if (!errs.totalStock && totalStockNum < (reservedNum + rentedNum + repairNum)) {
      errs.substocks = `예약/대여/수리 합(${reservedNum + rentedNum + repairNum}개)이 총 보유 수량(${totalStockNum}개)을 초과했습니다.`;
    }

    if ((existingImages.length + newImages.length) === 0) {
      errs.images = "상품 이미지는 최소 1개 이상 필요합니다.";
    }

    return errs;
  }, [formData, existingImages, newImages]);

  const isInvalid = (key) => touched[key] && invalid[key];

  
  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("category", formData.category);
    fd.append("brand", formData.brand);
    fd.append("description", formData.description ?? "");

    fd.append("price", String(Number(onlyDigits(formData.price))));
    fd.append("totalStock", String(Number(onlyDigits(formData.totalStock))));
    fd.append("available", String(formData.available));

    fd.append("reservedStock", String(Number(onlyDigits(formData.reservedStock || "0")) || 0));
    fd.append("rentedStock",   String(Number(onlyDigits(formData.rentedStock   || "0")) || 0));
    fd.append("repairStock",   String(Number(onlyDigits(formData.repairStock   || "0")) || 0));

    // 기존 이미지 파일명만 보내기
    const cleanExisting = existingImages.map((url) =>
      url.includes("/images/") ? url.split("/images/")[1] : url
    );
    fd.append("existingImages", JSON.stringify(cleanExisting));

    newImages.forEach((img) => fd.append("images", img));
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true, category: true, brand: true,
      price: true, totalStock: true, images: true
    });

    if (Object.keys(invalid).length > 0) {
      setErrorMsg("입력값을 확인해 주세요.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const body = buildFormData();
      await axios.put(`${API_BASE_URL}/product/${id}`, body, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setShowSuccess(true);
      // 성공 후 목록으로 이동
      setTimeout(() => navigate("/product/list"), 1200);
    } catch (err) {
      setErrorMsg(`❌ 상품 수정 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    if (!id) {
      setErrorMsg("❌ 삭제할 상품 ID를 찾을 수 없습니다.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await axios.delete(`${API_BASE_URL}/product/${id}`, { withCredentials: true });
      alert(`✅ 상품 "${formData.name}"이(가) 삭제되었습니다.`);
      navigate("/product/list");
    } catch (err) {
      setErrorMsg(`❌ 상품 삭제 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetImages = (scope = "all") => {
    if(scope === "new" || scope === "all"){
    setNewImages([]);
    if (fileRef.current) fileRef.current.value = "";
  }
    if(scope === "existing" || scope === "all"){
      setExistingImages([]);
    }
    setTouched(t => ({...t, images: false}));
  };

  const totalCountImages = existingImages.length + newImages.length;

  // 재고(읽기 전용 표기용)
  const availableStock =
    Math.max(
      (Number(onlyDigits(formData.totalStock)) || 0) -
      ((Number(onlyDigits(formData.reservedStock)) || 0) +
        (Number(onlyDigits(formData.rentedStock)) || 0) +
        (Number(onlyDigits(formData.repairStock)) || 0)
      ),
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

  
  const SoftDivider = () => <div style={{ height: 1, background: "#eef1f4", margin: "18px 0" }} />;

  return (
    <Container style={{ maxWidth: 760 }} className="py-4">
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: 20, overflow: "hidden" }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(255, 250, 240, 1), rgba(255, 245, 230, 1))",
            padding: "22px 24px",
          }}
        >
          <div className="d-flex align-items-center justify-content-between text-dark">
            <div className="text-center w-100">
              <h3 className="mb-0">상품 수정</h3>
            </div>
          </div>
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
                  isInvalid={!!isInvalid("name")}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{invalid.name}</Form.Control.Feedback>
              </Col>

              {/* 카테고리/브랜드 */}
              <Col md={6}>
                <Form.Label className="fw-semibold">📂 카테고리</Form.Label>
                <Form.Select
                  value={formData.category}
                  isInvalid={!!isInvalid("category")}
                  onBlur={() => setTouched((t) => ({ ...t, category: true }))}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                >
                  <option value="">카테고리 선택</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{prettyLabel(c)}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{invalid.category}</Form.Control.Feedback>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-semibold">🏷️ 브랜드</Form.Label>
                <Form.Select
                  value={formData.brand}
                  isInvalid={!!isInvalid("brand")}
                  onBlur={() => setTouched((t) => ({ ...t, brand: true }))}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                >
                  <option value="">브랜드 선택</option>
                  {BRAND_OPTIONS.map((b) => (
                    <option key={b} value={b}>{prettyLabel(b)}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{invalid.brand}</Form.Control.Feedback>
              </Col>

              {/* 설명 */}
              <Col md={12}>
                <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                  📄 상세설명
                  <OverlayTrigger
                    placement="right"
                    overlay={<Tooltip>주요 기능, 크기/용량, 호환 기종 등을 적어주세요.</Tooltip>}
                  >
                    <i className="bi bi-info-circle" />
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="상품에 대한 상세 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
                <div className="text-end text-muted small mt-1">{formData.description.length}/1000</div>
              </Col>

              {/* 가격/총재고 */}
              <Col md={6}>
                <Form.Label className="fw-semibold">💰 가격</Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    placeholder="예) 329,000"
                    autoComplete="off"
                    value={formData.price}
                    isInvalid={!!isInvalid("price")}
                    onBlur={handlePriceBlur}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      handleInputChange("price",
                        fmt(onlyDigits(e.target.value))
                      )
                    }
                  />
                  <Form.Control.Feedback type="invalid">{invalid.price}</Form.Control.Feedback>
                </InputGroup>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-semibold">📦 총 보유 수량</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  placeholder="예) 120"
                  value={formData.totalStock}
                  isInvalid={!!isInvalid("totalStock")}
                  onBlur={() => handleStockBlur("totalStock")}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    handleInputChange("totalStock",
                      fmt(onlyDigits(e.target.value))
                    )
                  }
                />
                <Form.Control.Feedback type="invalid">{invalid.totalStock}</Form.Control.Feedback>
              </Col>

              {/* 서브 재고 (가용, 대여, 예약, 수리) */}
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
                          type="text"
                          inputMode="numeric"
                          value={formData.rentedStock}
                          onBlur={() => handleStockBlur("rentedStock")}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleInputChange("rentedStock", fmt(onlyDigits(e.target.value)))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label>⏳ 예약 중</Form.Label>
                        <Form.Control
                          type="text"
                          inputMode="numeric"
                          value={formData.reservedStock}
                          onBlur={() => handleStockBlur("reservedStock")}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleInputChange("reservedStock", fmt(onlyDigits(e.target.value)))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label>🔧 수리 중</Form.Label>
                        <Form.Control
                          type="text"
                          inputMode="numeric"
                          value={formData.repairStock}
                          onBlur={() => handleStockBlur("repairStock")}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleInputChange("repairStock", fmt(onlyDigits(e.target.value)))}
                        />
                      </Col>
                    </Row>
                    {invalid.substocks && <div className="text-danger small mt-2">{invalid.substocks}</div>}
                  </Card.Body>
                </Card>
              </Col>

              {/* 이미지 업로드/미리보기 (기존/신규 분리) */}
              <Col md={12} className="position-relative">
                <div className="d=flex justify-content-between align-items-center">
                <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                  📷 상품 이미지 {totalCountImages > 0 && <Badge bg="secondary" className="ms-1">{totalCountImages}</Badge>}
                </Form.Label>

                {/* 이미지 초기화 버튼 */}
                {totalCountImages > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline-danger"
                    onClick={() => resetImages("all")}
                    className="py-0 px-2 position-absolute"
                    style={{ top: "0", right: "0", fontSize: "0.8rem", lineHeight: "1rem"}}
                >
                  🔄 이미지 초기화
                  </Button>
                )}
                </div>

                {/* 기존 이미지 */}
                {existingImages.length > 0 && (
                  <>
                    <Row className="g-2 mb-2">
                      {existingImages.map((url, idx) => (
                        <Col key={`exist-${idx}`} xs={6} sm={4} md={3} lg={3}>
                          <Card className="h-100 border-0 shadow-sm position-relative" style={{ borderRadius: 12 }}>
                            <Card.Img variant="top" src={url} style={{ objectFit: "cover", height: 140 }} />
                            <Button
                              variant="light"
                              size="sm"
                              className="position-absolute top-0 end-0 m-1 rounded-circle shadow-sm"
                              onClick={() => removeExistingImage(url)}
                              aria-label="remove existing"
                            >
                              ✕
                            </Button>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}

                {/* 새 이미지 업로드 + 미리보기 */}
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileRef}
                  isInvalid={!!isInvalid("images")}
                  onBlur={() => setTouched((t) => ({ ...t, images: true }))}
                  onChange={handleNewImagesChange}
                />
                {isInvalid("images") && <div className="invalid-feedback d-block">{invalid.images}</div>}

                {newPreviews.length > 0 && (
                  <>
                    <div className="small text-muted mt-2">추가될 새 이미지</div>
                    <Row className="g-2 mt-1">
                      {newPreviews.map((p, idx) => (
                        <Col key={`new-${idx}`} xs={6} sm={4} md={3} lg={3}>
                          <Card className="h-100 border-0 shadow-sm position-relative" style={{ borderRadius: 12 }}>
                            <Card.Img variant="top" src={p.url} style={{ objectFit: "cover", height: 140 }} />
                            <Button
                              variant="light"
                              size="sm"
                              className="position-absolute top-0 end-0 m-1 rounded-circle shadow-sm"
                              onClick={() => removeNewImageAt(idx)}
                              aria-label={`remove ${p.name}`}
                            >
                              ✕
                            </Button>
                            <Card.Body className="py-2">
                              <div className="small text-truncate" title={p.name}>{p.name}</div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                    <div className="mt-2">
                      <Button size="sm" variant="outline-secondary" onClick={resetImages}>🔄 새 이미지 초기화</Button>
                    </div>
                  </>
                )}
              </Col>

              <SoftDivider />

              {/* 액션 버튼 */}
              <Col md={12}>
                <Stack direction="horizontal" gap={2} className="justify-content-center flex-wrap mt-2">
                  <Button type="submit" variant="primary" disabled={loading} className="px-4">
                    {loading ? "⏳ 수정 중..." : "✅ 상품 수정"}
                  </Button>
                  <Button variant="secondary" onClick={() => navigate("/product/list")} disabled={loading} className="px-4">
                    📋 목록으로
                  </Button>
                </Stack>
                {loading && <ProgressBar animated className="mt-3" now={60} />}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* 성공  */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" show={showSuccess} onClose={() => setShowSuccess(false)} delay={1500} autohide>
          <Toast.Header closeButton={true}>
            <strong className="me-auto">수정 완료</strong>
          </Toast.Header>
          <Toast.Body className="text-white">✅ 상품 정보가 저장되었습니다.</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* 삭제 확인  */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>정말 삭제할까요?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          이 작업은 되돌릴 수 없습니다. 현재 상품과 연결된 이미지 정보도 함께 정리됩니다.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>취소</Button>
          <Button variant="danger" onClick={handleDelete}>삭제</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}