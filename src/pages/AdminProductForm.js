import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/config";

const CATEGORY_OPTIONS = ["REFRIGERATOR", "WASHER", "DRYER", "AIRCON", "TV", "OVEN", "MICROWAVE", "OTHER"];
const BRAND_OPTIONS = ["SAMSUNG", "LG", "DAEWOO", "WINIA", "CUCKOO", "SK_MAGIC"];
const RENTAL_PERIODS = ["3년(36개월)", "4년(48개월)", "5년(60개월)", "6년(72개월)"]; // 필요 없으면 제거 가능

export default function AdminProductForm({ user }) {
  const navigate = useNavigate();
  const { id } = useParams(); // 상품 id (수정 시 존재)

  
  useEffect(() => {
    // 로그인 및 관리자 권한 체크 삭제 또는 비활성화
  }, []);

  // 상태 관리
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [totalStock, settotalStock] = useState(0);
  const [available, setAvailable] = useState(true);
  const [existingImages, setExistingImages] = useState([]); // 수정 시 기존 이미지 보여주기
  const [newImages, setNewImages] = useState([]); // 새로 업로드할 이미지 파일 목록

  // 수정 모드일 경우 기존 상품 정보 불러오기
  useEffect(() => {
    if (id) {
      axios
        .get(`${API_BASE_URL}/product/${id}`)
        .then((res) => {
          const p = res.data;
          setName(p.name || "");
          setCategory(p.category || "");
          setBrand(p.brand || "");
          setDescription(p.description || "");
          setPrice(p.price || 0);
          settotalStock(p.totalStock || 0);
          setAvailable(p.available !== undefined ? p.available : true);
          setExistingImages(p.images?.map(img => img.url || img) || []);
        })
        .catch(() => {
          alert("상품 정보를 불러오는데 실패했습니다.");
          navigate("/admin/products");
        });
    }
  }, [id, navigate]);

  // 이미지 삭제 (기존 이미지에서 제거)
  const removeExistingImage = (url) => {
    setExistingImages(existingImages.filter((img) => img !== url));
  };

  // 새 이미지 선택
  const handleNewImagesChange = (e) => {
    setNewImages([...e.target.files]);
  };

  // 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = e.nativeEvent.submitter?.name;

    // 간단 유효성 체크
    if (!name.trim()) {
      alert("상품명을 입력하세요.");
      return;
    }
    if (!category) {
      alert("카테고리를 선택하세요.");
      return;
    }
    if (!brand) {
      alert("브랜드를 선택하세요.");
      return;
    }
    if (price <= 0) {
      alert("가격은 0보다 커야 합니다.");
      return;
    }
    if (!id && newImages.length === 0) {
      alert("상품 등록 시 이미지는 최소 1개 이상 필요합니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", category);
      formData.append("brand", brand);
      formData.append("description", description.trim());
      formData.append("price", price.toString());
      formData.append("available", available.toString());
      formData.append("totalStock", totalStock.toString());
      formData.append("existingImages", JSON.stringify(existingImages)); // 기존 이미지 리스트 (수정 시)

      newImages.forEach((img) => formData.append("mainImage", img)); // 새로 추가된 이미지들

      if (action === "update" && id) {
        // 수정 모드
        await axios.put(`${API_BASE_URL}/product/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        alert("상품 수정 완료");
      } else if (action === "register") {
        // 등록 모드
        await axios.post(`${API_BASE_URL}/product/register`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        alert("상품 등록 완료");
      }

      navigate("/admin/products");
    } catch (error) {
    alert("오류가 발생했습니다: " + error.message);
  }
  };

  return (
    <Container style={{ maxWidth: 600 }} className="mt-4">
      <h2>{id ? "상품 수정" : "상품 등록"}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Control
          type="text"
          placeholder="상품명"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mb-3"
        />
        <Form.Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="mb-3"
        >
          <option value="">카테고리 선택</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
          className="mb-3"
        >
          <option value="">브랜드 선택</option>
          {BRAND_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Form.Select>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="상세설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-3"
        />
        <Form.Control
          type="number"
          placeholder="가격"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
          className="mb-3"
        />
        <Form.Control
          type="number"
          min={0}
          value={totalStock}
          onChange={(e) => settotalStock(Number(e.target.value))}
          placeholder="초기 재고"
          required
          className="mb-3"
        />
        <Form.Check
          type="checkbox"
          label="판매 가능"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="mb-3"
        />

        {/* 수정 모드일 때 기존 이미지 보여주기 */}
        {id && existingImages.length > 0 && (
          <div className="mb-3">
            <Form.Label>기존 이미지</Form.Label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {existingImages.map((imgUrl, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <img
                    src={imgUrl}
                    alt={`existing-${idx}`}
                    width={80}
                    height={80}
                    style={{ objectFit: "cover" }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ position: "absolute", top: 0, right: 0 }}
                    onClick={() => removeExistingImage(imgUrl)}
                  >
                    X
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Form.Control
          type="file"
          multiple
          accept="image/*"
          onChange={handleNewImagesChange}
          required={!id} // 등록 시 필수, 수정 시 선택적
          className="mb-3"
        />
        
          <Button type="submit" name="register" style={{ marginRight: '10px' }}>
                등록
          </Button>
          <Button type="submit" name="update">
                수정
          </Button>
      </Form>
    </Container>
  );
}