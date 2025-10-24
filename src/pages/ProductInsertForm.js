import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import {Container,Form,Button,Alert,Card,Row,Col,InputGroup,Badge,Toast,ToastContainer,ProgressBar,
  Modal,OverlayTrigger,Tooltip,Stack} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/url";

const CATEGORY_OPTIONS = [
<<<<<<< HEAD
  "REFRIGERATOR",
  "WASHER",
  "DRYER",
  "AIRCON",
  "TV",
  "OVEN",
  "MICROWAVE",
  "OTHER",
=======
  "REFRIGERATOR", "WASHER", "DRYER", "AIRCON",
  "TV", "OVEN", "MICROWAVE", "OTHER"
>>>>>>> 56ad30af012a834a4e7e041df02a5a0a5f064d7e
];

const BRAND_OPTIONS = ["SAMSUNG", "LG", "DAEWOO", "WINIA", "CUCKOO", "SK_MAGIC"];

const prettyLabel = (s) => s.replaceAll("_", " ");

export default function ProductInsertForm({ user }) {
  const navigate = useNavigate();

<<<<<<< HEAD
=======

>>>>>>> 56ad30af012a834a4e7e041df02a5a0a5f064d7e
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    totalStock: "",
    available: true,
  });

  const [touched, setTouched] = useState({});
  const [images, setImages] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // {url, name, size}
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [askAnother, setAskAnother] = useState(false);

  const fileRef = useRef(null);

  const invalid = useMemo(() => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "상품명을 입력하세요.";
    if (!formData.category) errs.category = "카테고리를 선택하세요.";
    if (!formData.brand) errs.brand = "브랜드를 선택하세요.";
    const priceNumber = parseInt(String(formData.price).replace(/[^0-9]/g, ""), 10) || 0;
    if (!priceNumber || priceNumber <= 0) errs.price = "가격은 0보다 커야 합니다.";
    const stockNumber = parseInt(String(formData.totalStock).replace(/[^0-9]/g, ""), 10) || 0;
    if (Number.isNaN(stockNumber) || stockNumber <= 0) errs.totalStock = "총 보유 수량은 1개 이상이어야 합니다.";
    if (images.length === 0) errs.images = "상품 이미지는 최소 1개 이상 필요합니다.";
    return errs;
  }, [formData, images]);

  const isInvalid = (key) => touched[key] && invalid[key];

<<<<<<< HEAD
=======

>>>>>>> 56ad30af012a834a4e7e041df02a5a0a5f064d7e
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

<<<<<<< HEAD
  const handlePriceBlur = () => {
    const raw = String(formData.price).replaceAll(",", "").trim();
    if (!raw) return;
    const n = Number(raw);
    if (Number.isNaN(n)) return;
      handleInputChange("price", n=== 0 ? "" : n.toLocaleString("ko-KR"));
    };
  

  const handleStockBlur = () => {
    const raw = String(formData.totalStock).replaceAll(",", "").trim();
    if (!raw) return;
    const n = Number(raw);
    if (Number.isNaN(n)) return;
      handleInputChange("totalStock", n=== 0? "" : n.toLocaleString("ko-KR"));
    
  };
=======
>>>>>>> 56ad30af012a834a4e7e041df02a5a0a5f064d7e

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImages((prev) => [...prev, ...files]);
  };

<<<<<<< HEAD
  const removeImageAt = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    // cleanup previous URLs
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews(
      images.map((f) => ({
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
      }))
    );
    
  }, [images]);
=======

  const validateForm = () => {
    if (!formData.name.trim()) return "상품명을 입력하세요.";
    if (!formData.category) return "카테고리를 선택하세요.";
    if (!formData.brand) return "브랜드를 선택하세요.";
    if (formData.price <= 0) return "가격은 0보다 커야 합니다.";
    if (productImages.length === 0) return "상품 이미지는 최소 1개 이상 필요합니다.";
    return null;
  };

>>>>>>> 56ad30af012a834a4e7e041df02a5a0a5f064d7e

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      brand: "",
      description: "",
      price: "",
      totalStock: "",
      available: true,
    });
