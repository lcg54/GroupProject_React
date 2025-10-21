import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/url";

// Configuration constants
const CATEGORY_OPTIONS = [
  "REFRIGERATOR", "WASHER", "DRYER", "AIRCON", 
  "TV", "OVEN", "MICROWAVE", "OTHER"
];

const BRAND_OPTIONS = [
  "SAMSUNG", "LG", "DAEWOO", "WINIA", "CUCKOO", "SK_MAGIC"
];


export default function AdminProductForm({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // Form state management
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: 0,
    totalStock: 0,
    available: true
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load existing product data for edit mode
  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id, navigate]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/product/${id}`);
      const product = response.data;
      
      setFormData({
        name: product.name || "",
        category: product.category || "",
        brand: product.brand || "",
        description: product.description || "",
        price: product.price || 0,
        totalStock: product.totalStock || 0,
        available: product.available !== undefined ? product.available : true
      });
      
      setExistingImages(product.images?.map(img => img.url || img) || []);
    } catch (error) {
      setError("상품 정보를 불러오는데 실패했습니다.");
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Remove existing image
  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  // Handle new image selection
  const handleNewImagesChange = (e) => {
    setNewImages([...e.target.files]);
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) return "상품명을 입력하세요.";
    if (!formData.category) return "카테고리를 선택하세요.";
    if (!formData.brand) return "브랜드를 선택하세요.";
    if (formData.price <= 0) return "가격은 0보다 커야 합니다.";
    if (!id && newImages.length === 0) return "상품 등록 시 이미지는 최소 1개 이상 필요합니다.";
    return null;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = e.nativeEvent.submitter?.name;
    
    // Validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
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
      
      formDataToSend.append("existingImages", JSON.stringify(existingImages));
      
      // Append new images
      newImages.forEach(img => formDataToSend.append("mainImage", img));

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      };

      if (action === "update" && id) {
        await axios.put(`${API_BASE_URL}/product/${id}`, formDataToSend, config);
        alert("상품 수정 완료");
      } else if (action === "register") {
        await axios.post(`${API_BASE_URL}/product/register`, formDataToSend, config);
        alert("상품 등록 완료");
      }

      navigate("/admin/products");
    } catch (error) {
      setError("오류가 발생했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: 600 }} className="mt-4">
      <h2 className="mb-4 text-center">
        {id ? "상품 수정" : "상품 등록"}
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Product Name */}
        <Form.Group className="mb-3">
          <Form.Label>상품명</Form.Label>
          <Form.Control
            type="text"
            placeholder="상품명을 입력하세요"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </Form.Group>

        {/* Category Selection */}
        <Form.Group className="mb-3">
          <Form.Label>카테고리</Form.Label>
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

        {/* Brand Selection */}
        <Form.Group className="mb-3">
          <Form.Label>브랜드</Form.Label>
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

        {/* Description */}
        <Form.Group className="mb-3">
          <Form.Label>상세설명</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="상품에 대한 상세 설명을 입력하세요"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </Form.Group>

        {/* Price and Stock */}
        <div className="row mb-3">
          <div className="col-md-6">
            <Form.Group>
              <Form.Label>가격</Form.Label>
              <Form.Control
                type="number"
                placeholder="가격"
                min={0}
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                required
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group>
              <Form.Label>초기 재고</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={formData.totalStock}
                onChange={(e) => handleInputChange('totalStock', Number(e.target.value))}
                placeholder="재고 수량"
                required
              />
            </Form.Group>
          </div>
        </div>

        {/* Availability Toggle */}
        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            label="판매 가능"
            checked={formData.available}
            onChange={(e) => handleInputChange('available', e.target.checked)}
          />
        </Form.Group>

        {/* Existing Images (Edit Mode) */}
        {id && existingImages.length > 0 && (
          <Form.Group className="mb-3">
            <Form.Label>기존 이미지</Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              {existingImages.map((imgUrl, idx) => (
                <div key={idx} className="position-relative">
                  <img
                    src={imgUrl}
                    alt={`existing-${idx}`}
                    className="rounded border"
                    style={{ 
                      width: 80, 
                      height: 80, 
                      objectFit: "cover" 
                    }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 rounded-circle"
                    style={{ width: 24, height: 24 }}
                    onClick={() => removeExistingImage(imgUrl)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </Form.Group>
        )}

        {/* New Images Upload */}
        <Form.Group className="mb-4">
          <Form.Label>
            {id ? "새 이미지 추가" : "상품 이미지"}
          </Form.Label>
          <Form.Control
            type="file"
            multiple
            accept="image/*"
            onChange={handleNewImagesChange}
            required={!id}
          />
          <Form.Text className="text-muted">
            여러 이미지를 선택할 수 있습니다.
          </Form.Text>
        </Form.Group>

        {/* Action Buttons */}
        <div className="d-flex gap-3 justify-content-center">
          <Button 
            type="submit" 
            name="register" 
            variant="primary"
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            {loading ? "처리 중..." : "등록"}
          </Button>
          <Button 
            type="submit" 
            name="update" 
            variant="success"
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            {loading ? "처리 중..." : "수정"}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate("/admin/products")}
            style={{ minWidth: 120 }}
          >
            취소
          </Button>
        </div>
      </Form>
    </Container>
  );
}