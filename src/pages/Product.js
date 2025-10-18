import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Carousel, Nav } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import axios from "axios";

export default function Product({ user }) {
  const { id } = useParams(); // 상품아이디
  const [product, setProduct] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const [activeTab, setActiveTab] = useState("detail");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/product/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
      alert("상품 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 월 요금 계산 함수 (rentalService에 있는 것과 동일)
  const getMonthlyPrice = () => {
    if (!product) return 0;
    return product.price / (selectedPeriod * 10) - 1100;
  };

  const handleRental = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/rental/${id}`, {
        memberId: user.id,
        productId: Number(id),
        periodYears: selectedPeriod
      });
      alert(`대여 신청이 완료되었습니다.\n월 요금: ${res.data.monthlyPrice.toLocaleString()}원`);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        alert("권한이 없습니다. 다시 로그인해주세요.");
      } else {
        alert("대여 신청 중 오류가 발생했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <h3>상품 정보를 불러오는 중입니다...</h3>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="my-5 text-center">
        <h3>상품 정보를 찾을 수 없습니다.</h3>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ maxWidth: "750px" }}>
      <Row className="mb-5">
        <Col md={6}>
          <Carousel>
            {[product.mainImage, ...(product.images?.map(img => img.url) || [])].map((src, i) => (
              <Carousel.Item key={i}>
                <img
                  className="d-block w-100 rounded"
                  src={`${API_BASE_URL}/images/${src}`}
                  alt={`상품 이미지 ${i + 1}`}
                  style={{ height: "400px", objectFit: "cover" }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        <Col md={6}>
          <h2 className="mb-3 fw-bold">{product.name}</h2>
          <p className="text-muted mb-4">{product.brand} / {product.category}</p> 

          <div className="mb-4">
            <strong>대여기간</strong>
            <Row xs={2} className="mt-1 g-2">
              {[3, 4, 5, 6].map((year) => (
                <Col key={year}>
                  <Button
                    variant={selectedPeriod === year ? "primary" : "outline-primary"}
                    className="w-100 py-3"
                    onClick={() => setSelectedPeriod(year)}
                  >
                    {year}년 ({year*12}개월)
                  </Button>
                </Col>
              ))}
            </Row>
          </div>

          <div className="mb-4">
            <h4 className="text-danger fw-bold">
              {getMonthlyPrice().toLocaleString()} ₩ / 월
            </h4>
            <p className="text-muted">
              총 납부액 : {(getMonthlyPrice()*selectedPeriod*12).toLocaleString()} ₩
              <br />
              일시불(원가) : {product.price.toLocaleString()} ₩
            </p>
          </div>

          {/* 버튼 영역 */}
          <div className="d-flex gap-3">
            <Button variant="outline-primary" size="lg" onClick={handleRental}>
              🛒 장바구니
            </Button>
            <Button variant="outline-danger" size="lg" onClick={handleRental}>
              📦 신청하기
            </Button>
          </div>
        </Col>
      </Row>

      {/* 탭 */}
      <Nav
        variant="tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Nav.Item>
          <Nav.Link eventKey="detail">상세정보</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="review">상품후기</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="inquiry">상품문의</Nav.Link>
        </Nav.Item>
      </Nav>

      {/* 탭 내용 */}
      {activeTab === "detail" && (
        <div className="p-3 border rounded">
          <h5>상품 상세정보</h5>
          <p className="mt-3">{product.description}</p>
        </div>
      )}
      {activeTab === "review" && (
        <div className="p-3 border rounded">
          <h5>상품 후기</h5>
          <p>아직 등록된 후기가 없습니다.</p>
        </div>
      )}
      {activeTab === "inquiry" && (
        <div className="p-3 border rounded">
          <h5>상품 문의</h5>
          <p>문의 내역이 없습니다. 로그인 후 문의를 작성해보세요.</p>
        </div>
      )}
    </Container>
  );
}