import { Container, Card, Pagination, Spinner } from "react-bootstrap";
import { StarFill, StarHalf, Star } from "react-bootstrap-icons";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/url";
import axios from "axios";

export default function ReviewList() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); // 1 기반
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  // 리뷰 불러오기
  useEffect(() => {
    fetchReviews();
  }, [currentPage, sortOrder]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/review/list`, {
        params: {
          productId: id,
          page: currentPage - 1, // 백엔드 Pageable이 0 기반이면
          size: pageSize,
          sortOrder,
        },
      });
      const data = res.data;
      setReviews(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("리뷰 불러오기 실패:", err);
      alert("리뷰를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 별점 렌더링
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    for (let i = 0; i < fullStars; i++) stars.push(<StarFill key={`full-${i}`} color="#FFD700" />);
    if (hasHalfStar) stars.push(<StarHalf key="half" color="#FFD700" />);
    for (let i = stars.length; i < 5; i++) stars.push(<Star key={`empty-${i}`} color="#ccc" />);
    return <span>{stars}</span>;
  };

  // 페이지네이션 컴포넌트
  const RenderPagination = () => {
    const blockSize = 10;
    const currentBlock = Math.floor((currentPage - 1) / blockSize);
    const startPage = currentBlock * blockSize + 1;
    const endPage = Math.min(startPage + blockSize - 1, totalPages);

    const items = [];

    items.push(
      <Pagination.First key="first" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />,
      <Pagination.Prev key="prev" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} />
    );

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
          {page}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next key="next" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} />,
      <Pagination.Last key="last" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
    );

    return <Pagination className="justify-content-center">{items}</Pagination>;
  };

  return (
    <Container style={{ maxWidth: "800px" }}>
      <h2 className="mb-3 text-center">상품후기</h2>

      {/* <div className="text-end mb-3">
        <button>후기 작성</button>
      </div> */}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span>전체 {reviews.length}</span>
        <div>
          <span
            style={{
              cursor: "pointer",
              color: sortOrder === "latest" ? "blue" : "inherit",
              textDecoration: sortOrder === "latest" ? "underline" : "none",
              marginRight: "10px",
            }}
            onClick={() => setCurrentPage(1) || setSortOrder("latest")}
          >
            최신순
          </span>
          <span
            style={{
              cursor: "pointer",
              color: sortOrder === "oldest" ? "blue" : "inherit",
              textDecoration: sortOrder === "oldest" ? "underline" : "none",
            }}
            onClick={() => setCurrentPage(1) || setSortOrder("oldest")}
          >
            오래된순
          </span>
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
              <h5>{review.title}</h5>
              <p>
                평점: {renderStars(review.rating)}{" "}
                <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                  ({review.rating.toFixed(1)})
                </span>
              </p>
              <div className="d-flex justify-content-between text-muted">
                <span>{review.memberName}</span>
                <span>{new Date(review.regDate).toLocaleString()}</span>
              </div>
              <div className="my-2">{review.content}</div>
              {review.imageUrls?.length > 0 && (
                <div className="d-flex gap-2 mt-2">
                  {review.imageUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={`리뷰 이미지 ${idx + 1}`} style={{ width: "100px", borderRadius: "8px" }} />
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        ))
      )}

      <RenderPagination />
    </Container>
  );
}