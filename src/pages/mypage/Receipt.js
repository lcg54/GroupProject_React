import { useState, useEffect } from "react";
import { Alert, Card, Col, Container, Row, Spinner, Form, InputGroup, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:9000";

export default function Receipt({ user }) {
    const navigate = useNavigate();

    const [rentals, setRentals] = useState([]);
    const [filteredRentals, setFilteredRentals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 필터 및 정렬 상태
    const [sortOption, setSortOption] = useState("recent"); // recent, oldest, priceHigh, priceLow, returnSoon
    const [searchTerm, setSearchTerm] = useState("");

    // API에서 데이터 가져오기
    useEffect(() => {
        console.log("Receipt 컴포넌트 마운트됨");
        console.log("전달받은 user:", user);

        if (user && user.id) {
            console.log("fetchRentals 호출 예정");
            fetchRentals();
        } else {
            console.warn("user 또는 user.id가 없음:", user);
        }
    }, [user]);

    // 정렬 및 검색 적용
    useEffect(() => {
        applyFilters();
    }, [rentals, sortOption, searchTerm]);

    const fetchRentals = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("=== 대여 내역 조회 시작 ===");
            console.log("사용자 정보:", user);
            console.log("API URL:", `${API_BASE_URL}/api/rental/member/${user.id}`);

            const res = await fetch(`${API_BASE_URL}/api/rental/member/${user.id}`);

            console.log("응답 상태:", res.status);

            if (!res.ok) {
                throw new Error('대여 내역을 불러오는데 실패했습니다.');
            }

            const data = await res.json();
            console.log("조회된 대여 내역:", data);
            console.log("대여 건수:", data.length);

            setRentals(data);
        } catch (err) {
            console.error("에러 발생:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...rentals];

        // 검색어 필터링
        if (searchTerm.trim()) {
            filtered = filtered.filter(rental =>
                rental.items.some(item =>
                    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        switch (sortOption) {
            case "recent": // 최근 임대 시작
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "oldest": // 첫 임대 시작
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "priceHigh": // 가격 높은순
                filtered.sort((a, b) => b.totalPrice - a.totalPrice);
                break;
            case "priceLow": // 가격 낮은순
                filtered.sort((a, b) => a.totalPrice - b.totalPrice);
                break;
            case "returnSoon": // 반납일 임박
                filtered.sort((a, b) => {
                    const aEndDate = new Date(Math.min(...a.items.map(item => new Date(item.rentalEnd))));
                    const bEndDate = new Date(Math.min(...b.items.map(item => new Date(item.rentalEnd))));
                    return aEndDate - bEndDate;
                });
                break;
            default:
                break;
        }

        setFilteredRentals(filtered);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\. /g, '-').replace('.', '');
    };

    const formatPrice = (price) => {
        return price.toLocaleString('ko-KR') + '원';
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'RESERVED': { text: '예약완료', color: 'primary' },
            'RENTING': { text: '대여중', color: 'success' },
            'RETURNED': { text: '반납완료', color: 'secondary' },
            'CANCELLED': { text: '취소됨', color: 'danger' }
        };
        const statusInfo = statusMap[status] || { text: status, color: 'info' };
        return (
            <span className={`badge bg-${statusInfo.color}`} style={{ fontSize: '0.85rem' }}>
                {statusInfo.text}
            </span>
        );
    };

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{user?.name || "000"}님의 결제내역</h2>

            </div>

            {/* 정렬 및 검색 옵션 */}
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        size="sm"
                    >
                        <option value="recent">최근 임대 시작</option>
                        <option value="oldest">첫 임대 시작</option>
                        <option value="returnSoon">반납일 임박</option>
                        <option value="priceHigh">가격 높은순</option>
                        <option value="priceLow">가격 낮은순</option>
                    </Form.Select>
                </Col>
                <Col md={6}>
                    <InputGroup size="sm">
                        <InputGroup.Text>🔍</InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="제품 이름 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <Button
                                variant="outline-secondary"
                                onClick={() => setSearchTerm("")}
                            >
                                ✕
                            </Button>
                        )}
                    </InputGroup>
                </Col>
            </Row>

            {/* 로딩 상태 */}
            {loading && (
                <div className="text-center p-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">로딩 중...</span>
                    </Spinner>
                </div>
            )}

            {/* 에러 상태 */}
            {error && (
                <Alert variant="danger">
                    {error}
                    <Button variant="link" onClick={fetchRentals}>다시 시도</Button>
                </Alert>
            )}

            {!loading && !error && (
                <>
                    {filteredRentals.length === 0 && rentals.length === 0 ? (
                        <Alert variant="secondary">주문 내역이 없습니다.</Alert>
                    ) : filteredRentals.length === 0 ? (
                        <Alert variant="info">검색 결과가 없습니다.</Alert>
                    ) : (
                        <>
                            <Row>
                                {filteredRentals.map((rental) => (
                                    <Col key={rental.id} md={12} className="mb-4">
                                        <Card className="h-100 shadow-sm">
                                            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                                                <span>
                                                    <strong>주문번호:</strong> #{rental.id}
                                                    <span className="ms-3 text-muted" style={{ fontSize: '0.9rem' }}>
                                                        {formatDate(rental.createdAt)}
                                                    </span>
                                                </span>
                                                {getStatusBadge(rental.status)}
                                            </Card.Header>
                                            <Card.Body>
                                                {rental.items.map((item, idx) => (
                                                    <div key={idx} className="mb-3 pb-3" style={{ borderBottom: idx < rental.items.length - 1 ? '1px solid #dee2e6' : 'none' }}>
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div className="flex-grow-1">
                                                                <Card.Title className="h6 mb-2">{item.productName}</Card.Title>
                                                                <Card.Text className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                                                    수량: {item.quantity}개 | 월 {formatPrice(item.pricePerUnit)} × {item.rentalPeriodYears}년
                                                                </Card.Text>
                                                                <Card.Text className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                                                    📅 대여 기간: {formatDate(item.rentalStart)} ~ {formatDate(item.rentalEnd)}
                                                                </Card.Text>
                                                            </div>
                                                            <div className="text-end ms-3 d-flex flex-column align-items-end gap-2">
                                                                <strong className="text-primary">{formatPrice(item.itemTotalPrice)}</strong>
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => navigate(`/product/${item.productId}`)}
                                                                >
                                                                    ✍️ 리뷰 작성
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: '2px solid #dee2e6' }}>
                                                    <h5 className="mb-0">총 결제금액</h5>
                                                    <h5 className="mb-0 text-success">{formatPrice(rental.totalPrice)}</h5>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </>
            )}
        </Container>
    );
}