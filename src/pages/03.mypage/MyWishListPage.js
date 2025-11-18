import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
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
        productDetails.push({ ...productDetail, selected: false }); // selected 필드 추가
      }
      setWishedProducts(productDetails);
    } catch (error) {
      alert("찜 목록을 불러오지 못했습니다.");
      setWishedProducts([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setWishedProducts(wishedProducts.map(p => ({ ...p, selected: checked })));
  };

  const handleProductSelect = (id) => {
    setWishedProducts(wishedProducts.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const handleDeleteSelected = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/member/login");
      return;
    }

    const selectedProducts = wishedProducts.filter(p => p.selected);
    if (selectedProducts.length === 0) {
      alert("삭제할 상품을 선택해주세요.");
      return;
    }

    const isConfirmed = window.confirm(`${selectedProducts.length}개 상품을 삭제하시겠습니까?`);
    if (!isConfirmed) return;

    try {
      await axios.post(`${API_BASE_URL}/wishlist/delete-selected`, {
        memberId: user.id,
        productIds: selectedProducts.map(p => p.id),
      });

      alert("선택한 상품이 삭제되었습니다.");
      loadMyWishlist();
    } catch (err) {
      console.error(err);
      alert("상품 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: 720 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">내가 찜한 상품</h4>
        <div className="d-flex align-items-center">
          <Form.Check
            type="checkbox"
            id="select-all"
            label="전체 선택"
            checked={wishedProducts.length > 0 && wishedProducts.every(p => p.selected)}
            onChange={handleSelectAll}
            className="me-2"
          />
          <Button
            variant="outline-danger"
            size="sm"
            disabled={wishedProducts.every(p => !p.selected)}
            onClick={handleDeleteSelected}
          >
            선택 삭제
          </Button>
        </div>
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
              style={{ backgroundColor: "#fff" }}
            >
              <Form.Check
                type="checkbox"
                checked={product.selected}
                onChange={() => handleProductSelect(product.id)}
                className="me-2"
              />
              <img
                src={product.mainImage ? `${API_BASE_URL}/images${product.mainImage.replace(/^.*[\\/](category.*)/, '/$1')}` : ""}
                alt={product.name}
                style={{
                  width: 100,
                  height: 90,
                  objectFit: "contain",
                  borderRadius: 8,
                  marginRight: 16,
                }}
                onClick={() => navigate(`/product/${product.id}`)}
              />
              <div className="flex-grow-1" onClick={() => navigate(`/product/${product.id}`)}>
                <div className="fw-bold text-truncate" style={{ maxWidth: "350px", marginBottom: 4 }}>
                  {product.name}
                </div>
                <div className="text-muted" style={{ marginBottom: 2 }}>
                  {product.brand}
                </div>
                <div className="text-muted">
                  ⭐ {Number(product.averageRating).toFixed(1)} ({product.reviewCount})
                </div>
              </div>
              <div className="text-end" style={{ minWidth: 150, marginRight: "30px" }}>
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