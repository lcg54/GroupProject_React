import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Carousel, Nav, Spinner, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/url";
import InquiryList from "../InquiryList";
import ReviewList from "../ReviewList";

export default function Product({ user }) {
  const { id } = useParams(); // 상품 ID
  const [product, setProduct] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const [rentalStart, setRentalStart] = useState("");
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

  const getMonthlyPrice = () => {
    if (!product) return 0;
    return Math.round(product.price / (selectedPeriod * 8) - 5100);
  };

  const handleRental = async () => {
    if (!user) { alert("로그인이 필요합니다."); return; }
    if (!rentalStart) { alert("대여 시작일을 선택해주세요."); return; }

    const rentalData = {
      memberId: user.id,
      items: [
        {
          productId: Number(id),
          quantity: 1,
          periodYears: selectedPeriod,
          rentalStart,
        },
      ],
    };

    if (!window.confirm(`
      상품명: ${product.name}
      대여시작일: ${rentalStart}
      대여기간: ${selectedPeriod}년
      월 납부액: ${getMonthlyPrice().toLocaleString()}원
      총 납부액: ${(getMonthlyPrice() * selectedPeriod * 12).toLocaleString()}원\n
      대여를 신청하시겠습니까?
    `)) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/rental`, rentalData);
      alert("대여가 완료되었습니다!");
      console.log("대여 결과:", res.data);
    } catch (err) {
      console.error("대여 요청 실패:", err);
      alert("대여 중 오류가 발생했습니다.");
    }
  };

  const handleCart = async () => {
    if (!user) { alert("로그인이 필요합니다."); return; }

    if (!window.confirm(`
      상품명: ${product.name}
      대여기간: ${selectedPeriod}년
      장바구니에 추가하시겠습니까?
    `)) return;

    try {
      await axios.post(`${API_BASE_URL}/cart/add`, {
        memberId: user.id,
        items: [
        {
          productId: Number(id),
          quantity: 1,
          periodYears: selectedPeriod,
          rentalStart: rentalStart || null, // 장바구니에 담을 땐 대여시작일 선택 안해도 가능
        },
      ],
        
      });
      alert("장바구니에 추가되었습니다!");
      navigate("/cart");
    } catch (err) {
      console.error("장바구니 추가 실패:", err);
      alert("장바구니 추가 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <h4>상품 정보를 불러오는 중입니다...</h4>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="mt-4 text-center">
        <h4>상품 정보를 찾을 수 없습니다.</h4>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ maxWidth: "700px" }}>
      <Row className="mb-5">
        <Col md={6}>
          <Carousel>
            {[product.mainImage, ...(product.images || [])].map((src, i) => (
              <Carousel.Item key={i}>
                <img
                  className="d-block w-100 rounded"
                  src={`${API_BASE_URL}/images/${src}`}
                  alt={`상품 이미지 ${i + 1}`}
                  style={{ height: "400px", objectFit: "contain" }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        <Col md={6}>
          <h2 className="mb-3 fw-bold">{product.name}</h2>
          <p className="text-muted mb-4">{product.brand} / {product.category}</p>

          <div className="mb-3">
            <strong>대여 시작일</strong>
            <Form.Control
              type="date"
              value={rentalStart}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setRentalStart(e.target.value)}
            />
          </div>

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
                    {year}년 ({year * 12}개월)
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
              총 납부액: {(getMonthlyPrice() * selectedPeriod * 12).toLocaleString()} ₩
              <br />
              일시불(원가): {product.price.toLocaleString()} ₩
            </p>
          </div>

          <div className="d-flex gap-3">
            <Button variant="outline-primary" size="lg" onClick={handleCart}>
              🛒 장바구니
            </Button>
            <Button variant="outline-danger" size="lg" onClick={handleRental}>
              📦 신청하기
            </Button>
          </div>
        </Col>
      </Row>

      <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
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

      {activeTab === "detail" && (
        <div className="p-3 border rounded">
          <p className="mt-3">{product.description}</p>
        </div>
      )}
      {activeTab === "review" && (
        <div className="p-3 border rounded">
          <ReviewList />
        </div>
      )}
      {activeTab === "inquiry" && (
        <div className="p-3 border rounded">
          <InquiryList />
        </div>
      )}
    </Container>
  );
}