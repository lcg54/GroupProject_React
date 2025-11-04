import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row, Table, Spinner, Alert, Modal, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { FILTER_OPTIONS } from "../02.product/ProductListFilter";

export default function SalesPage({ user }) {
  const navigate = useNavigate();

  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 필터 상태
  const [viewMode, setViewMode] = useState("calendar"); // calendar, table
  const [summaryPeriod, setSummaryPeriod] = useState("month"); // 기본값을 month로 변경
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [rentalPeriod, setRentalPeriod] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 상세 검색
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAdvancedSearchActive, setIsAdvancedSearchActive] = useState(false);
  const [searchDateRange, setSearchDateRange] = useState(null); // 검색 날짜 범위 저장

  // 상세보기 모달
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDayOrders, setSelectedDayOrders] = useState([]);

  // 정렬 상태 추가
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    if (!showAdvanced && !isAdvancedSearchActive) {
      fetchSalesData();
    }
  }, [summaryPeriod, selectedDate, selectedCategory, rentalPeriod, showAdvanced]);

  // selectedDate가 변경될 때 상세 검색 모드에서 해당 월의 데이터 가져오기
  useEffect(() => {
    if (isAdvancedSearchActive && searchDateRange) {
      fetchMonthDataForAdvancedSearch();
    }
  }, [selectedDate]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE_URL}/api/sales/calendar`;
      const params = new URLSearchParams();

      if (summaryPeriod === "today") {
        params.append("date", formatDateForAPI(new Date()));
      } else if (summaryPeriod === "week") {
        const { start, end } = getWeekRange(new Date());
        params.append("startDate", formatDateForAPI(start));
        params.append("endDate", formatDateForAPI(end));
      } else if (summaryPeriod === "month") {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        params.append("year", year);
        params.append("month", month);
      }

      if (selectedCategory) params.append("category", selectedCategory);
      if (rentalPeriod) params.append("rentalPeriod", rentalPeriod);

      const res = await fetch(`${url}?${params}`);
      if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");

      const data = await res.json();
      setSalesData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 상세 검색 모드에서 현재 달력 월의 데이터 가져오기
  const fetchMonthDataForAdvancedSearch = async () => {
    if (!searchDateRange) return;

    try {
      setLoading(true);
      setError(null);

      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;

      const params = new URLSearchParams();
      params.append("year", year);
      params.append("month", month);
      if (selectedCategory) params.append("category", selectedCategory);
      if (rentalPeriod) params.append("rentalPeriod", rentalPeriod);

      const res = await fetch(`${API_BASE_URL}/api/sales/calendar?${params}`);
      if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");

      const data = await res.json();

      // 검색 날짜 범위 내의 데이터만 필터링 (날짜 문자열 비교)
      const startDateStr = formatDateForAPI(searchDateRange.start);
      const endDateStr = formatDateForAPI(searchDateRange.end);

      const filteredData = data.filter(sale => {
        return sale.date >= startDateStr && sale.date <= endDateStr;
      });

      setSalesData(filteredData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvancedSearch = async () => {
    if (!startDate || !endDate) {
      alert("시작일과 종료일을 선택해주세요.");
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      alert("시작일이 종료일보다 늦을 수 없습니다.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 시작일 월의 데이터 가져오기
      const year = start.getFullYear();
      const month = start.getMonth() + 1;

      const params = new URLSearchParams();
      params.append("year", year);
      params.append("month", month);
      if (selectedCategory) params.append("category", selectedCategory);
      if (rentalPeriod) params.append("rentalPeriod", rentalPeriod);

      const res = await fetch(`${API_BASE_URL}/api/sales/calendar?${params}`);
      if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");

      const data = await res.json();

      // 검색 날짜 범위 내의 데이터만 필터링
      const startDateStr = formatDateForAPI(start);
      const endDateStr = formatDateForAPI(end);

      const filteredData = data.filter(sale => {
        return sale.date >= startDateStr && sale.date <= endDateStr;
      });

      setSalesData(filteredData);

      setTimeout(() => {
        setIsAdvancedSearchActive(true);
        setSearchDateRange({ start, end });
        setSummaryPeriod("");
        setSelectedDate(new Date(start));
      }, 0);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDayDetails = async (date) => {
    try {
      const params = new URLSearchParams();
      params.append("date", date);
      if (selectedCategory) params.append("category", selectedCategory);
      if (rentalPeriod) params.append("rentalPeriod", rentalPeriod);

      const res = await fetch(`${API_BASE_URL}/api/sales/details?${params}`);
      if (!res.ok) throw new Error("상세 내역을 불러오는데 실패했습니다.");

      const data = await res.json();
      setSelectedDayOrders(data);
      setShowDetailModal(true);
    } catch (err) {
      console.error(err);
      alert("상세 내역을 불러오는데 실패했습니다.");
    }
  };

  const resetFilters = () => {
    setSelectedCategory("");
    setRentalPeriod("");
    setStartDate("");
    setEndDate("");
    setShowAdvanced(false);
    setIsAdvancedSearchActive(false);
    setSearchDateRange(null);
    setSummaryPeriod("month");
    setSelectedDate(new Date());
    setSortConfig({ key: null, direction: 'asc' });
  };

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekRange = (date) => {
    const day = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  // 정렬 핸들러 추가
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 정렬된 데이터 생성
  const getSortedSalesData = () => {
    if (!sortConfig.key) return salesData;

    const sorted = [...salesData].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortConfig.key === 'totalSales') {
        return sortConfig.direction === 'asc'
          ? a.totalSales - b.totalSales
          : b.totalSales - a.totalSales;
      }
      return 0;
    });

    return sorted;
  };

const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const weeks = [];
    let days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<td key={`empty-${i}`} style={{ background: '#f5f5f5' }}></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = formatDateForAPI(currentDate);
      const daySales = salesData.find(s => s.date === dateStr);

      // 상세 검색 모드일 때 검색 범위 외의 날짜는 회색 처리
      let isInSearchRange = true;
      if (isAdvancedSearchActive && searchDateRange) {
        isInSearchRange = currentDate >= searchDateRange.start && currentDate <= searchDateRange.end;
      }

      days.push(
        <td
          key={day}
          style={{
            border: '1px solid #ddd',
            padding: '8px',
            verticalAlign: 'top',
            height: '120px', // 고정 높이
            width: '14.28%', // 7개 칸 균등 분배
            cursor: daySales && isInSearchRange ? 'pointer' : 'default',
            background: !isInSearchRange ? '#f5f5f5' : (daySales ? '#e3f2fd' : '#fff'),
            opacity: !isInSearchRange ? 0.5 : 1,
            overflow: 'hidden', // 내용이 넘치면 숨김
            position: 'relative'
          }}
          onClick={() => {
            if (daySales && isInSearchRange) {
              fetchDayDetails(dateStr);
            }
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{day}</div>
          {daySales && isInSearchRange && (
            <div style={{
              fontSize: '0.75rem', // 글자 크기 약간 축소
              lineHeight: '1.3' // 줄 간격 조정
            }}>
              <div style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                주문: {daySales.orderCount}건
              </div>
              <div style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                상품: {daySales.productCount}개
              </div>
              <div style={{
                color: '#1976d2',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {(daySales.totalSales / 10000).toFixed(0)}만원
              </div>
            </div>
          )}
        </td>
      );

      if (days.length === 7) {
        weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
        days = [];
      }
    }

    if (days.length > 0) {
      while (days.length < 7) {
        days.push(<td key={`empty-end-${days.length}`} style={{ background: '#f5f5f5' }}></td>);
      }
      weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
    }

    return weeks;
  };

  const getTotalSales = () => {
    return salesData.reduce((acc, cur) => ({
      orderCount: acc.orderCount + (cur.orderCount || 0),
      productCount: acc.productCount + (cur.productCount || 0),
      totalSales: acc.totalSales + (cur.totalSales || 0)
    }), { orderCount: 0, productCount: 0, totalSales: 0 });
  };

  const changeMonth = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);

    // 상세 검색 모드일 때 검색 범위를 벗어나지 않도록 제한
    if (isAdvancedSearchActive && searchDateRange) {
      const searchStartMonth = new Date(searchDateRange.start.getFullYear(), searchDateRange.start.getMonth(), 1);
      const searchEndMonth = new Date(searchDateRange.end.getFullYear(), searchDateRange.end.getMonth(), 1);

      if (newDate < searchStartMonth || newDate > searchEndMonth) {
        alert('검색 범위를 벗어났습니다.');
        return;
      }
    }

    setSelectedDate(newDate);
  };

  const totals = getTotalSales();
  const sortedSalesData = getSortedSalesData();

  return (
    <Container className="mt-4">
      <h2 className="mb-4">📊 판매 내역</h2>

      {/* 매출 요약 */}
      <Card className="mb-4 p-3 bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>매출 요약</h5>
          <div>
            <Button
              variant={summaryPeriod === "today" ? "primary" : "outline-primary"}
              size="sm"
              className="me-2"
              onClick={() => {
                setSummaryPeriod("today");
                setIsAdvancedSearchActive(false);
                setSearchDateRange(null);
              }}
            >
              오늘
            </Button>
            <Button
              variant={summaryPeriod === "week" ? "primary" : "outline-primary"}
              size="sm"
              className="me-2"
              onClick={() => {
                setSummaryPeriod("week");
                setIsAdvancedSearchActive(false);
                setSearchDateRange(null);
              }}
            >
              일주일
            </Button>
            <Button
              variant={summaryPeriod === "month" ? "primary" : "outline-primary"}
              size="sm"
              onClick={() => {
                setSummaryPeriod("month");
                setIsAdvancedSearchActive(false);
                setSearchDateRange(null);
              }}
            >
              한 달
            </Button>
          </div>
        </div>
        <Row className="text-center">
          <Col md={4}>
            <h5>주문 건수</h5>
            <h3 className="text-primary">{totals.orderCount}건</h3>
          </Col>
          <Col md={4}>
            <h5>판매 상품</h5>
            <h3 className="text-success">{totals.productCount}개</h3>
          </Col>
          <Col md={4}>
            <h5>총 매출</h5>
            <h3 className="text-danger">{totals.totalSales.toLocaleString()}원</h3>
          </Col>
        </Row>
      </Card>

      {/* 상세 검색 안내 */}
      {/* {isAdvancedSearchActive && searchDateRange && (
        <Alert variant="info" className="mb-3">
          📅 검색 기간: {formatDateForAPI(searchDateRange.start)} ~ {formatDateForAPI(searchDateRange.end)}
          <span className="ms-3">| 현재 보는 달: {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월</span>
        </Alert>
      )} */}

      {/* 필터 */}
      <Card className="mb-3 p-3">
        <Row className="mb-3">
          <Col md={3}>
            <Form.Label>보기 모드</Form.Label>
            <Form.Select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <option value="calendar">달력으로 보기</option>
              <option value="table">표로 보기</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>카테고리</Form.Label>
            <Form.Select value={selectedCategory ?? ""} onChange={(e) => setSelectedCategory(e.target.value)}>
              {FILTER_OPTIONS.category.map(cat => (
                <option key={cat.value ?? "all"} value={cat.value ?? ""}>{cat.label}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>대여 기간</Form.Label>
            <Form.Select value={rentalPeriod} onChange={(e) => setRentalPeriod(e.target.value)}>
              <option value="">전체</option>
              {[3, 4, 5, 6].map(period => (
                <option key={period} value={period}>{period}년</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button variant="outline-primary" onClick={() => setShowAdvanced(!showAdvanced)} className="w-100">
              {showAdvanced ? "간단 검색" : "상세 검색"}
            </Button>
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <Button variant="outline-secondary" onClick={resetFilters} className="w-100">
              🔄 조건 초기화
            </Button>
          </Col>
        </Row>

        {showAdvanced && (
          <Row className="mt-3 p-3 border-top">
            <Col md={4}>
              <Form.Label>시작일</Form.Label>
              <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Label>종료일</Form.Label>
              <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="primary" onClick={fetchAdvancedSearch} className="w-100">
                검색
              </Button>
            </Col>
          </Row>
        )}
      </Card>

      {loading && (
        <div className="text-center p-5">
          <Spinner animation="border" />
          <p className="mt-2">데이터를 불러오는 중...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          {error}
          <Button variant="link" onClick={isAdvancedSearchActive ? fetchMonthDataForAdvancedSearch : fetchSalesData}>다시 시도</Button>
        </Alert>
      )}

      {!loading && !error && viewMode === "calendar" && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(-1)}>
              ◀ 이전 달
            </Button>
            <h4>{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월</h4>
            <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(1)}>
              다음 달 ▶
            </Button>
          </Card.Header>
          <Card.Body>
            <Table bordered>
              <thead>
                <tr>
                  {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                    <th key={day} style={{ textAlign: 'center', background: '#f5f5f5' }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderCalendar()}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {!loading && !error && viewMode === "table" && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(-1)}>
              ◀ 이전 달
            </Button>
            <h5>{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 판매 내역</h5>
            <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(1)}>
              다음 달 ▶
            </Button>
          </Card.Header>
          <Card.Body>
            {salesData.length === 0 ? (
              <Alert variant="info">해당 기간의 판매 내역이 없습니다.</Alert>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('date')}
                    >
                      날짜
                      {sortConfig.key === 'date' && (
                        sortConfig.direction === 'asc' ? ' ▲' : ' ▼'
                      )}
                    </th>
                    <th>주문 건수</th>
                    <th>판매 상품</th>
                    <th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('totalSales')}
                    >
                      총 매출
                      {sortConfig.key === 'totalSales' && (
                        sortConfig.direction === 'asc' ? ' ▲' : ' ▼'
                      )}
                    </th>
                    <th>상세보기</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSalesData.map((sale, idx) => (
                    <tr key={idx}>
                      <td>{sale.date}</td>
                      <td>{sale.orderCount}건</td>
                      <td>{sale.productCount}개</td>
                      <td className="fw-bold">{sale.totalSales.toLocaleString()}원</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => fetchDayDetails(sale.date)}
                        >
                          보기
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* 상세보기 모달 */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>📦 주문 상세 내역</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {selectedDayOrders.length === 0 ? (
            <Alert variant="info">주문 내역이 없습니다.</Alert>
          ) : (
            selectedDayOrders.map((rental, idx) => (
              <Card key={idx} className="mb-3">
                <Card.Header className="bg-light">
                  <strong>주문번호:</strong> #{rental.id} |
                  <strong className="ms-3">주문일:</strong> {rental.createdAt} |
                  <Badge bg="primary" className="ms-2">{rental.status}</Badge>
                </Card.Header>
                <Card.Body>
                  {rental.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="mb-3 pb-3" style={{ borderBottom: itemIdx < rental.items.length - 1 ? '1px solid #dee2e6' : 'none' }}>
                      <Row>
                        <Col md={6}>
                          <h6>{item.productName}</h6>
                          <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                            수량: {item.quantity}개 | 월 {item.pricePerUnit.toLocaleString()}원 × {item.rentalPeriodYears}년
                          </p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                            📅 대여 기간: {item.rentalStart} ~ {item.rentalEnd}
                          </p>
                        </Col>
                        <Col md={6} className="text-end">
                          <h5 className="text-primary">{item.itemTotalPrice.toLocaleString()}원</h5>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-top">
                    <Row>
                      <Col md={6}>
                        <h5>총 결제금액</h5>
                      </Col>
                      <Col md={6} className="text-end">
                        <h5 className="text-success">{rental.totalPrice.toLocaleString()}원</h5>
                      </Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}