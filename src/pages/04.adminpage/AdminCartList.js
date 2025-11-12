import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { API_BASE_URL } from '../../config/url';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminCartList({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const userRole = user?.role || storedUser?.role;

    if (userRole !== "ADMIN") {
      alert("관리자만 접근 가능한 페이지입니다.");
      navigate(`/member/login`);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchAdminCartSummary();
  }, [user]);

  const fetchAdminCartSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/admin/summary`);
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
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <h4>관리자 장바구니 요약을 불러오는 중입니다...</h4>
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: '900px', padding: '2rem', borderRadius: '10px' }}>
      <h3 className="mb-4 text-center">전체 회원 장바구니 요약 일람</h3>
      {products.length === 0 ? (
        <p className="text-center text-muted my-5">장바구니에 담긴 상품이 없습니다.</p>
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
        </>
      )}
    </Container>
  );
}