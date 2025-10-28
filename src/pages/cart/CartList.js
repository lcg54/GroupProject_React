import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Form, Card, Spinner } from 'react-bootstrap';
import { API_BASE_URL } from '../../config/url';
import Purchased from "../modal/Purchased";
import axios from "axios";
import "./cart.css"

export default function CartList({ user }) {
  const [products, setProducts] = useState([]);
  const [cartId, setCartId] = useState(null);

  const [purchasedInfo, setPurchasedInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      let response;
      if (user.role === "ADMIN") {
        // 관리자용 API 호출
        response = await axios.get(`${API_BASE_URL}/cart/admin/summary`);
        const summaryData = response.data;
        const mappedProducts = summaryData.map(item => ({
          id: item.productId,
          name: item.productName,
          brand: item.brand,
          imageUrl: item.imageUrl,
          quantity: item.totalQuantity,
          estimatedPrice: item.price,
        }));
        setProducts(mappedProducts);
        setCartId(null);
      } else {
        // 일반회원용 API 호출
        response = await axios.post(`${API_BASE_URL}/cart/get`, { memberId: user.id });
        const cartData = response.data;
        setCartId(cartData.id);
        const mappedProducts = cartData.items.map(item => ({
          id: item.productId,
          name: item.productName,
          brand: item.brand,
          imageUrl: item.mainImage,
          quantity: item.quantity,
          rentalPeriod: item.periodYears,
          rentalStart: item.rentalStart || "",
          estimatedPrice: item.estimatedPrice,
          selected: false,
        }));
        setProducts(mappedProducts);
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setProducts(products.map(p => ({ ...p, selected: checked })));
  };

  const handleProductChange = (updatedProduct) => {
    setProducts(products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const selectedProducts = products.filter(p => p.selected);
  const totalPrice = selectedProducts.reduce((sum, p) => sum + (p.estimatedPrice || 0), 0);

  const handleRental = async () => {
    if (!cartId) return;
    const invalid = selectedProducts.some(p => !p.rentalStart);
    if (invalid) { alert("대여 시작일을 선택해주세요."); return; }
    try {
      await axios.post(`${API_BASE_URL}/cart/${cartId}/rental`, {
        memberId: user.id,
        items: selectedProducts.map(p => ({
          productId: p.id,
          quantity: p.quantity,
          periodYears: p.rentalPeriod,
          rentalStart: p.rentalStart
        }))
      });
      setPurchasedInfo({
        products: selectedProducts,
        totalPrice,
      });
      setShowModal(true);
      fetchCart();
    } catch (err) {
      console.error(err);
      alert("주문 처리 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!cartId) return;
    try {
      for (const p of selectedProducts) {
        await axios.delete(`${API_BASE_URL}/cart/${cartId}/product/${p.id}`);
      }
      fetchCart();
      alert(`선택하신 상품이 장바구니에서 삭제되었습니다.`);

    } catch (err) {
      console.error(err);
      alert("상품 삭제 중 오류가 발생했습니다.");
    }
  };

  if (!user) {
    return (
      <Container className="mt-4 text-center">
        <h4>로그인이 필요합니다.</h4>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <h4>장바구니를 불러오는 중입니다...</h4>
      </Container>
    );
  }

  // 관리자 전용 화면
  if (user.role === "ADMIN") {
    // const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    // const totalAmount = products.reduce((sum, p) => sum + ((p.estimatedPrice || 0) * (p.quantity || 0)), 0);

    return (
      <Container style={{ maxWidth: '900px', backgroundColor: '#f1ead7', padding: '2rem', borderRadius: '10px' }}>
        <h2 className="mb-4 text-center">📦 전체 회원 장바구니 요약 일람</h2>
        {products.length === 0 ? (
          <p className="text-center text-muted my-5">현재 장바구니에 담긴 상품이 없습니다.</p>
        ) : (
          <>
            {products.map(product => (
              <Card key={product.id} className="mb-4 shadow-sm p-3">
                <Row className="align-items-center">
                  <Col xs={3}>
                    <img
                      src={`${API_BASE_URL}/images/${product.imageUrl}`}
                      alt={product.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px' }}
                    />
                  </Col>
                  <Col xs={9}>
                    <h5 className="mb-1">{product.name}</h5>
                    <div className="text-muted mb-2">{product.brand}</div>
                    <div>
                      월 납부액(평균): {(product.estimatedPrice || 0).toLocaleString()} ₩<br />
                      상품 수량: {product.quantity} 개
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}

            {/* <Card className="shadow-sm p-4 mt-4 bg-light">
              <h4 className="mb-3 text-center">📊 전체 요약</h4>
              <div className="d-flex justify-content-between fs-5 fw-semibold">
                <span>총 상품 수량</span>
                <span>{totalQuantity.toLocaleString()} 개</span>
              </div>
              <div className="d-flex justify-content-between fs-5 fw-semibold mt-2">
                <span>총 금액</span>
                <span>{totalAmount.toLocaleString()} ₩ / 월</span>
              </div>
            </Card> */}
          </>
        )}
      </Container>
    );
  }

  // 일반회원 화면
  return (
    <Container style={{ maxWidth: '900px', backgroundColor: '#ffffffff', padding: '2rem 2rem', borderRadius: '10px' }}>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Check
              type="checkbox"
              id="select-all"
              label="전체 선택"
              checked={products.length > 0 && selectedProducts.length === products.length}
              disabled={products.length === 0}
              onChange={handleSelectAll}
            />
            <Button
              variant="outline-danger"
              size="sm"
              disabled={selectedProducts.length === 0}
              onClick={handleDelete}
            >
              선택 삭제
            </Button>
          </div>
          <hr />

          {products.length === 0 ? (
            <p className="text-center text-muted my-5">장바구니가 비어있습니다.</p>
          ) : (
            products.map(product => (
              <Card key={product.id} className="shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-start mb-3">
                    <Form.Check
                      type="checkbox"
                      id={`select-item-${product.id}`}
                      checked={product.selected}
                      onChange={() =>
                        handleProductChange({ ...product, selected: !product.selected })
                      }
                      className="me-2 mt-1"
                    />
                    <div>
                      <h5 className="mb-1">{product.name}</h5>
                      <div className="text-muted">{product.brand}</div>
                    </div>
                  </div>

                  <Row>
                    <Col xs={4}>
                      <img
                        src={`${API_BASE_URL}/images/${product.imageUrl}`}
                        alt={product.name}
                        style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px' }}
                      />
                    </Col>
                    <Col xs={8}>
                      <strong>대여 시작일</strong>
                      <Form.Control
                        type="date"
                        className="mt-2"
                        min={new Date().toISOString().split("T")[0]}
                        value={product.rentalStart || ""}
                        onChange={(e) =>
                          handleProductChange({
                            ...product,
                            rentalStart: e.target.value,
                          })
                        }
                      />
                      <hr />
                      <div className="mt-2 fw-semibold fs-6">
                        선택 옵션: {(product.estimatedPrice || 0).toLocaleString()} ₩ / {product.rentalPeriod}년<br />
                        총 납부액: {((product.estimatedPrice || 0) * product.rentalPeriod * 12).toLocaleString()} ₩
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>

      {products.length > 0 && (
        <Card className="shadow-sm p-4">
          <h4 className="mb-3">구매 상세</h4>
          <div className="d-flex justify-content-between align-items-center mb-4 fs-5 fw-semibold">
            <div>상품 금액</div>
            <div>{totalPrice.toLocaleString()}원</div>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-100 fs-5"
            disabled={selectedProducts.length === 0}
            onClick={handleRental}
          >
            구매하기 ({selectedProducts.length})
          </Button>
        </Card>
      )}

      {showModal && (
        <Purchased
          products={purchasedInfo.products.map(p => ({
            name: p.name,
            imageUrl: p.imageUrl,
            rentalPeriod: p.rentalPeriod,
            quantity: p.quantity,
            estimatedPrice: p.estimatedPrice
          }))}
          onClose={() => setShowModal(false)}
        />
      )}
    </Container>
  );
}