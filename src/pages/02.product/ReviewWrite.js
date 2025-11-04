import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import axios from "axios";
import { FaBrain, FaCamera, FaComment, FaLightbulb, FaRegCommentDots, FaStar } from "react-icons/fa";
import { MdNote, MdNoteAlt, MdOutlineStickyNote2, MdRateReview } from "react-icons/md";

export default function ReviewWrite({ user }) {

  const [purchases, setPurchases] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hover, setHover] = useState(0); // 마우스 올렸을 때 임시 표시

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [reviewId, setReviewId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/member/login");
      return;
    }

    const editingReviewId = Number(location.state?.reviewId); // 마이페이지(리뷰내역)에서 리뷰 수정 버튼으로 넘어온 리뷰ID
    const productId = Number(location.state?.productId); // 마이페이지(주문내역) 또는 상품페이지에서 리뷰 작성 버튼으로 넘어온 상품ID

    const fetchData = async () => {
      try {
        let items = [];

        // 1. 마이페이지(리뷰내역)에서 리뷰 수정 버튼으로 넘어온 경우
        if (editingReviewId) {
          // 1-1. 기존 리뷰 내용 불러오기
          const res = await axios.get(`${API_BASE_URL}/review/${editingReviewId}`);
          const r = res.data;
          setIsEditing(true);
          setReviewId(editingReviewId);
          setRating(r.rating);
          setTitle(r.title);
          setContent(r.content);
          setSelectedProduct(r.rentalItemId);
          items = [{
            itemId: r.rentalItemId,
            productName: r.productName,
            brand: r.brand,
            mainImage: r.mainImage,
            rentalPeriodYears: r.rentalPeriodYears,
          }];
        }

        // 2. 마이페이지(주문내역) 또는 상품페이지에서 리뷰 작성 버튼으로 넘어온 경우
        else if (productId) {
          // 2-1️. 대여 상품 목록 불러오기
          const res = await axios.get(`${API_BASE_URL}/rental/member/${user.id}`);
          const allItems = res.data.flatMap(rental =>
            rental.items.map(item => ({
              rentalId: rental.id,
              itemId: item.itemId,
              productId: item.productId,
              productName: item.productName,
              mainImage: item.mainImage,
              rentalPeriodYears: item.rentalPeriodYears,
              status: item.status,
            }))
          );

          // 2-2. 대여 상품 목록에 해당 상품이 있는지 확인
          const matchedItem = allItems.find(i => i.productId === productId);

          if (!matchedItem) {
            alert("해당 상품을 대여한 기록이 없습니다.");
            navigate(`/product/${productId}`);
            return;
          }

          // 2-3. 대여 내역이 있다면, 이미 리뷰가 있는지 확인
          try {
            const res = await axios.get(`${API_BASE_URL}/review/member/${user.id}/product/${productId}`);
            if (res.data) {
              if (window.confirm("이미 리뷰가 존재합니다. 수정하시겠습니까?")) { // 리뷰가 있다면 수정으로 이동 가능
                navigate("/review/write", { state: { reviewId: res.data.id } });
              } else {
                navigate("/mypage/review/list");
              }
              return;
            }
          } catch (err) {
            // 리뷰가 없으면 404로 떨어질 수 있으니 무시
          }

          // 2-4. 리뷰가 없으면 해당 상품만 표시
          items = [matchedItem];
        }

        // 3. 마이페이지(리뷰내역)에서 리뷰 작성 버튼으로 넘어온 경우
        else {
          // 3-1. 리뷰 내역이 없는 대여 상품 목록 불러오기
          const res = await axios.get(`${API_BASE_URL}/rental/member/${user.id}/unreviewed`);
          items = res.data.flatMap(rental =>
            rental.items.map(item => ({
              rentalId: rental.id,
              itemId: item.itemId,
              productId: item.productId,
              productName: item.productName,
              mainImage: item.mainImage,
              rentalPeriodYears: item.rentalPeriodYears,
              status: item.status,
            }))
          );

          if (items.length === 0) {
            alert("리뷰할 내역이 없습니다.");
            navigate("/mypage/review/list");
            return;
          }
        }

        setPurchases(items);

      } catch (err) {
        console.error("대여 내역 조회 실패:", err);
        alert("대여 내역을 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchData();
  }, [user, navigate, location.state]);


  const validateForm = () => {
    if (!selectedProduct) return "제품을 선택하세요.";
    if (!rating) return "평점을 선택하세요.";
    if (!title.trim()) return "제목을 입력하세요.";
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
      const data = {
        rentalItemId: selectedProduct,
        memberId: user.id,
        rating,
        title,
        content,
        images: file ? [file.name] : []
      };

      if (isEditing) {
        await axios.put(`${API_BASE_URL}/review/update/${reviewId}`, data, {
          withCredentials: true,
        });
        alert("리뷰가 수정되었습니다!");
      } else {
        await axios.post(`${API_BASE_URL}/review/create`, data, {
          withCredentials: true,
        });
        alert("리뷰가 등록되었습니다!");
      }
      navigate(`/mypage/review/list`);
    } catch (error) {
      setError("리뷰 등록 중 오류가 발생했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  }


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
                    key={p.itemId}
                    onClick={() => setSelectedProduct(p.itemId)}
                    style={{
                      cursor: "pointer",
                      border:
                        selectedProduct === p.itemId
                          ? "2px solid #007bff"
                          : "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "10px",
                      width: "180px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      transition: "0.2s",
                      backgroundColor:
                        selectedProduct === p.itemId ? "#eaf3ff" : "#fff",
                    }}
                  >
                    <img
                      src={`${API_BASE_URL}/images/${p.mainImage}`}
                      alt={p.productName}
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
                        <strong>제품:</strong> {p.productName}
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
            <Form.Group className="mb-4">
              <Form.Label>
                <MdNoteAlt style={{ marginRight: "5px" }} />
                한줄평 (필수)
              </Form.Label>
              <Form.Control
                type="text"
                maxLength={50}
                placeholder="평가를 남겨주세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  padding: "10px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              />
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
                {loading ? (isEditing ? "⏳ 수정 중..." : "⏳ 등록 중...") : isEditing ? "수정" : "제출"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}