import axios from "axios";
import { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/url";

// 📋 Configuration constants
const CATEGORY_OPTIONS = [
  "REFRIGERATOR", "WASHER", "DRYER", "AIRCON", 
  "TV", "OVEN", "MICROWAVE", "OTHER"
];

const BRAND_OPTIONS = [
  "SAMSUNG", "LG", "DAEWOO", "WINIA", "CUCKOO", "SK_MAGIC"
];

// ✅ Change component name to match your route
export default function ProductInsertForm({user}) {
  const navigate = useNavigate();

  // 🎯 Form state management
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: 0,
    totalStock: 0,
    available: true
  });

  const [productImages, setProductImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✏️ Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 📷 Handle image selection
  const handleImagesChange = (e) => {
    setProductImages([...e.target.files]);
  };

  // ✅ Form validation
  const validateForm = () => {
    if (!formData.name.trim()) return "상품명을 입력하세요.";
    if (!formData.category) return "카테고리를 선택하세요.";
    if (!formData.brand) return "브랜드를 선택하세요.";
    if (formData.price <= 0) return "가격은 0보다 커야 합니다.";
    if (productImages.length === 0) return "상품 이미지는 최소 1개 이상 필요합니다.";
    return null;
  };

  // 🔄 Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      brand: "",
      description: "",
      price: 0,
      totalStock: 0,
      available: true
    });
    setProductImages([]);
    setError("");
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // 💾 Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const validationError = validateForm();
    if (validationError) {
      setError("⚠️ " + validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key].toString());
      });
      
      // Append product images
      productImages.forEach(img => formDataToSend.append("mainImage", img));

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      };

      await axios.post(`${API_BASE_URL}/product/register`, formDataToSend, config);
      alert("✅ 상품 등록이 완료되었습니다!");
      
      // Ask user if they want to register another product
      const registerAnother = window.confirm("다른 상품을 등록하시겠습니까?");
      if (registerAnother) {
        resetForm();
      } else {
        navigate("/admin/products"); // ✅ Navigate back to admin products
      }

    } catch (error) {
      setError("❌ 상품 등록 중 오류가 발생했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: 600 }} className="mt-4">
      {/* ✅ Add navigation breadcrumb */}
      <div className="d-flex align-items-center mb-4">
        <h2 className="mb-0 flex-grow-1 text-center">
          상품 등록
        </h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* 📝 Product Name */}
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

        {/* 📂 Category Selection */}
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

        {/* 🏷️ Brand Selection */}
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

        {/* 📄 Description */}
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

        {/* 💰 Price and 📦 Stock */}
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
              <Form.Label>📦 초기 재고</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={formData.totalStock}
                onChange={(e) => handleInputChange('totalStock', Number(e.target.value))}
                placeholder="재고 수량을 입력하세요"
                required
              />
            </Form.Group>
          </div>
        </div>

        {/* 🛒 Availability Toggle */}
        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            label="🛒 판매 가능"
            checked={formData.available}
            onChange={(e) => handleInputChange('available', e.target.checked)}
          />
        </Form.Group>

        {/* 📷 Product Images Upload */}
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
          )}
        </Form.Group>

        {/* 🎯 Action Buttons */}
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
            size="lg"
            style={{ minWidth: 140 }}
          >
            {loading ? "⏳ 등록 중..." : "✅ 상품 등록"}
          </Button>
          
          <Button 
            type="button"
            variant="outline-secondary"
            onClick={resetForm}
            disabled={loading}
            size="lg"
            style={{ minWidth: 140 }}
          >
            🔄 초기화
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => navigate("/admin/products")}
            disabled={loading}
            size="lg"
            style={{ minWidth: 140 }}
          >
            📋 목록으로
          </Button>
        </div>
      </Form>
    </Container>
  );
}