import { useEffect, useState } from "react"; 
import { Button, Col, Container, Row, Nav, Spinner, Form } from "react-bootstrap";
import { useLocation, useNavigate, useParams, Outlet } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import axios from "axios";
import calcMonthlyPrice from "../../util/calcMonthlyPrice";
import Purchased from "./RentalCreated";
import ProductCarousel from "./ProductCarousel";
import MyWishListButton from "../03.mypage/MyWishListButton";
import "../../css/commonness.css"

export default function Product({ user }) {
  const { id } = useParams(); // 상품 ID
  const [product, setProduct] = useState(null);
  const [rentalStart, setRentalStart] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const [quantity, setQuantity] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/product/category/${id}`);
      const { product, images } = res.data;

      const normalizePaths = (arr = []) =>
        arr.map((img) => {
          if (img.startsWith("/") || img.includes("C:/")) {
            return img.includes("C:/") ? img.split("C:/shop")[1].replace(/\\/g, "/") : img;
          }
          return `/images/category/${product.category}/${product.name}_${product.id}/${img}`;
        });

      const normalizedImages = {
        main: normalizePaths(images?.main),
        sub: normalizePaths(images?.sub),
        detail: normalizePaths(images?.detail),
      };

      setProduct({ ...product, images: normalizedImages });
    } catch (err) {
      console.error(err);
      alert("상품 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 바로 대여
  const handleRental = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate('/member/login');
      return;
    }
    if (!rentalStart) {
      alert("대여 시작일을 선택해주세요.");
      return;
    }
    if (!window.confirm(`
      상품명: ${product.name}
      대여시작일: ${rentalStart}
      대여기간: ${selectedPeriod}년
      대여수량: ${quantity}개

      월 납부액: ${calcMonthlyPrice(selectedPeriod, product.price).toLocaleString()}원
      총 납부액: ${(calcMonthlyPrice(selectedPeriod, product.price) * selectedPeriod * 12).toLocaleString()}원
      
      대여를 신청하시겠습니까?
    `)) return;

    try {
      await axios.post(`${API_BASE_URL}/rental`,
        {
          memberId: user.id,
          items: [
            {
              productId: Number(id),
              quantity: quantity,
              periodYears: selectedPeriod,
              rentalStart: rentalStart,
            },
          ],
        }, 
        { headers: {'Content-Type': 'application/json'} }
      );
      setShowModal(true);

    } catch (err) {
      console.error("대여 요청 실패:", err);
      alert("대여 처리 중 오류가 발생했습니다.");
    }
  };

  // 장바구니에 추가
  const handleCart = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate('/member/login');
      return;
    }
    if (!window.confirm(`
      상품명: ${product.name}
      대여시작일: ${rentalStart ? rentalStart : "미정"}
      대여기간: ${selectedPeriod}년
      대여수량: ${quantity}개

      월 납부액: ${calcMonthlyPrice(selectedPeriod, product.price).toLocaleString()}원
      총 납부액: ${(calcMonthlyPrice(selectedPeriod, product.price) * selectedPeriod * 12).toLocaleString()}원
      
      장바구니에 추가하시겠습니까?
    `)) return;

    try {
      await axios.post(`${API_BASE_URL}/cart/add`, {
        memberId: user.id,
        items: [
          {
            productId: Number(id),
            quantity: quantity,
            periodYears: selectedPeriod,
            rentalStart: rentalStart || null,
          },
        ],
      });
      alert("장바구니에 추가되었습니다!");
      navigate("/mypage/cart");

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

  const getDateString = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getDateString(tomorrow);

  // 현재 경로에 따라 활성 탭 결정
  const currentPath = location.pathname;
  let activeKey = "detail";
  if (currentPath.includes("review")) activeKey = "review";
  else if (currentPath.includes("inquiry")) activeKey = "inquiry";

  return (
    <Container className="mt-4" style={{ maxWidth: "700px" }}>
      <Row className="mb-5">
        <Col md={6}>
          <ProductCarousel product={product} />
        </Col>

        <Col md={6}>
          <h2 className="mb-3 fw-bold">{product.name}</h2>
          <p className="text-muted mb-4">{product.brand} / {product.category}</p>

          <div className="mb-3">
            <strong>대여 시작일</strong>
            <Form.Control
              type="date"
              value={rentalStart}
              min={tomorrowStr}
              onChange={(e) => { setRentalStart(e.target.value)}}
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
            <strong>수량</strong>
            <div className="d-flex align-items-center gap-2 mt-1">
              <Button
                variant="outline-secondary"
                onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                disabled={product.availableStock === 0}
              >
                -
              </Button>
              <span className="px-3">{product.availableStock === 0 ? 0 : quantity}</span>
              <Button
                variant="outline-secondary"
                onClick={() => setQuantity(prev => Math.min(prev + 1, product.availableStock))}
                disabled={product.availableStock === 0}
              >
                +
              </Button>
            </div>
            <small className="text-muted">최대 {product.availableStock}개까지 선택 가능</small>
          </div>

          <div className="mb-4">
            <h4 className="text-danger fw-bold">
              {calcMonthlyPrice(selectedPeriod, product.price).toLocaleString()} ₩ / 월
            </h4>
            <p className="text-muted">
              총 납부액: {(calcMonthlyPrice(selectedPeriod, product.price) * selectedPeriod * 12).toLocaleString()} ₩
              <br />
              일시불(원가): {product.price.toLocaleString()} ₩
            </p>
          </div>

          <div className="d-flex gap-2">
            <MyWishListButton productId={Number(id)} user={user} />
            <Button variant="outline-primary" size="sm" onClick={handleCart} disabled={product.availableStock === 0 || user?.role === "ADMIN"}>
              🛒 장바구니
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleRental} disabled={product.availableStock === 0  || user?.role === "ADMIN"}>
              📦 신청하기
            </Button>
          </div>
        </Col>
      </Row>

      <Nav variant="tabs" activeKey={activeKey} className="mb-3">
        <Nav.Item>
          <Nav.Link onClick={() => navigate(`/product/${id}`)} eventKey="detail" style={{ color: activeKey === "detail" ? "#0d6efd" : "black" }}>
            상세정보
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link onClick={() => navigate(`/product/${id}/review/list`)} eventKey="review" style={{ color: activeKey === "review" ? "#0d6efd" : "black" }}>
            상품후기
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link onClick={() => navigate(`/product/${id}/inquiry/list`)} eventKey="inquiry" style={{ color: activeKey === "inquiry" ? "#0d6efd" : "black" }}>
            상품문의
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeKey === "detail" ? (
        <>
          <p className="mt-3">{product.description}</p>
          {product.images?.detail?.length > 0 && (
            <>
              <h5 className="fw-bold mb-3">상품 상세 이미지</h5>
              {product.images.detail.map((img, idx) => (
                <img
                  key={idx}
                  src={`${API_BASE_URL}${img}`}
                  alt={`상세 이미지 ${idx + 1}`}
                  style={{
                    width: "100%",
                    maxWidth: "650px",
                    height: "auto",
                    border: "none",
                    borderRadius: 0,
                    objectFit: "contain",
                    display: "block",
                    margin: 0,
                    padding: 0,
                    lineHeight: 0,
                  }}
                />
              ))}
            </>
          )}
        </>
      ) : (
        <div className="p-3 border rounded">
          <Outlet context={{ user }} />
        </div>
      )}

      {showModal && (
        <Purchased
          products={[{
            name: product.name,
            imageUrl: product.mainImage,
            rentalPeriod: selectedPeriod,
            quantity: quantity,
            estimatedPrice: calcMonthlyPrice(selectedPeriod, product.price)
          }]}
          onClose={() => setShowModal(false)}
        />
      )}
    </Container>
  );
}