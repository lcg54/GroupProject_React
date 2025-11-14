import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { useNavigate, useOutletContext } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import calcMonthlyPrice from "../../formatter/calcMonthlyPrice";

export default function MyWishListPage() {
  const { user } = useOutletContext();
  const [wishedProducts, setWishedProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    loadMyWishlist();
  }, [user]);

  // 내 찜 상품 불러오기
  async function loadMyWishlist() {
    setIsLoading(true);
    try {
      const { data: wishedProductIdList } = await axios.get(`${API_BASE_URL}/wishlist/my`, {
        params: { memberId: user.id },
      });

      if (!Array.isArray(wishedProductIdList) || wishedProductIdList.length === 0) {
        setWishedProducts([]);
        return;
      }

      const productDetails = [];
      for (let index = 0; index < wishedProductIdList.length; index++) {
        const productId = wishedProductIdList[index];
        const { data: productDetail } = await axios.get(`${API_BASE_URL}/product/${productId}`);
        productDetails.push(productDetail);
      }
      setWishedProducts(productDetails);
    } catch (error) {
      alert("찜 목록을 불러오지 못했습니다.");
      setWishedProducts([]);
    } finally {
      setIsLoading(false);
    }
  }

  // 전체 찜 해제 (모든 상품 토글)
  async function removeAllFromWishlist() {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/member/login");
      return;
    }
    if (wishedProducts.length === 0) {
      alert("찜한 상품이 없습니다.");
      return;
    }
    const isConfirmed = window.confirm(`${wishedProducts.length}개 상품을 모두 해제할까요?`);
    if (!isConfirmed) return;

    for (let index = 0; index < wishedProducts.length; index++) {
      const product = wishedProducts[index];
      await axios.post(`${API_BASE_URL}/wishlist/toggle`, {
        memberId: user.id,
        productId: product.id,
      });
    }
    alert("전체 해제되었습니다.");
    setWishedProducts([]);
  }

  if (!user) {
    return <Container className="mt-4">로그인 후 확인할 수 있습니다.</Container>;
  }

  return (
    <Container className="mt-4" style={{ maxWidth: 720 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">내가 찜한 상품</h4>
        <Button variant="outline-danger" size="sm" onClick={removeAllFromWishlist}>
          전체 해제
        </Button>
      </div>

      {isLoading ? (
        <div>불러오는 중...</div>
      ) : wishedProducts.length === 0 ? (
        <div>찜한 상품이 없습니다.</div>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {wishedProducts.map((product) => (
            <li
              key={product.id}
              className="d-flex align-items-center mb-3 p-2 border rounded"
              style={{ cursor: "pointer", backgroundColor: "#fff" }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <img
                src={product.mainImage ? `${API_BASE_URL}/images${product.mainImage.replace(/^.*[\\/](category.*)/, '/$1')}` : ""}
                alt={product.name}
                style={{
                  width: 100,
                  height: 90,
                  objectFit: "contain",
                  borderRadius: 8,
                  marginRight: 16,
                  marginLeft: 16,
                }}
              />
              <div className="flex-grow-1">
                <div className="fw-bold" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "350px", marginBottom: 4 }}>
                  {product.name}
                </div>
                <div className="text-muted" style={{ marginBottom: 2 }}>
                  {product.brand}
                </div>
                <div className="text-muted">
                  ⭐ {Number(product.averageRating).toFixed(1)} ({product.reviewCount})
                </div>
              </div>
              <div className="text-end" style={{ minWidth: 150, marginRight:"30px" }}>
                <div className="text-primary" style={{ fontSize: "1.05rem" }}>
                  최대 월 {((product.monthlyPrice ?? calcMonthlyPrice(6, Number(product.price) || 0))).toLocaleString()}원
                </div>
                <div className="mt-1" style={{ fontSize: "0.9rem" }}>x 6년 (72개월)</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}