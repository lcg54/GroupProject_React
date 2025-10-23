import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/url";


const CATEGORY_OPTIONS = [
  "REFRIGERATOR", "WASHER", "DRYER", "AIRCON",
  "TV", "OVEN", "MICROWAVE", "OTHER"
];

const BRAND_OPTIONS = [
  "SAMSUNG", "LG", "DAEWOO", "WINIA", "CUCKOO", "SK_MAGIC"
];

export default function AdminProductUpdate({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();


  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: 0,
    totalStock: 0,
    available: true,
    reservedStock: 0,
    rentedStock: 0,
    repairStock: 0,
  });



  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    console.log("ProductUpdate - ID from params:", id);

    // if (!id || id === "undefined" || id === ":id") {
    //   setInitialLoading(false);
    //   return;
    // } else {
    //   setError("❌ 유효하지 않은 상품 ID입니다.");
    //   setTimeout(() => navigate("/"), 2000);
    // }
    if (!id || id === "undefined" || id === ":id") {
      setError("❌ 유효하지 않은 상품 ID입니다.");
      setTimeout(() => navigate("/"), 2000);
      setInitialLoading(false);
      return;
    }

    loadProductData();
  }, [id, navigate]);

  const loadProductData = async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
      setError("");

      const response = await axios.get(`${API_BASE_URL}/product/${id}`);
      const product = response.data;

      console.log("Loaded product data:", product);


      setFormData({
        name: product.name || "",
        category: product.category || "",
        brand: product.brand || "",
        description: product.description || "",
        price: Number(product.price) || 0,
        totalStock: Number(product.totalStock) || 0,
        available: product.available !== undefined ? product.available : true,
        reservedStock: Number(product.reservedStock) || 0,
        rentedStock: Number(product.rentedStock) || 0,
        repairStock: Number(product.repairStock) || 0,
      });


      let imageUrls = [];
      if (product.images && Array.isArray(product.images)) {
        imageUrls = product.images.map(img => {
          if (typeof img === 'string') {
            return img.startsWith('http') ? img : `${API_BASE_URL}/images/${img}`;
          }
          return img.url ? (img.url.startsWith('http') ? img.url : `${API_BASE_URL}/images/${img.url}`) : '';
        }).filter(url => url);
      } else if (product.mainImage) {
        const mainImageUrl = product.mainImage.startsWith('http')
          ? product.mainImage
          : `${API_BASE_URL}/images/${product.mainImage}`;
        imageUrls = [mainImageUrl];
      }

      setExistingImages(imageUrls);
      console.log("Loaded images:", imageUrls);

    } catch (error) {
      console.error("Error loading product data:", error);
      setError(`❌ 상품 정보를 불러오는데 실패했습니다: ${error.response?.data?.message || error.message}`);
      setTimeout(() => navigate("/"), 3000);
    } finally {
      setInitialLoading(false);
    }
  };


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));


    if (error) setError("");
  };


  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };


  const handleNewImagesChange = (e) => {
    const files = [...e.target.files];
    setNewImages(files);
  };


  const validateForm = () => {
    if (!formData.name.trim()) return "상품명을 입력하세요.";
    if (!formData.category) return "카테고리를 선택하세요.";
    if (!formData.brand) return "브랜드를 선택하세요.";
    if (formData.price <= 0) return "가격은 0보다 커야 합니다.";
    if (formData.totalStock < 0) return "재고는 0 이상이어야 합니다.";
    if (formData.reservedStock < 0 || formData.rentedStock < 0 || formData.repairStock < 0) {
      return "세부 재고 수량은 0 미만이 될 수 없습니다.";
    }

    const sumUnavailable = formData.reservedStock + formData.rentedStock + formData.repairStock;
    if (sumUnavailable > formData.totalStock) {
      return `⚠️ 예약/대여/수리 중인 재고의 합(${sumUnavailable}개)이 총 보유 수량(${formData.totalStock}개)을 초과했습니다.`;
    }

    if (existingImages.length === 0 && newImages.length === 0) {
      return "상품 이미지는 최소 1개 이상 필요합니다.";
    }
    return null;
  };


  const resetNewImages = () => {
    setNewImages([]);
    setError("");


    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    const validationError = validateForm();
    if (validationError) {
      setError("⚠️ " + validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();


      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key].toString());
      });


      const cleanExistingImages = existingImages.map(url => {
        if (url.includes('/images/')) {
          return url.split('/images/')[1];
        }
        return url;
      });
      formDataToSend.append("existingImages", JSON.stringify(cleanExistingImages));


      newImages.forEach(img => formDataToSend.append("mainImage", img));

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      };

      console.log("Updating product with ID:", id);

      await axios.put(`${API_BASE_URL}/product/${id}`, formDataToSend, config);
      alert("✅ 상품 수정이 완료되었습니다!");


      navigate("/product/list");

    } catch (error) {
      console.error("Error updating product:", error);
      setError(`❌ 상품 수정 중 오류가 발생했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (initialLoading) {
    return (
      <Container style={{ maxWidth: 600 }} className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">⏳ 상품 정보를 불러오는 중...</p>
        </div>
      </Container>
    );
  }

  const handleDelete = async () => {
    if (!id) {
      setError("❌ 삭제할 상품 ID를 찾을 수 없습니다.");
      return;
    }


    const isConfirmed = window.confirm(`"${formData.name}" 상품을 정말로 삭제하시겠습니까?`);
    if (!isConfirmed) {
      return; // 사용자가 취소함
    }

    setLoading(true);
    setError("");

    try {
      console.log("Deleting product with ID:", id); // Debug log


      await axios.delete(`${API_BASE_URL}/product/${id}`, {
        withCredentials: true,
      });

      alert(`✅ 상품 "${formData.name}"이(가) 성공적으로 삭제되었습니다.`);


      navigate("/product/list");

    } catch (error) {
      console.error("Error deleting product:", error);
      setError(`❌ 상품 삭제 중 오류가 발생했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }


  };

  const availableStock = Math.max(
    formData.totalStock - (formData.reservedStock
      + formData.rentedStock
      + formData.repairStock),
    0
  );


  return (
    <Container style={{ maxWidth: 600 }} className="mt-4 productlist-bg">
      <div className="d-flex align-items-center mb-4">
        <h2 className="mb-0 flex-grow-1 text-center">
          상품 수정
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
              <Form.Label>📦 총 재고 수량 </Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={formData.totalStock}
                onChange={(e) => handleInputChange('totalStock', Number(e.target.value))}
                placeholder="총 재고 수량을 입력하세요"
                required
              />
            </Form.Group>
          </div>
        </div>

        <div className="row mb-3 border p-3 rounded bg-light">
          <h6 className="mb-3 text primary">📊 현재 재고 현황 </h6>

          <div className="col-md-6 mb-3">
            <Form.Label>✅ 대여 가능 </Form.Label>
            <Form.Control
              type="number"
              value={availableStock}
              readOnly
              disabled
              className="fw-bold bg-white"
            />
          </div>

          <div className="col-md-6 mb-3">
            <Form.Label>🚚 대여 중 </Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={formData.rentedStock}
              onChange={(e) => handleInputChange('rentedStock', Number(e.target.value))}
              className="bg-white"
            />
          </div>

          <div className="col-md-6 mb-3">
            <Form.Label>⏳ 예약 중 </Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={formData.reservedStock}
              onChange={(e) => handleInputChange('reservedStock', Number(e.target.value))}
              className="bg-white"
            />
          </div>

          <div className="col-md-6 mb-3">
            <Form.Label>🔧 수리 중 </Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={formData.repairStock}
              onChange={(e) => handleInputChange('repairStock', Number(e.target.value))}
              className="bg-white"
            />
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


        {existingImages.length > 0 && (
          <Form.Group className="mb-3">
            <Form.Label>🖼️ 기존 이미지 ({existingImages.length}개)</Form.Label>
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
                    onError={(e) => {
                      console.error("Image load error:", imgUrl);
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 rounded-circle"
                    style={{ width: 24, height: 24, fontSize: '12px' }}
                    onClick={() => removeExistingImage(imgUrl)}
                    title="이미지 삭제"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <Form.Text className="text-muted">
              ❌ 삭제하려는 이미지의 × 버튼을 클릭하세요.
            </Form.Text>
          </Form.Group>
        )}


        <Form.Group className="mb-4">
          <Form.Label>📷 새 이미지 추가</Form.Label>
          <Form.Control
            type="file"
            multiple
            accept="image/*"
            onChange={handleNewImagesChange}
          />
          <Form.Text className="text-muted">
            📝 새로운 이미지를 추가할 수 있습니다. (선택사항)
          </Form.Text>
          {newImages.length > 0 && (
            <Form.Text className="text-success d-block mt-2">
              ✅ {newImages.length}개 새 이미지가 선택되었습니다.
            </Form.Text>
          )}
        </Form.Group>


        <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
          <Button
            type="submit"
            variant="success"
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            {loading ? "⏳ 수정 중..." : "상품 수정"}
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            상품 삭제
          </Button>

          <Button
            type="button"
            variant="outline-secondary"
            onClick={resetNewImages}
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            🔄 이미지 초기화
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
    </Container>
  );
}