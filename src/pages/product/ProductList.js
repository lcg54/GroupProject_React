import { useEffect, useState, useRef, useCallback } from "react";
import { Card, Col, Container, Form, Row, Spinner, Button } from "react-bootstrap";
import { Search, PencilSquare, Trash } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { SelectedFilter, BrandDropdown, AvailabilityDropdown, SortDropdown } from "./Filter";
import CategoryGrid from "./CategoryGrid";
import axios from "axios";

export default function ProductList({ user }) {
  const [products, setProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [category, setCategory] = useState([]);
  const [brand, setBrand] = useState([]);
  const [available, setAvailable] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const observer = useRef();
  const searchRef = useRef(null);

  // 관리자 여부 확인
  const isAdmin = user && user.role === 'ADMIN';

  console.log("Current User:", user);
  console.log("Is Admin:", isAdmin);

  // 필터 바뀌면 목록 리셋
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [category, brand, available, sortBy]);

  // 상품목록 불러오기
  useEffect(() => {
    if (hasMore) fetchProductList();
  }, [page, category, brand, available, sortBy]);

  // 인기상품 3개 불러오기 (고정)
  useEffect(() => {
    fetchPopularProducts();
  }, []);

  // 검색창 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPopularProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/product/popular`);
      const pop = res.data.map(p => ({
        ...p, monthlyPrice: p.price / (6 * 10) - 2100,
      }));
      setPopularProducts(pop);
    } catch (err) {
      console.error("인기상품 불러오기 실패", err);
    }
  };

  const fetchProductList = async (reset = false) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/product/list`, {
        params: {
          page: reset ? 1 : page,
          size: 10,
          category: category.length > 0 ? category : null,
          brand: brand.length > 0 ? brand : null,
          available: available,
          sortBy: sortBy,
          keyword: keyword.trim() || null,
        },
      });
      const newProducts = res.data.products.map(p => ({
        ...p, monthlyPrice: p.price / (6 * 10) - 2100,
      }));
      if (newProducts.length === 0) setHasMore(false);

      if (reset) {
        setProducts(newProducts);
        setPage(1);
        setHasMore(newProducts.length > 0);
      }
      
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

  const handleDelete = async (e, product) => {
    e.stopPropagation(); // 카드 클릭 이벤트 막기
    if (!window.confirm(`정말 ${product.name}(${product.id}) 을(를) 삭제하시겠습니까?`)) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/product/delete/${product.id}`);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      setPopularProducts(prev => prev.filter(p => p.id !== product.id));
      
      fetchProductList(true); 
    } catch (err) {
      console.error("상품 삭제 중 오류 발생:", err);
      alert("상품 삭제 중 오류가 발생했습니다. 권한을 확인해주세요.");
    } finally{
      setLoading(false);
    }
  };

  // 재고 계산
  const getAvailableStock = (p) => 
    (p.totalStock ?? 0) - (p.reservedStock ?? 0) - (p.rentedStock ?? 0) - (p.repairStock ?? 0);

  return (
    <Container className="mt-4" style={{ maxWidth: "900px" }}>
      
      {/* 상단 카테고리 영역 */}
      <CategoryGrid category={category} setCategory={setCategory} />

      {/* 필터 영역 */}
      <div
        className="mb-3 sticky-top bg-white py-2"
        style={{
          top: "0",
          zIndex: 1020,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Row className="g-2 mb-2 align-items-center">
          <Col xs="auto"><BrandDropdown brand={brand} setBrand={setBrand} /></Col>
          <Col xs="auto"><AvailabilityDropdown available={available} setAvailable={setAvailable} /></Col>
          <Col xs="auto"><SortDropdown sortBy={sortBy} setSortBy={setSortBy} /></Col>
          <Col className="text-end position-relative">
            {/* 팝업 검색창 */}
            <Search
              size={22}
              style={{ cursor: "pointer", color: "#0d6efd" }}
              onClick={() => setShowSearch((prev) => !prev)}
            />
            {showSearch && (
              <div
                ref={searchRef}
                className="position-absolute end-0 mt-2 bg-white border rounded shadow p-2"
                style={{
                  width: "220px",
                  zIndex: 2000,
                  animation: "fadeIn 0.15s ease",
                }}
              >
                <Form.Control
                  type="text"
                  placeholder="검색어를 입력하세요"
                  value={keyword}
                  autoFocus
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setShowSearch(false);
                      setProducts([]);
                      setPage(1);
                      setHasMore(true);
                      fetchProductList();
                    } else if (e.key === "Escape") {
                      setShowSearch(false);
                    }
                  }}
                />
              </div>
            )}
          </Col>
        </Row>
        <SelectedFilter
          category={category} setCategory={setCategory}
          brand={brand} setBrand={setBrand}
          available={available} setAvailable={setAvailable}
          sortBy={sortBy} setSortBy={setSortBy}
        />
      </div>

      {/* 인기상품 3개 */}
      {popularProducts.length > 0 && (
        <>
          <Row className="mb-4">
            {popularProducts.slice(0, 3).map(p => {
              const availableStock = getAvailableStock(p);
              const isAvailable = availableStock > 0;
              return (
                <Col key={p.id} md={4} className="mb-3">
                  <div style={{ position: 'relative' }}>
                    <Card
                      className="h-100"
                      style={{
                        cursor: "pointer",
                        opacity: isAvailable ? 1 : 0.55,
                        filter: isAvailable ? 'none' : 'grayscale(40%)',
                        backgroundColor: isAvailable ? undefined : '#f7f7f7',
                      }}
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      <Card.Img
                        variant="top"
                        src={`${API_BASE_URL}/images/${p.mainImage}`}
                        alt={p.name}
                        style={{ width: '100%', height: "200px", objectFit: "cover" }}
                      />
                      <Card.Body>
                        <Card.Title className="mb-1">{p.name}</Card.Title>
                        <p className="mb-1 text-muted">⭐ 평점(리뷰갯수)</p>
                        <Card.Text>월 {p.monthlyPrice.toLocaleString()} ₩</Card.Text>
                        
                        {isAdmin && (
                            <div className="d-flex gap-2 mt-2">
                                <Button 
                                    size="sm" 
                                    variant="outline-primary" 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/product/update/${p.id}`); }}
                                    style={{ flex: 1 }}
                                >
                                    <PencilSquare size={14} className="me-1" /> 수정
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline-danger" 
                                    onClick={(e) => handleDelete(e, p)}
                                    style={{ flex: 1 }}
                                >
                                    <Trash size={14} className="me-1" /> 삭제
                                </Button>
                            </div>
                        )}
                      </Card.Body>
                    </Card>
                    
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: '#FFD43B',
                        color: '#000',
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontWeight: 'bold',
                        fontSize: 12,
                        zIndex: 3,
                      }}
                    >
                      인기제품
                    </div>
                    
                    {!isAvailable && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(255, 0, 0, 0.75)',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 12,
                          fontSize: 12,
                          zIndex: 3,
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
        </>
      )}

      {/* 일반 목록 (가로형 카드) */}
      {products.map((product, idx) => {
        const availableStock = getAvailableStock(product);
        const isAvailable = availableStock > 0;
        return (
          <div
            key={product.id}
            ref={idx === products.length - 1 ? lastProductRef : null}
            className="d-flex align-items-center mb-3 p-2 border rounded"
            style={{
              backgroundColor: isAvailable ? "#fff" : "#f8f8f8",
              opacity: isAvailable ? 1 : 0.55,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <img
              src={`${API_BASE_URL}/images/${product.mainImage}`}
              alt={product.name}
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
                marginRight: 16,
              }}
            />
            <div className="flex-grow-1">
              <h5 className="mb-1">{product.name}</h5>
              <p className="mb-1 text-muted">⭐ 평점(리뷰갯수)</p>
              <p className="mb-0 fw-bold">월 {product.monthlyPrice.toLocaleString()} ₩</p>
            </div>
            {isAdmin && (
                <div 
                    className="d-flex gap-2 ms-3"
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} // 클릭이 잘 되도록 z-index 설정
                >
                    <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={(e) => { 
                            e.stopPropagation(); // 부모 카드 클릭 이벤트 막기
                            navigate(`/admin/product/update/${product.id}`); 
                        }}
                    >
                        <PencilSquare size={14} />
                    </Button>
                    <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={(e) => handleDelete(e, product)}
                    >
                        <Trash size={14} />
                    </Button>
                </div>
            )}
            {!isAvailable && (
              <div
                style={{
                  background: "rgba(255,0,0,0.75)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              >
                재고소진
              </div>
            )}
          </div>
        );
      })}

      {loading && (
        <div className="text-center mt-3">
          <Spinner animation="border" />
          <h5 className="mt-2">상품 정보를 불러오는 중입니다...</h5>
        </div>
      )}
      {!hasMore && 
        <div className="text-center mt-3 mb-5 text-muted">
          모든 상품을 불러왔습니다.
        </div>
      }
    </Container>
  );
}