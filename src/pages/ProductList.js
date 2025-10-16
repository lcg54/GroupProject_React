import { useEffect, useState, useRef, useCallback } from "react";
import { Button, Card, Col, Container, Dropdown, Form, Row, Spinner } from "react-bootstrap";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductList({ user }) {
  const [products, setProducts] = useState([]);

  // 무한스크롤 (6개씩 로드, 스크롤 내리면 더나옴)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 검색 필터
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null);
  const [available, setAvailable] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const observer = useRef();

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [category, brand, available, keyword, sortBy]);

  useEffect(() => {
    if (hasMore) fetchProductList();
  }, [page, category, brand, available, keyword, sortBy]);

  const fetchProductList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/product/list`, {
        params: {
          page: page,
          size: 6,
          category: category,
          brand: brand,
          available: available,
          keyword: keyword.trim() || null,
          sortBy: sortBy,
        },
      });
      if (res.data.products.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...res.data.products]);
      }
    } catch (err) {
      alert("상품 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 무한스크롤 처리
  const lastProductRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleDelete = async (product) => {
    if (!window.confirm(`정말 ${product.name}(${product.id}) 을(를) 삭제하시겠습니까?`)) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/product/delete/${product.id}`);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      alert(res.data);
    } catch (err) {
      console.log(err);
      alert("상품 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4"><span style={{ fontSize: "2rem" }}>상품목록</span></h2>

      <Row className="mb-4 align-items-center">
        <Col xs="auto"><CategoryDropdown category={category} setCategory={setCategory} /></Col>
        <Col xs="auto"><BrandDropdown brand={brand} setBrand={setBrand} /></Col>
        <Col xs="auto"><AvailabilityDropdown available={available} setAvailable={setAvailable} /></Col>
        <Col xs="auto"><SortDropdown sortBy={sortBy} setSortBy={setSortBy} /></Col>
        <Col>
          <Form.Control
            type="text"
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                setProducts([]);
                setPage(1);
                setHasMore(true);
              }
            }}
          />
        </Col>
      </Row>

      <Row>
        {products.map((product, idx) => (
          <Col
            key={product.id}
            md={4}
            className="mb-4"
            ref={idx === products.length - 1 ? lastProductRef : null} // 마지막 상품
          >
            <Card
              className="h-100"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/product/detail/${product.id}`)}
            >
              <Card.Img
                variant="top"
                src={`${API_BASE_URL}/images/${product.mainImage}`}
                alt={product.name}
                style={{ width: '100%', height: "200px", objectFit: "cover" }}
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.pricePerPeriod.toLocaleString()} ₩ / 12개월</Card.Text>
                {/* 평점/리뷰 테이블 추가해야 할 듯 */}⭐{product.rate}5.0({product.rentedStock})
                {user?.role === 'ADMIN' && (
                  <div className="d-flex gap-2">
                    <Button variant="warning" onClick={e => { e.stopPropagation(); navigate(`/product/update/${product.id}`); }}>수정</Button>
                    <Button variant="danger" onClick={e => { e.stopPropagation(); handleDelete(product); }}>삭제</Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {loading && (
        <div className="text-center my-3"><Spinner animation="border" /></div>
      )}
      {!hasMore && 
        <div className="text-center my-3">모든 상품을 불러왔습니다.</div>
      }
    </Container>
  );
}

const CategoryDropdown = ({ category, setCategory }) => {
  const options = [
    { value: null, label: "전체" },
    { value: "REFRIGERATOR", label: "냉장고" },
    { value: "WASHER", label: "세탁기" },
    { value: "DRYER", label: "건조기" },
    { value: "AIRCON", label: "에어컨" },
    { value: "TV", label: "티비" },
    { value: "OVEN", label: "오븐" },
    { value: "MICROWAVE", label: "전자레인지" },
    { value: "OTHER", label: "기타" },
  ];
  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary">카테고리: {options.find(o => o.value === category)?.label}</Dropdown.Toggle>
      <Dropdown.Menu>
        {options.map(o => (
          <Dropdown.Item key={o.value} active={o.value === category} onClick={() => setCategory(o.value)}>{o.label}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const BrandDropdown = ({ brand, setBrand }) => {
  const options = [
    { value: null, label: "전체" },
    { value: "SAMSUNG", label: "삼성" },
    { value: "LG", label: "LG" },
  ];
  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary">브랜드: {options.find(o => o.value === brand)?.label}</Dropdown.Toggle>
      <Dropdown.Menu>
        {options.map(o => (
          <Dropdown.Item key={o.value} active={o.value === brand} onClick={() => setBrand(o.value)}>{o.label}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const AvailabilityDropdown = ({ available, setAvailable }) => {
  const options = [
    { value: null, label: "전체" },
    { value: true, label: "대여 가능" },
    { value: false, label: "대여 불가" },
  ];
  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary">대여 가능: {options.find(o => o.value === available)?.label}</Dropdown.Toggle>
      <Dropdown.Menu>
        {options.map(o => (
          <Dropdown.Item key={o.value} active={o.value === available} onClick={() => setAvailable(o.value)}>{o.label}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const SortDropdown = ({ sortBy, setSortBy }) => {
  const options = [
    { value: null, label: "기본순" },
    { value: "POPULAR", label: "인기순" },
    { value: "PRICE_ASC", label: "가격 낮은순" },
    { value: "PRICE_DESC", label: "가격 높은순" },
  ];
  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary">정렬: {options.find(o => o.value === sortBy)?.label}</Dropdown.Toggle>
      <Dropdown.Menu>
        {options.map(o => (
          <Dropdown.Item key={o.value} active={o.value === sortBy} onClick={() => setSortBy(o.value)}>{o.label}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );  
};