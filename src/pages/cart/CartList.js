import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../../config/url';
import "./cart.css"

export default function CartList({ user }) {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        let response;

        if (user.role === "ADMIN") {
          // 관리자용 API 호출
          response = await axios.get(`${API_BASE_URL}/admin/cart/summary`, { withCredentials: true });

          const mappedProducts = response.data.map(item => ({
            id: item.productId,
            company: item.company,
            name: item.productName,
            price: item.price,
            imageUrl: item.imageUrl || "",
            totalQuantity: item.totalQuantity,
          }));

          setProducts(mappedProducts);
        } else {
          // 일반 유저용 API
          response = await axios.get(`${API_BASE_URL}/cart`, { withCredentials: true });
          const cartData = response.data;

          const mappedProducts = cartData.items.map(item => ({
            id: item.id,
            productId: item.product.id,
            company: item.product.company,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl || "",
            quantity: item.quantity,
            selected: false,
          }));

          setProducts(mappedProducts);
        }

      } catch (err) {
        console.error(err);
        setError("장바구니 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);



  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setProducts(products.map(p => ({ ...p, selected: checked })));
  };

  const handleProductChange = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  // product.id만 넘기기


  const handleDeleteSelected = () => {
    setProducts(products.filter(p => !p.selected));
  };

  const selectedProducts = products.filter(p => p.selected);
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  if (!user) {
    return (
      <Container className="mt-4 text-center">
        <h4>로그인이 필요합니다.</h4>
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: '900px', backgroundColor: '#ffffffff', padding: '2rem 2rem', borderRadius: '10px' }}>



      {user.role === "ADMIN" ? (
        <div>
          <h2 className="mb-4 text-center">장바구니 전체보기</h2>
          {products.length === 0 ? (
            <p className="text-center text-muted my-5">장바구니가 비어있습니다.</p>
          ) : (
            products.map(p => (
              <Card key={p.id} className=" shadow-sm">
                <Card.Body>
                  <Row>
                    <Col xs={3}>
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{ width: "100px", borderRadius: "6px" }}
                      />
                    </Col>
                    <Col xs={9}>
                      <h5>{p.company} {p.name}</h5>
                      <p>가격: {p.price.toLocaleString()}원</p>
                      <p>총 담긴 수량: {p.totalQuantity}개</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      ) : (
        <>
          <h2 className="mb-4 text-center">{user.name}님의 장바구니</h2>
          <Card className="mb-4 shadow-sm">
            <Card.Body>

              {/* 전체 선택 + 전체 삭제 */}
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
                  onClick={handleDeleteSelected}
                >
                  전체 삭제
                </Button>
              </div>

              <hr />

              {/* 장바구니 제품 리스트 */}
              {products.length === 0 ? (
                <p className="text-center text-muted my-5">장바구니가 비어있습니다.</p>
              ) : (
                products.map(product => (
                  <Card key={product.id} className="mb-4 shadow-sm p-3">
                    <Card.Body>
                      {/* 체크박스 + 상품명+회사명 한 줄 */}
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
                          <div className="text-muted">{product.company}</div>
                        </div>
                      </div>

                      {/* 사진 / 옵션 / 가격 */}
                      <Row>
                        <Col xs={4} className="d-flex justify-content-start">
                          <img
                            src={product.imageUrl}
                            alt={product.imageAlt}
                            style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: '#e9ecef',
                              border: '1px solid #ced4da',
                              objectFit: 'contain',
                              borderRadius: '4px',
                            }}
                          />
                        </Col>

                        <Col xs={8} className="d-flex justify-content-end align-items-center">
                          <Form.Label
                            htmlFor={`rental-period-${product.id}`}
                            className="me-2 mb-0"
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            옵션 변경:
                          </Form.Label>
                          <Form.Select
                            id={`rental-period-${product.id}`}
                            size="sm"
                            value={product.rentalPeriod}
                            onChange={(e) =>
                              handleProductChange({ ...product, rentalPeriod: Number(e.target.value) })
                            }
                            style={{ maxWidth: '120px' }}
                          >
                            {product.rentalOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </Form.Select>
                        </Col>

                        {/* 가격은 사진 밑에 왼쪽 정렬로 */}
                        <Col xs={4} className="d-flex justify-content-start mt-3 fw-semibold fs-6">
                          {product.price.toLocaleString()}원
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>

          {/* 구매 상세 */}
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
              onClick={() => alert(`구매하기 ${selectedProducts.length}개`)}
            >
              구매하기 ({selectedProducts.length})
            </Button>
          </Card>
        </>
      )
      }
    </Container>
  );
}