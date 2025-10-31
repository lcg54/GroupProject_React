import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/url";
import axios from "axios";
import { FaBrain, FaCamera, FaComment, FaLightbulb, FaRegCommentDots, FaStar } from "react-icons/fa";
import { MdNote, MdNoteAlt, MdOutlineStickyNote2, MdRateReview } from "react-icons/md";

export default function ReviewWrite({ user }) {

  const location = useLocation();
  const productIdFromState = location.state?.productId;

  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]); // 구매한 제품 목록
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hover, setHover] = useState(0); // 마우스 올렸을 때 임시 표시
  const [allRentals, setAllRentals] = useState([]);
  const { productId } = location.state || {};

  useEffect(() => {
    if (!user) {
      alert("로그인 후 작성 가능합니다.");
      navigate("/member/login");
    }
  }, [user, navigate]);


  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        if (!user || !user.id) return;

        const res = await axios.get(`${API_BASE_URL}/rental/member/${user.id}`, {
          withCredentials: true,
        });

        const allItems = [];

        for (const rental of res.data) {
          for (const item of rental.items) {
            try {
              const productRes = await axios.get(`${API_BASE_URL}/product/${item.productId}`);
              const product = productRes.data;

              allItems.push({
                id: item.itemId,
                productId: item.productId,
                name: item.productName,
                brand: item.brand || product.brand,
                rentalPeriodYears: item.rentalPeriodYears,
                image: product.mainImage,
                reviewed: item.reviewed || false,
              });
            } catch (e) {
              console.error(`❌ 상품 ${item.productId} 정보 불러오기 실패:`, e);
            }
          }
        }


        const unreviewed = allItems.filter(item => !item.reviewed);

        if (productIdFromState) {
          const selected = allItems.find(item => item.productId === Number(productIdFromState));
          if (!selected) {
            alert("해당 상품을 구매한 적이 없습니다.");
            navigate("/mypage");
            return;
          }
          if (selected.reviewed) {
            alert("이미 리뷰가 완료된 상품입니다. 리뷰하지 않은 다른 상품을 선택해주세요.");
            setPurchases(unreviewed);
            return;
          }
          setPurchases([selected]);
          setSelectedProduct(selected);
        } else {
          setPurchases(unreviewed);
        }
      } catch (err) {
        console.error("❌ 구매 목록 불러오기 오류:", err);
        setError("구매 목록을 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchPurchases();
  }, [user, productIdFromState, navigate]);

  const validateForm = () => {

    const product = selectedProduct;

    if (!product) return "제품을 선택하세요.";
    if (!rating) return "평점을 선택하세요.";
    if (!content.trim()) return "리뷰 내용을 입력하세요.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("productId", selectedProduct.productId);
      formData.append("rating", rating);
      formData.append("content", content);
      if (file) formData.append("image", file);

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      };

      await axios.post(`${API_BASE_URL}/review/register`, formData, config);

      alert("리뷰가 등록되었습니다!");
      navigate("/reviews");
    } catch (error) {
      setError("리뷰 등록 중 오류가 발생했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };




  /*
    useEffect(() => {
      const fetchRentals = async () => {
        try {
          if (!user || !user.id) return;
  
          const res = await axios.get(`${API_BASE_URL}/rental/member/${user.id}`, {
            withCredentials: true,
          });
  
          const flattened = res.data.flatMap((rental) =>
            rental.items.map((item) => ({
              id: item.id,
              productId: item.productId,
              name: item.productName,
              brand: item.brand || "미등록",
              rentalPeriodYears: item.rentalPeriodYears,
              image: item.imageUrl || "https://via.placeholder.com/150",
              reviewed: item.reviewed || false,
            }))
          );
  
          setAllRentals(flattened);
  
          const unreviewed = flattened.filter((item) => !item.reviewed);
  
          if (productIdFromState) {
            const selected = flattened.find(item => item.productId === Number(productIdFromState));
  
            if (!selected) {
              alert("해당 상품을 구매한 적이 없습니다.");
              navigate("/"); // 메인페이지 이동
              return;
            }
  
            if (selected.reviewed) {
              alert("이미 리뷰한 상품입니다.");
              navigate("/mypage"); // 메인페이지 이동
              return;
            }
  
            setPurchases([selected]);
            setSelectedProduct(selected.id);
          } else {
            setPurchases(unreviewed);
          }
  
        } catch (err) {
          console.error("❌ 대여 내역 불러오기 오류:", err);
          setError("대여 내역을 불러오는 중 오류가 발생했습니다.");
        }
      };
  
      fetchRentals();
    }, [user, productIdFromState, navigate]);
  */
  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "#f1f1f1ff",
        maxWidth: "1000px",
        minHeight: "1000px"
      }}
    >
      <Card
        style={{
          width: "1000px",
          padding: "30px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          minHeight: "1000px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
        }}
      >
        <Card.Body>
          <h2 className="mb-4">
            <MdOutlineStickyNote2 style={{ marginRight: "8px" }} />
            상품이 마음에 드셨나요?
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* 구매한 제품 선택 (카드 리스트) */}
            <Form.Group className="mb-4">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "15px",
                }}
              >
                {purchases.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    style={{
                      cursor: "pointer",
                      border:
                        selectedProduct?.productId === p.productId
                          ? "2px solid #007bff"
                          : "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "10px",
                      width: "180px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      transition: "0.2s",
                      backgroundColor:
                        selectedProduct?.productId === p.productId ? "#eaf3ff" : "#fff",
                    }}
                  >
                    <img
                      src={`${API_BASE_URL}/images/${p.image}`}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "0.9rem",
                        color: "#555",
                      }}
                    >
                      <div>
                        <strong>회사:</strong> {p.brand}
                      </div>
                      <div>
                        <strong>제품:</strong> {p.name}
                      </div>
                      <div>
                        <strong>대여기간:</strong> {p.rentalPeriodYears}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* 별점 */}
            <Form.Group className="mb-4">
              <Form.Label>
                <FaStar style={{ marginRight: "5px" }} />
                별점
              </Form.Label>
              <div style={{ display: "flex", gap: "5px", cursor: "pointer" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={24}
                    color={
                      (hover || rating) >= star ? "#ffc107" : "#e4e5e9"
                    }
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  />
                ))}
              </div>
            </Form.Group>

            {/* 후기 내용 */}
            <Form.Group className="mb-4">
              <Form.Label>
                <FaRegCommentDots style={{ marginRight: "5px" }} />
                상품이 어땠는지 알려주세요 (필수)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={9}
                maxLength={4000}
                placeholder="상품에 대한 경험을 얘기해주세요! 불건전한 말이나 주제에 맞지 않는 후기는 후에 지워질 수 있습니다."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  padding: "10px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              />
            </Form.Group>

            {/* 리뷰 사진 업로드 */}
            <Form.Group className="mb-4">
              <Form.Label>
                <FaCamera size={20} style={{ marginRight: "5px" }} />
                리뷰 사진
              </Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={{
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  padding: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              />
            </Form.Group>

            {/* 제출 버튼 */}
            <div className="text-end">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                style={{ padding: "10px 30px", borderRadius: "8px" }}
              >
                {loading ? "⏳ 등록 중..." : "제출"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}