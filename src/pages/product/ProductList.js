import { useEffect, useState, useRef, useCallback } from "react";
import { Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { SelectedFilter, CategoryDropdown, BrandDropdown, AvailabilityDropdown, SortDropdown } from "./Filter";
import axios from "axios";

export default function ProductList({ user }) {
  const [products, setProducts] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [category, setCategory] = useState([]);
  const [brand, setBrand] = useState([]);
  const [available, setAvailable] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [keyword, setKeyword] = useState("");
  
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const observer = useRef();

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [category, brand, available, sortBy]);

  useEffect(() => {
    if (hasMore) fetchProductList();
  }, [page, category, brand, available, sortBy]);

  const fetchProductList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/product/list`, {
        params: {
          page: page,
          size: 15,
          category: category.length > 0 ? category : null,
          brand: brand.length > 0 ? brand : null,
          available: available,
          sortBy: sortBy,
          keyword: keyword.trim() || null,
        },
      });
      const newProducts = res.data.products.map(p => ({
          // 월 요금 계산 함수 (임시) (rentalService에 있는 것과 동일)
        ...p, monthlyPrice:p.price / (6 * 10) - 2100
      }));
      if (newProducts.length === 0) setHasMore(false);
      else setProducts(prev => [...prev, ...newProducts]);
    } catch (err) {
      alert("상품 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 무한스크롤
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
    <Container className="mt-4" style={{ maxWidth: "750px" }}>
      <h2 className="mb-4"><span style={{ fontSize: "2rem" }}>🏷️ 상품목록</span></h2>

      <div
        className="mb-3 sticky-top bg-white py-2"
        style={{
          top: "0",
          zIndex: 1020,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Row className="g-2 mb-2 align-items-center">
          <Col xs="auto"><CategoryDropdown category={category} setCategory={setCategory} /></Col>
          <Col xs="auto"><BrandDropdown brand={brand} setBrand={setBrand} /></Col>
          <Col xs="auto"><AvailabilityDropdown available={available} setAvailable={setAvailable} /></Col>
          <Col xs="auto"><SortDropdown sortBy={sortBy} setSortBy={setSortBy} /></Col>
          <Col>
            <Form.Control
              type="text"
              placeholder="🔍 검색어를 입력하세요."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setProducts([]);
                  setPage(1);
                  setHasMore(true);
                  fetchProductList();
                }
              }}
            />
          </Col>
        </Row>
        <SelectedFilter
          category={category} setCategory={setCategory}
          brand={brand} setBrand={setBrand}
          available={available} setAvailable={setAvailable}
          sortBy={sortBy} setSortBy={setSortBy}
        />
      </div>
 
      <Row>
        {products.map((product, idx) => {
          const availableStock = 
          (product.totalStock ?? 0) - (product.reservedStock ?? 0) - (product.rentedStock ?? 0) - (product.repairStock ?? 0);
          const isAvailable = availableStock > 0;
          return (
            <Col
              key={product.id}
              md={4}
              className="mb-4"
              ref={idx === products.length - 1 ? lastProductRef : null} // 마지막 상품
            >
              <div style={{ position: 'relative' }}>
                <Card // 대여 불가면 반투명 + 회색톤(또는 그레이스케일)
                  className="h-100"
                  style={{
                    cursor: "pointer",
                    opacity: isAvailable ? 1 : 0.55,
                    filter: isAvailable ? 'none' : 'grayscale(40%)',
                    backgroundColor: isAvailable ? undefined : '#f7f7f7',
                    transition: 'opacity 150ms ease, filter 150ms ease, background-color 150ms ease'
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <Card.Img
                    variant="top"
                    src={`${API_BASE_URL}/images/${product.mainImage}`}
                    alt={product.name}
                    style={{ width: '100%', height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title>{product.name}</Card.Title>
                    <p className="mb-1">{/* 평점/리뷰 가져오기 */}⭐평점(리뷰갯수)</p>
                    <Card.Text>월 {product.monthlyPrice.toLocaleString()} ₩</Card.Text>
                    {user?.role === 'ADMIN' && (
                      <div className="d-flex gap-2 mt-2">
                        <button onClick={e => { e.stopPropagation(); navigate(`/product/update/${product.id}`); }}>수정</button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(product); }}>삭제</button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
                {!isAvailable && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: 'rgba(255, 0, 0, 0.65)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: 12,
                      zIndex: 2,
                    }}
                  >
                    재고소진
                  </div>
                )}
              </div>
            </Col>
          );
        })}
      </Row>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
          <h4>상품 정보를 불러오는 중입니다...</h4>
        </div>
      )}
      {!hasMore && 
        <div className="text-center">
          모든 상품을 불러왔습니다.
        </div>
      }
    </Container>
  );
}