<<<<<<< HEAD
    setTouched({});
    setImages([]);
    setErrorMsg("");
    setShowSuccess(false);
    setAskAnother(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const buildFormData = () => {
    const fd = new FormData();
    const priceNumber = Number(String(formData.price).replace(/[^0-9]/g,"")) || 0;
    const stockNumber = Number(String(formData.totalStock).replace(/[^0-9]/g, "")) || 0;

    fd.set("name", formData.name);
    fd.set("category", formData.category);
    fd.set("brand", formData.brand);
    fd.set("description", formData.description ?? "");
    fd.set("price", String(priceNumber));
    fd.set("available", String(!!formData.available));
    fd.set("totalStock", String(stockNumber));
    images.forEach((file) => fd.append("images", file, file.name));
    
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      category: true,
      brand: true,
      price: true,
      totalStock: true,
      images: true,
    });

    if (Object.keys(invalid).length > 0) {
      setErrorMsg("입력값을 확인해 주세요.");
=======
    setProductImages([]);
    setError("");


    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    const validationError = validateForm();
    if (validationError) {
      setError("⚠️ " + validationError);
>>>>>>> 56ad30af012a834a4e7e041df02a5a0a5f064d7e
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
<<<<<<< HEAD
      const formDataToSend = buildFormData();
      await axios.post(`${API_BASE_URL}/product/register`, formDataToSend,{
        withCredentials: true
      });
      setShowSuccess(true);
      setAskAnother(true);

      navigate("/product/list");
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || "";
      setErrorMsg(`상품 등록 중 오류가 발생했습니다 (${err?.response?.status || ""}) : || ${serverMsg || err?.message}`);
=======
      const formDataToSend = new FormData();


      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key].toString());
      });


      productImages.forEach(img => formDataToSend.append("mainImage", img));

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      };

      await axios.post(`${API_BASE_URL}/product/register`, formDataToSend, config);
      alert("✅ 상품 등록이 완료되었습니다!");


      const registerAnother = window.confirm("다른 상품을 등록하시겠습니까?");
      if (registerAnother) {
        resetForm();
      } else {
        navigate("/admin/products");
      }

    } catch (error) {
      setError("❌ 상품 등록 중 오류가 발생했습니다: " + error.message);
>>>>>>> 56ad30af012a834a4e7e041df02a5a0a5f064d7e
    } finally {
      setLoading(false);
    }
  };

  const SoftDivider = () => (
    <div style={{ height: 1, background: "#eef1f4", margin: "18px 0" }} />
  );

  return (
<<<<<<< HEAD
    <Container style={{ maxWidth: 760 }} className="py-4">
      <Card
        className="mb-4 shadow-sm border-0"
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 250, 240, 1), rgba(255, 245, 230, 1))",
            padding: "22px 24px",
          }}
        >
          <div className="text-center text-dark py-2">
            <div>
              <h3 className="mb-0">상품 등록</h3>
              </div>
          </div>
        </div>

        <Card.Body className="p-4">
          {errorMsg && (
            <Alert variant="danger" className="mb-4" dismissible onClose={() => setErrorMsg("")}> 
              {errorMsg}
            </Alert>
=======
    <Container style={{ maxWidth: 600 }} className="mt-4 productlist-bg">

      <div className="d-flex align-items-center mb-4">
        <h2 className="mb-0 flex-grow-1 text-center">
          상품 등록
        </h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>

        <Form.Group className="mb-3">
          <Form.Label>📋 상품명</Form.Label>
          <Form.Control
            type="text"
            placeholder="상품명을 입력하세요"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </Form.Group>


        <Form.Group className="mb-3">
          <Form.Label>📂 카테고리</Form.Label>
          <Form.Select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            required
          >
            <option value="">카테고리 선택</option>
            {CATEGORY_OPTIONS.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Form.Group>


        <Form.Group className="mb-3">
          <Form.Label>🏷️ 브랜드</Form.Label>
          <Form.Select
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            required
          >
            <option value="">브랜드 선택</option>
            {BRAND_OPTIONS.map(brand => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </Form.Select>
        </Form.Group>


        <Form.Group className="mb-3">
          <Form.Label>📄 상세설명</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="상품에 대한 상세 설명을 입력하세요"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </Form.Group>


        <div className="row mb-3">
          <div className="col-md-6">
            <Form.Group>
              <Form.Label>💰 가격 (원)</Form.Label>
              <Form.Control
                type="number"
                placeholder="가격을 입력하세요"
                min={0}
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                required
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group>
              <Form.Label>📦 총 보유 수량 </Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={formData.totalStock}
                onChange={(e) => handleInputChange('totalStock', Number(e.target.value))}
                placeholder="총 보유 수량을 입력하세요"
                required
              />
            </Form.Group>
          </div>
        </div>


        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            label="🛒 판매 가능"
            checked={formData.available}
            onChange={(e) => handleInputChange('available', e.target.checked)}
          />
        </Form.Group>


        <Form.Group className="mb-4">
          <Form.Label>📷 상품 이미지</Form.Label>
          <Form.Control
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
            required
          />
          <Form.Text className="text-muted">
            📝 여러 이미지를 선택할 수 있습니다. (최소 1개 이상 필요)
          </Form.Text>
          {productImages.length > 0 && (
            <Form.Text className="text-success d-block mt-2">
              ✅ {productImages.length}개 이미지가 선택되었습니다.
            </Form.Text>
>>>>>>> 56ad30af012a834a4e7e041df02a5a0a5f064d7e
          )}

<<<<<<< HEAD
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
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
                <Form.Control.Feedback type="invalid">
                  {invalid.name}
                </Form.Control.Feedback>
              </Col>

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
                    <option key={c} value={c}>
                      {prettyLabel(c)}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {invalid.category}
                </Form.Control.Feedback>
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
                    <option key={b} value={b}>
                      {prettyLabel(b)}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {invalid.brand}
                </Form.Control.Feedback>
              </Col>

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
                <div className="text-end text-muted small mt-1">
                  {formData.description.length}/1000
                </div>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-semibold">💰 가격 </Form.Label>
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
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "");
                      handleInputChange("price", digits 
                      ? Number(digits).toLocaleString("ko-KR")
                      : "");
                    }}
                    />
                  <Form.Control.Feedback type="invalid">
                    {invalid.price}
                  </Form.Control.Feedback>
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
                  onBlur={handleStockBlur}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleInputChange("totalStock", e.target.value.replace(/[^0-9,]/g, ""))}
                />
                <Form.Control.Feedback type="invalid">
                  {invalid.totalStock}
                </Form.Control.Feedback>
              </Col>

              <Col md={12}>
                <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                  📷 상품 이미지 {images.length > 0 && (
                    <Badge bg="secondary" className="ms-1">{images.length}</Badge>
                  )}
                </Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileRef}
                  isInvalid={!!isInvalid("images")}
                  onBlur={() => setTouched((t) => ({ ...t, images: true }))}
                  onChange={handleImagesChange}
                />
                {isInvalid("images") && (
                  <div className="invalid-feedback d-block">{invalid.images}</div>
                )}

                
                {previews.length > 0 && (
                  <Row className="g-2 mt-2">
                    {previews.map((p, idx) => (
                      <Col key={idx} xs={6} sm={4} md={3} lg={3}>
                        <Card className="h-100 border-0 shadow-sm position-relative" style={{ borderRadius: 12 }}>
                          <Card.Img variant="top" src={p.url} style={{ objectFit: "cover", height: 140 }} />
                          <Button
                            variant="light"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1 rounded-circle shadow-sm"
                            onClick={() => removeImageAt(idx)}
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
                )}
              </Col>

              <SoftDivider />

              <Col md={12}>
                <Stack direction="horizontal" gap={2} className="justify-content-center flex-wrap mt-2">
                  <Button
                    type="submit"
                    variant="outline-primary"
                    disabled={loading}
                    className="px-4"
                    
                    
                  >
                    {loading ? "⏳ 등록 중..." : "✅ 상품 등록"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline-danger"
                    onClick={resetForm}
                    disabled={loading}
                    className="px-4"
                  >
                    🔄 초기화
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => navigate("/product/list")}
                    disabled={loading}
                    className="px-4"
                  >
                    📋 목록으로
                  </Button>
                </Stack>

                {loading && (
                  <ProgressBar animated className="mt-3" now={60} />
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Toasts */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" show={showSuccess} onClose={() => setShowSuccess(false)} delay={2500} autohide>
          <Toast.Header closeButton={true}>
            <strong className="me-auto">등록 완료</strong>
          </Toast.Header>
          <Toast.Body className="text-white">✅ 상품 등록이 완료되었습니다!</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Ask: register another? */}
      <Modal show={askAnother} onHide={() => setAskAnother(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>다른 상품도 등록할까요?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          이어서 다른 상품을 등록하시겠어요? 아니면 상품 목록으로 이동할까요?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => { setAskAnother(false); navigate("/admin/products"); }}>
            목록으로
          </Button>
          <Button variant="primary" onClick={() => { setAskAnother(false); resetForm(); }}>
            계속 등록
          </Button>
        </Modal.Footer>
      </Modal>
=======

        <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            {loading ? "⏳ 등록 중..." : "✅ 상품 등록"}
          </Button>

          <Button
            type="button"
            variant="outline-secondary"
            onClick={resetForm}
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            🔄 초기화
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/product/list")}
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            📋 목록으로
          </Button>
        </div>
      </Form>
>>>>>>> 56ad30af012a834a4e7e041df02a5a0a5f064d7e
    </Container>
  );
}
