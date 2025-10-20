import { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

const CATEGORY_OPTIONS = [
  "REFRIGERATOR", "WASHER", "DRYER", "AIRCON", "TV", "OVEN", "MICROWAVE", "OTHER",
];
const BRAND_OPTIONS = ["SAMSUNG", "LG", "DAEWOO", "WINIA", "CUCKOO", "SK_MAGIC"];
const RENTAL_PERIODS = [1, 3, 5, 10];

export default function AdminProductRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [rentalPeriods, setRentalPeriods] = useState([]);
  const [initialStock, setInitialStock] = useState(0);
  const [available, setAvailable] = useState(true);
  const [images, setImages] = useState([]);

  const toggleRentalPeriod = (p) =>
    setRentalPeriods(rentalPeriods.includes(p)
      ? rentalPeriods.filter(x => x !== p)
      : [...rentalPeriods, p]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !brand || !price || rentalPeriods.length === 0 || images.length === 0) {
      alert("필수 항목을 모두 입력해주세요. 가격은 0보다 커야 합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("category", category);
    formData.append("brand", brand);
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("available", available);
    formData.append("initialStock", initialStock);
    formData.append("rentalPeriods", JSON.stringify(rentalPeriods));
    images.forEach(img => formData.append("images", img));

    try {
      await axios.post(`${API_BASE_URL}/product/register`, formData);
      alert("상품 등록 완료");
      navigate("/admin/products");
    } catch (e) {
        console.error("상품 등록 실패:",e);
        alert("등록 실패");
    }
  };

  return (
    <Container style={{ maxWidth: 600 }} className="mt-4">
                    <h2>상품 등록</h2>
                            <Form onSubmit={handleSubmit}>
                            <Form.Control
                            type="text" placeholder="상품명" value={name} onChange={e => setName(e.target.value)} required className="mb-3"
                            />
                            <Form.Select value={category} onChange={e => setCategory(e.target.value)} required className="mb-3">
                            <option value="">카테고리 선택</option>
                            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </Form.Select>
                <Form.Select value={brand} onChange={e => setBrand(e.target.value)} required className="mb-3">
                <option value="">브랜드 선택</option>
                {BRAND_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </Form.Select>
                <Form.Control
                as="textarea" rows={3} placeholder="상세설명" value={description} onChange={e => setDescription(e.target.value)} className="mb-3"
                />
                <Form.Control
                type="number" placeholder="가격" min={1} value={price} onChange={e => setPrice(Number(e.target.value))} required className="mb-3"
                />
                <div className="mb-3">
                {RENTAL_PERIODS.map(p => (
                    <Form.Check
                    inline key={p} label={`${p}년`} type="checkbox"
                    checked={rentalPeriods.includes(p)} onChange={() => toggleRentalPeriod(p)}
                    />
                ))}
                
                
                </div>
                <Form.Control
                type="number" min={0} value={initialStock} onChange={e => setInitialStock(Number(e.target.value))}
                placeholder="초기 재고" required className="mb-3"
                />
                <Form.Check
                type="checkbox" label="대여 가능" checked={available} onChange={e => setAvailable(e.target.checked)} className="mb-3"
                />
                <Form.Control
                type="file" multiple accept="image/*" onChange={e => setImages([...e.target.files])} required className="mb-3"
                />
                <Button type="submit">등록</Button>
            </Form>
    </Container>
  );
}