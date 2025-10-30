import { useState, useEffect } from "react";
import { Alert, Card, Col, Container, Row, Spinner, Form, InputGroup, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { statusLabel } from "../../config/orderStatus";
import { formatDate, formatPrice } from "../../config/form";
import calcRemainingDays from "../../config/calcRemainingDays";
import axios from "axios";

export default function Receipt({ user }) {
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [sortOption, setSortOption] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) fetchRentals();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [rentals, sortOption, searchTerm]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`${API_BASE_URL}/rental/member/${user.id}`);
      setRentals(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelItem = async (rentalItemId) => {
    if (!window.confirm("해당 상품 예약을 취소하시겠습니까?")) return;
    try {
      await axios.post(`${API_BASE_URL}/rental/delete/${rentalItemId}`);
      alert("상품 예약이 취소되었습니다.");
      fetchRentals();
    } catch (err) {
      console.error(err);
      alert("상품 예약 취소에 실패했습니다.");
    }
  };

  const handleRequestReturn = async (rentalItemId) => {
    if (!window.confirm("해당 상품의 반납을 요청하시겠습니까?")) return;
    try {
      await axios.post(`${API_BASE_URL}/rental/requestReturn/${rentalItemId}`);
      alert("반납 요청이 접수되었습니다.");
      fetchRentals();
    } catch (err) {
      console.error(err);
      alert("반납 요청에 실패했습니다.");
    }
  };

  const applyFilters = () => {
    let filtered = [...rentals];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((rental) =>
        rental.items?.some((item) => item?.productName?.toLowerCase().includes(term))
      );
    }
    switch (sortOption) {
      case "recent":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "priceHigh":
        filtered.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case "priceLow":
        filtered.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      default:
        break;
    }
    setFilteredRentals(filtered);
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "800px" }}>
      <Row className="mb-4">
        <Col md={4}>
          <Form.Select value={sortOption} onChange={(e) => setSortOption(e.target.value)} size="sm">
            <option value="recent">최근 주문 순</option>
            <option value="oldest">오래된 주문 순</option>
            <option value="priceHigh">가격 높은 순</option>
            <option value="priceLow">가격 낮은 순</option>
          </Form.Select>
        </Col>
        <Col md={2} />
        <Col md={6}>
          <InputGroup size="sm">
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="제품명을 검색하세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                ✕
              </Button>
            )}
          </InputGroup>
        </Col>
      </Row>

      {loading && (
        <div className="text-center p-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </Spinner>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          {error}{" "}
          <Button variant="link" onClick={fetchRentals}>
            다시 시도
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <>
          {filteredRentals.length === 0 ? (
            <Alert variant="secondary">주문 내역이 없습니다.</Alert>
          ) : (
            <Row>
              {filteredRentals.map((rental) => (
                <Col key={rental.id} md={12} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                      <span>
                        <strong>주문번호:</strong> #{rental.id}
                        <span className="ms-3 text-muted" style={{ fontSize: "0.9rem" }}>
                          {formatDate(rental.createdAt)}
                        </span>
                      </span>
                    </Card.Header>

                    <Card.Body>
                      {rental.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="mb-3 pb-3"
                          style={{
                            borderBottom:
                              idx < rental.items.length - 1 ? "1px solid #dee2e6" : "none",
                          }}
                        >
                          <div className="d-flex align-items-start">

                            <div style={{ width: "120px", height: "120px", flexShrink: 0 }}>
                              <img
                                src={`${API_BASE_URL}/images/${item.mainImage}`}
                                alt={item.productName}
                                className="rounded"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                  border: "1px solid #ddd",
                                }}
                              />
                            </div>
                              
                            <div className="flex-grow-1 ms-3">
                              <Card.Title className="h6 mb-3">{item.productName}</Card.Title>
                              <Card.Text className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                                수량: {item.quantity}개
                              </Card.Text>
                              <Card.Text className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                                옵션: 월 {formatPrice(item.pricePerUnit)} × {item.rentalPeriodYears}년
                                (총 {formatPrice(item.itemTotalPrice)})
                              </Card.Text>
                              <Card.Text className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                                대여 기간: {formatDate(item.rentalStart)} ~ {formatDate(item.rentalEnd)}
                                <strong> {calcRemainingDays(item)}</strong>
                              </Card.Text>
                            </div>
                              
                            <div className="text-end ms-3 d-flex flex-column align-items-end gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                style={{
                                  pointerEvents: "none",
                                  opacity: 1,
                                  fontWeight: "bold",
                                }}
                              >
                                {statusLabel(item.status)}
                              </Button>
                              
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => navigate(`/product/${item.productId}`)}
                              >
                                ✍️ 리뷰 작성
                              </Button>
                              
                              {item.status === "RESERVED" && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleCancelItem(item.itemId)}
                                >
                                  ❌ 예약 취소
                                </Button>
                              )}

                              {item.status === "RENTED" && (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleRequestReturn(item.itemId)}
                                >
                                  📦 반납
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <div
                        className="d-flex justify-content-between align-items-center mt-0 pt-3"
                        style={{ borderTop: "2px solid #dee2e6" }}
                      >
                        <h5 className="mb-0">총 결제금액</h5>
                        <h5 className="mb-0 text-success">{formatPrice(rental.totalPrice)}</h5>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
}