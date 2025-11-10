import { useEffect, useState } from "react";
import {
  Button, Card, Col, Container, Form, Row, Table, Spinner, Alert, Modal, Badge
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { FILTER_OPTIONS } from "../02.product/ProductListFilter";

export default function SalesPage({ user }) {
  const navigate = useNavigate();

  // 권한 체크
  useEffect(() => {
    // user가 아직 로드되지 않았으면 대기
    if (user === null) return;

    if (!user || user.role !== 'ADMIN') {
      alert('관리자만 접근 가능한 페이지입니다.');
      navigate('/', { replace: true });
    }
  }, [user, navigate]);


  // state
  const [salesData, setSalesData] = useState([]); // 현재 조회중인 달(또는 범위)의 "월납입" 일별 요약
  const [allMonthsData, setAllMonthsData] = useState([]); // 연간 전체(월납입) 원본 (총합 계산용)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState("calendar"); // calendar | table
  const [summaryPeriod, setSummaryPeriod] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [rentalPeriod, setRentalPeriod] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAdvancedSearchActive, setIsAdvancedSearchActive] = useState(false);
  const [searchDateRange, setSearchDateRange] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDayOrders, setSelectedDayOrders] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // format helper
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


  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/api/sales/calendar`;
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

      setSalesData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchAllMonthsData = async () => {
    try {
      const year = new Date().getFullYear();
      let all = [];

      for (let m = 1; m <= 12; m++) {
        const params = new URLSearchParams();
        params.append("year", year);
        params.append("month", m);
        if (selectedCategory) params.append("category", selectedCategory);
        if (rentalPeriod) params.append("rentalPeriod", rentalPeriod);

        try {
          const res = await fetch(`${API_BASE_URL}/api/sales/calendar?${params}`);
          if (res.ok) {
            const monthData = await res.json();
            if (Array.isArray(monthData)) all.push(...monthData);
          } else {
            console.warn(`Failed to load month ${m}:`, res.status);
          }
        } catch (e) {
          console.error(`Error loading month ${m}:`, e);
        }
      }
      setAllMonthsData(all);
    } catch (err) {
      console.error(err);
      setAllMonthsData([]);
    }
  };

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
      const startStr = formatDateForAPI(searchDateRange.start);
      const endStr = formatDateForAPI(searchDateRange.end);
      const filtered = (data || []).filter(s => s.date >= startStr && s.date <= endStr);
      setSalesData(filtered);
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
      setSalesData([]);
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
      const startStr = formatDateForAPI(start);
      const endStr = formatDateForAPI(end);
      const filtered = (data || []).filter(s => s.date >= startStr && s.date <= endStr);
      setSalesData(filtered);

      setIsAdvancedSearchActive(true);
      setSearchDateRange({ start, end });
      setSummaryPeriod("");
      setSelectedDate(new Date(start));
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
      setSalesData([]);
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

      const processed = (data || []).map(r => {
        const items = (r.items || []).map(i => {
          const pricePerUnit = Number(i.pricePerUnit || 0);
          const qty = Number(i.quantity || 0);

          const monthly = (i.itemTotalPrice != null && i.itemTotalPrice > 0) ? Number(i.itemTotalPrice) : pricePerUnit * qty;
          return { ...i, pricePerUnit, quantity: qty, itemTotalPrice: monthly };
        });
        const totalPrice = items.reduce((s, it) => s + (it.itemTotalPrice || 0), 0);
        return { ...r, items, totalPrice };
      });

      setSelectedDayOrders(processed.filter(r => (r.items || []).length > 0));
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

    fetchSalesData();
    fetchAllMonthsData();
  };


  const changeMonth = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };


  const computeYearlyTotals = () => {
    const year = selectedDate.getFullYear();
    const prefix = `${year}-`;
    const inYear = (allMonthsData || []).filter(s => s.date && s.date.startsWith(prefix));
    return inYear.reduce((acc, cur) => ({
      orderCount: acc.orderCount + (cur.orderCount || 0),
      productCount: acc.productCount + (cur.productCount || 0),
      totalSales: acc.totalSales + (cur.totalSales || 0)
    }), { orderCount: 0, productCount: 0, totalSales: 0 });
  };


  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortedSalesData = () => {
    if (!sortConfig.key) return salesData || [];
    const sorted = [...salesData].sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortConfig.key === 'totalSales') {
        return sortConfig.direction === 'asc'
          ? (a.totalSales || 0) - (b.totalSales || 0)
          : (b.totalSales || 0) - (a.totalSales || 0);
      }
      return 0;
    });
    return sorted;
  };


  useEffect(() => {
    fetchAllMonthsData();

    fetchSalesData();

  }, [selectedCategory, rentalPeriod]);


  useEffect(() => {

    if (isAdvancedSearchActive && searchDateRange) {
      fetchMonthDataForAdvancedSearch();
    } else {
      fetchSalesData();
    }

  }, [selectedDate, summaryPeriod, isAdvancedSearchActive, searchDateRange]);


  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const weeks = [];
    let days = [];


    const findSalesForDate = (dateStr) => {
      return (salesData || []).find(s => s.date === dateStr);
    };

    for (let i = 0; i < startDay; i++) {
      days.push(<td key={`empty-start-${i}`} style={{ background: '#f5f5f5' }} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cur = new Date(year, month, d);
      const dateStr = formatDateForAPI(cur);
      const daySales = findSalesForDate(dateStr);

      const isInSearchRange = !isAdvancedSearchActive || !searchDateRange || (cur >= searchDateRange.start && cur <= searchDateRange.end);
      const shouldShow = daySales && isInSearchRange && (daySales.orderCount || daySales.productCount || daySales.totalSales);

      days.push(
        <td key={d}
          style={{
            border: '1px solid #ddd',
            padding: '8px',
            verticalAlign: 'top',
            height: '120px',
            width: '14.28%',
            cursor: shouldShow ? 'pointer' : 'default',
            background: !isInSearchRange ? '#f5f5f5' : (shouldShow ? '#e8f4ff' : '#fff'),
            opacity: !isInSearchRange ? 0.6 : 1,
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={() => shouldShow && fetchDayDetails(dateStr)}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{d}</div>
          {shouldShow && (
            <div style={{ fontSize: '0.8rem', lineHeight: 1.3 }}>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                주문: {daySales.orderCount}건
              </div>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                상품: {daySales.productCount}개
              </div>
              <div style={{ color: '#c62828', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(Number(daySales.totalSales || 0)).toLocaleString()}원
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
        days.push(<td key={`empty-end-${days.length}`} style={{ background: '#f5f5f5' }} />);
      }
      weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
    }

    return weeks;
  };


  const yearlyTotals = computeYearlyTotals();

  const sortedSales = getSortedSalesData();

  return (
    <Container className="mt-4">
      <h2 className="mb-4">📊 판매 내역</h2>

      <Card className="mb-4 p-3 bg-light">
        <div className="mb-2">
          <h5>
            매출 요약
            {!isAdvancedSearchActive && (
              <span className="ms-2 text-muted" style={{ fontSize: '0.9rem' }}>({selectedDate.getFullYear()}년 전체)</span>
            )}
            {isAdvancedSearchActive && searchDateRange && (
              <span className="ms-2 text-muted" style={{ fontSize: '0.9rem' }}>
                ({formatDateForAPI(searchDateRange.start)} ~ {formatDateForAPI(searchDateRange.end)})
              </span>
            )}
          </h5>
        </div>

        <Row className="text-center">
          <Col md={4}>
            <h6>주문 건수</h6>
            <h3 className="text-primary">{yearlyTotals.orderCount}건</h3>
          </Col>
          <Col md={4}>
            <h6>판매 상품</h6>
            <h3 className="text-success">{yearlyTotals.productCount}개</h3>
          </Col>
          <Col md={4}>
            <h6>총 매출</h6>
            <h3 className="text-danger">{yearlyTotals.totalSales.toLocaleString()}원</h3>
          </Col>
        </Row>
      </Card>

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
              {[3, 4, 5, 6].map(p => <option key={p} value={p}>{p}년</option>)}
            </Form.Select>
          </Col>

          <Col md={2} className="d-flex align-items-end">
            <Button variant="outline-primary" onClick={() => setShowAdvanced(!showAdvanced)} className="w-100">
              {showAdvanced ? "간단 검색" : "상세 검색"}
            </Button>
          </Col>

          <Col md={3} className="d-flex align-items-end">
            <Button variant="outline-secondary" onClick={resetFilters} className="w-100">🔄 조건 초기화</Button>
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
              <Button variant="primary" onClick={fetchAdvancedSearch} className="w-100">검색</Button>
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
          {error} <Button variant="link" onClick={() => { isAdvancedSearchActive ? fetchMonthDataForAdvancedSearch() : fetchSalesData(); }}>다시 시도</Button>
        </Alert>
      )}

      {!loading && !error && viewMode === "calendar" && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(-1)}>◀ 이전 달</Button>
            </div>
            <h4>{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월</h4>
            <div>
              <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(1)}>다음 달 ▶</Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Table bordered style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                    <th key={d} style={{ textAlign: 'center', background: '#f5f5f5' }}>{d}</th>
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
            <div><Button variant="outline-secondary" size="sm" onClick={() => changeMonth(-1)}>◀ 이전 달</Button></div>
            <h5>{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 - 월별 결제 내역</h5>
            <div><Button variant="outline-secondary" size="sm" onClick={() => changeMonth(1)}>다음 달 ▶</Button></div>
          </Card.Header>
          <Card.Body>
            {(!salesData || salesData.length === 0) ? (
              <Alert variant="info">해당 기간의 판매 내역이 없습니다.</Alert>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>날짜 {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                    <th>주문 건수</th>
                    <th>판매 상품</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('totalSales')}>월 매출 {sortConfig.key === 'totalSales' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                    <th>상세보기</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const isFilterActive = Boolean(selectedCategory) || Boolean(rentalPeriod);
                    const rows = (sortedSales || []).filter(s => {
                      if (!isFilterActive) return true;
                      // 숨김: 주문/상품/매출 모두 0인 경우
                      return (s.orderCount || 0) > 0 || (s.productCount || 0) > 0 || (s.totalSales || 0) > 0;
                    });

                    if (rows.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5}><Alert variant="info" className="mb-0">선택한 조건에 맞는 판매 내역이 없습니다.</Alert></td>
                        </tr>
                      );
                    }

                    return rows.map((sale, idx) => (
                      <tr key={idx}>
                        <td>{sale.date}</td>
                        <td>{sale.orderCount}건</td>
                        <td>{sale.productCount}개</td>
                        <td className="fw-bold">{(Number(sale.totalSales || 0)).toLocaleString()}원</td>
                        <td><Button size="sm" variant="outline-primary" onClick={() => fetchDayDetails(sale.date)}>결제 상세</Button></td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* 상세 모달 */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>💳 결제 상세</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {selectedDayOrders.length === 0 ? (
            <Alert variant="info">월별 결제 항목이 없습니다.</Alert>
          ) : (
            selectedDayOrders.map((rental, ridx) => (
              <Card key={ridx} className="mb-3">
                <Card.Header className="bg-light">
                  <strong>주문번호:</strong> #{rental.id} |
                  <strong className="ms-3">주문일:</strong> {rental.createdAt} |
                  <Badge bg="primary" className="ms-2">{rental.status ?? ''}</Badge>
                </Card.Header>
                <Card.Body>
                  {rental.items.map((item, idx) => (
                    <div key={idx} className="mb-3 pb-3" style={{ borderBottom: idx < rental.items.length - 1 ? '1px solid #dee2e6' : 'none' }}>
                      <Row>
                        <Col md={6}>
                          <h6>{item.productName}</h6>
                          <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                            수량: {item.quantity}개 | 월 {Number(item.pricePerUnit || 0).toLocaleString()}원
                          </p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                            📅 대여 기간: {item.rentalStart} ~ {item.rentalEnd}
                          </p>
                        </Col>
                        <Col md={6} className="text-end">
                          <h5 className="text-primary">{Number(item.itemTotalPrice || 0).toLocaleString()}원</h5>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>※ 이 금액은 해당 날짜에 결제되는 월납입액입니다.</div>
                        </Col>

                      </Row>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-top">
                    <Row>
                      <Col md={6}><h5>총 월 납부 합계</h5></Col>
                      <Col md={6} className="text-end"><h5 className="text-success">{Number(rental.totalPrice || 0).toLocaleString()}원</h5></Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>닫기</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}