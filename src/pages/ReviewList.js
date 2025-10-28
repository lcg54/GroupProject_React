import { Container, Card, Pagination, Spinner, ProgressBar, Dropdown, DropdownButton } from "react-bootstrap";
import { StarFill, StarHalf, Star } from "react-bootstrap-icons";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/url";
import axios from "axios";

export default function ReviewList({ user }) {
  
  const navigate = useNavigate();

  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); // 1 기반
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState([0, 0, 0, 0, 0]);


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

      // 평점 전체 평균값 들어가야 함
      if (data.averageRating !== undefined) setAverageRating(data.averageRating);
      if (data.ratingCounts !== undefined) setRatingCounts(data.ratingCounts);

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
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push(<StarFill key={`full-${i}`} color="#FFD700" />);
      else if (rating >= i - 0.5) stars.push(<StarHalf key={`half-${i}`} color="#FFD700" />);
      else stars.push(<Star key={`empty-${i}`} color="#ccc" />);
    }
    console.log(typeof rating, rating);
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

  const maskName = (name) => {
    if (!name) return "";
    if (name.length === 1) return name;
    return name[0] + "*".repeat(name.length - 1);
  };

  const handleRecommend = async (reviewId) => {
    try {
      await axios.post(`${API_BASE_URL}/review/recommend`, { reviewId });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, recommend: (r.recommend || 0) + 1 } : r
        )
      );
    } catch (err) {
      console.error("실패:", err);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <Container style={{ maxWidth: "800px" }}>
      <h2 className="mb-3 text-center">상품후기</h2>

      <div className="text-end mb-3">
        <button onClick={() => navigate(`/review/write`)}>후기 작성</button>
      </div>

      <div className="mb-3 text-center" >
        <Card>
          <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
            <div style={{ fontSize: "1.5rem", width: "50%", textAlign: "center" }}>
              평점
              <p style={{ margin: "0.5rem 0" }}>
                <span style={{ fontSize: "1.5rem", display: "inline-block" }}>
                  {renderStars(averageRating)}
                </span>{" "}
                <span className="text-muted" style={{ fontSize: "1.3rem" }}>
                  ({averageRating.toFixed(1)})
                </span>
              </p>
            </div>

            <div style={{ width: "50%", textAlign: "center" }}>
              {/* ProgressBar */}
              <div className="m-2">
                {(() => {
                  const maxCount = Math.max(...ratingCounts, 1); // 0 나눗셈 방지
                  return [5, 4, 3, 2, 1].map((level) => {
                    const count = ratingCounts[level - 1];
                    const percent = (count / maxCount) * 100; // 상대 비율
                    return (
                      <div
                        key={level}
                        className="d-flex align-items-center"
                        style={{ gap: "10px", marginBottom: "6px" }}
                      >
                        <span style={{ width: "50px", textAlign: "right" }}>{level}점</span>
                        <ProgressBar
                          now={percent}
                          variant="secondary"
                          style={{ flex: 1, height: "15px" }}
                        />
                        <span style={{ width: "50px", textAlign: "left" }}>{count}개</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span>전체 {reviews.length}</span>
        <DropdownButton title="정렬">
          <Dropdown.Item onClick={() => { setSortOrder("recommend"); setCurrentPage(1) }}>추천순</Dropdown.Item>
          <Dropdown.Item onClick={() => { setSortOrder("latest"); setCurrentPage(1) }}>최신순</Dropdown.Item>
          <Dropdown.Item onClick={() => { setSortOrder("oldest"); setCurrentPage(1) }}>오래된순</Dropdown.Item>
          <Dropdown.Item onClick={() => { setSortOrder("high"); setCurrentPage(1) }}>평점높은순</Dropdown.Item>
          <Dropdown.Item onClick={() => { setSortOrder("low"); setCurrentPage(1) }}>평점낮은순</Dropdown.Item>
        </DropdownButton>
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
                <span>{maskName(review.memberName)}</span>
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

              <div className="mt-1">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handleRecommend(review.id)}>
                  추천 👍
                </button>
                {review.recommend > 0 && (
                  <span className="ms-2">{review.recommend}</span>
                )}
              </div>
            </Card.Body>
          </Card>
        ))
      )}

      <RenderPagination />
    </Container>
  );
}