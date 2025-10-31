import { Container, Card, Spinner, Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/url";
import axios from "axios";
import "./commonness/commonness.css";
import { renderStars } from "../config/form";
import { useNavigate } from "react-router-dom";
import RenderPagination from "./RenderPagination.js";
import { Bag, PencilSquare, Trash } from "react-bootstrap-icons";

export default function MyReviewList({ user }) {
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("recommend");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 3;

  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    fetchReviews();
  }, [currentPage, sortOrder, user]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/review/member`, {
        params: {
          memberId: user.id,
          page: currentPage - 1,
          size: pageSize,
          sortOrder,
        },
      });
      const data = res.data;
      setReviews(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);

    } catch (err) {
      console.error("회원 리뷰 불러오기 실패:", err);
      alert("회원 리뷰를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (reviewId) => {
    
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm("이 리뷰를 정말 삭제하시겠습니까?")) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/review/${reviewId}/delete`, {
        params:{ memberId: user.id }
      });
      alert("리뷰가 삭제되었습니다.");
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setTotalElements((prev) => prev - 1);

    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container style={{ maxWidth: "800px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span>전체 {totalElements}</span>
        <div className="d-flex gap-2">
          <DropdownButton title="정렬">
            <Dropdown.Item onClick={() => { setSortOrder("recommend"); setCurrentPage(1) }}>추천순</Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortOrder("latest"); setCurrentPage(1) }}>최신순</Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortOrder("oldest"); setCurrentPage(1) }}>오래된순</Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortOrder("high"); setCurrentPage(1) }}>평점높은순</Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortOrder("low"); setCurrentPage(1) }}>평점낮은순</Dropdown.Item>
          </DropdownButton>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">리뷰를 불러오는 중입니다...</p>
        </div>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} className="mb-3">
            <Card.Body>
              <h5>{review.productName}</h5>
              <div className="d-flex justify-content-between">
                <p>
                  {renderStars(review.rating)}
                  <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                    &nbsp;({review.rating.toFixed(1)})
                  </span>
                </p>
                <span className="text-muted">{new Date(review.regDate).toLocaleString()}</span>
              </div>
              <span style={{ fontSize: "1.1rem" }}>{review.title}</span>
              <div className="my-2">{review.content}</div>
              {review.imageUrls?.length > 0 && (
                <div className="d-flex gap-2 mt-2">
                  {review.imageUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={`리뷰 이미지 ${idx + 1}`} style={{ width: "100px", borderRadius: "8px" }} />
                  ))}
                </div>
              )}

              <div className="d-flex gap-3 mt-3">
                <Button
                  size="sm"
                  variant="outline-primary"
                  style={{ pointerEvents: "none" }}
                >
                  추천 {review.recommend} 👍
                </Button>
                &nbsp;
                <Button 
                  size="sm" 
                  variant="outline-primary" 
                  onClick={() => navigate(`/product/${review.productId}`)}
                  style={{ flex: 1 }}
                >
                  <Bag size={14} className="me-1" /> 상품페이지로 이동
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-success" 
                  onClick={() => {handleUpdate(review.id)}}
                  style={{ flex: 1 }}
                >
                  <PencilSquare size={14} className="me-1" /> 리뷰 수정
                </Button>
                <Button 
                  type="button"
                  size="sm" 
                  variant="outline-danger" 
                  onClick={() => handleDelete(review.id)}
                  style={{ flex: 1 }}
                >
                  <Trash size={14} className="me-1" /> 리뷰 삭제
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}

      {!loading && totalElements === 0 ? (
        <p className="text-center text-muted">리뷰 내역이 없습니다.</p>
      ) : (
        <RenderPagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
      )}
    </Container>
  );
}