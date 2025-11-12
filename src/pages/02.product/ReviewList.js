import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Container, Card, Spinner, ProgressBar, Dropdown, DropdownButton, Button } from "react-bootstrap";
import { API_BASE_URL } from "../../config/url.js";
import { maskName } from "../../util/form.js"
import { renderStars } from "../../util/form.js";
import RenderPagination from "../RenderPagination.js";
import axios from "axios";

export default function ReviewList() {
  const { user } = useOutletContext();
  const { id } = useParams(); // 상품 ID
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const [totalElements, setTotalElements] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState([0, 0, 0, 0, 0]);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, [currentPage, sortOrder]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/review/list`, {
        params: {
          productId: id,
          ...(user?.id ? { memberId: user.id } : {}),
          page: currentPage - 1,
          size: pageSize,
          sortOrder,
        },
      });
      const data = res.data;
      setReviews(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      if (data.averageRating !== undefined) setAverageRating(data.averageRating);
      if (data.ratingCounts !== undefined) setRatingCounts(data.ratingCounts);

    } catch (err) {
      console.error("리뷰 불러오기 실패:", err);
      alert("리뷰를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 좋아요
  const handleRecommend = async (reviewId) => {
    if (!user) { alert("로그인 후 이용 가능합니다."); return; }
    try {
      const res = await axios.post(`${API_BASE_URL}/review/recommend`, {
        reviewId,
        memberId: user?.id,
      });

      const { recommend, recommended } = res.data;

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, recommend, recommended } : r
        )
      );
    } catch (err) {
      console.error("추천 처리 실패:", err);
      alert("추천을 처리하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container style={{ maxWidth: "800px" }}>
      <div className="mb-3 text-center" >
        <Card>
          <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
            <div style={{ fontSize: "1.5rem", width: "50%", textAlign: "center" }}>
              평점
              <p style={{ margin: "0.5rem 0" }}>
                <span style={{ fontSize: "1.5rem", display: "inline-block" }}>
                  {renderStars(averageRating)}
                </span>
                <span className="text-muted" style={{ fontSize: "1.3rem" }}>
                  &nbsp;({averageRating.toFixed(1)})
                </span>
              </p>
            </div>

            <div style={{ width: "50%", textAlign: "center" }}>
              {/* ProgressBar */}
              <div className="m-2">
                {(() => {
                  const maxCount = Math.max(...ratingCounts, 1);
                  const ratingLabels = ["나쁨", "별로", "보통", "좋음", "최고"];
                  return [5, 4, 3, 2, 1].map((level) => {
                    const count = ratingCounts[level - 1];
                    const percent = (count / maxCount) * 100;
                    const label = ratingLabels[level - 1];
                    return (
                      <div
                        key={level}
                        className="d-flex align-items-center"
                        style={{ gap: "10px", marginBottom: "6px" }}
                      >
                        <span style={{ width: "50px", textAlign: "right" }}>{label}</span>
                        <ProgressBar
                          now={percent}
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
        <span>전체 {totalElements}</span>
        <div className="d-flex gap-2">
          <DropdownButton title="정렬">
            <Dropdown.Item onClick={() => { setSortOrder("recommend"); setCurrentPage(1) }}>추천순</Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortOrder("latest"); setCurrentPage(1) }}>최신순</Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortOrder("oldest"); setCurrentPage(1) }}>오래된순</Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortOrder("high"); setCurrentPage(1) }}>평점높은순</Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortOrder("low"); setCurrentPage(1) }}>평점낮은순</Dropdown.Item>
          </DropdownButton>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/product/review/write`, { state: { productId: id } })}>리뷰 작성</Button>
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
                {renderStars(review.rating)}
                <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                  &nbsp;({review.rating.toFixed(1)})
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
                    <img key={idx} src={`${API_BASE_URL}/images/${url}`} alt={`리뷰 이미지 ${idx + 1}`} style={{ width: "100px", borderRadius: "8px" }} />
                  ))}
                </div>
              )}

              <Button
                className="mt-1"
                size="sm"
                variant={review.recommended ? "primary" : "outline-primary"}
                onClick={() => handleRecommend(review.id)}
              >
                추천 {review.recommend} 👍
              </Button>
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