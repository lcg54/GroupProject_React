import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row, Table, Spinner, Alert, Modal, Badge, ButtonGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/url";
import { FILTER_OPTIONS } from "../02.product/ProductListFilter";

export default function SalesPage({ user }) {
  const [salesData, setSalesData] = useState([]);
  const [allMonthsData, setAllMonthsData] = useState([]);

  const [viewMode, setViewMode] = useState("calendar");
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const userRole = user?.role || storedUser?.role;
    if (userRole !== "ADMIN") {
      alert("관리자만 접근 가능한 페이지입니다.");
      navigate(`/member/login`);
    }
  }, [user]);

  useEffect(() => {
    fetchAllMonthsData();
  }, [searchDateRange, selectedCategory, rentalPeriod]);

  useEffect(() => {
    const shouldFetch = !showAdvanced || (showAdvanced && !startDate && !endDate && !isAdvancedSearchActive);

    if (shouldFetch) {
      fetchSalesData();
    }
  }, [summaryPeriod, selectedDate, selectedCategory, rentalPeriod, showAdvanced, startDate, endDate, isAdvancedSearchActive]);

  useEffect(() => {
    if (isAdvancedSearchActive && searchDateRange) {
      fetchMonthDataForAdvancedSearch();
    }
  }, [isAdvancedSearchActive, searchDateRange, selectedDate]);

  const normalize = (v) => {
    if (v == null) return null;
    try { return String(v).trim().toUpperCase(); } catch { return null; }
  };

  const getCategoryLabelForValue = (value) => {
    if (!value) return null;
    try {
      const found = (FILTER_OPTIONS?.category || []).find(c => String(c.value) === String(value));
      return found ? normalize(found.label) : normalize(value);
    } catch { return normalize(value); }
  };

  const detectItemCategory = (item) => {
    if (!item) return null;
    const cand = [];

    if (item.product && typeof item.product === 'object') {
      const p = item.product;
      if (p.category != null) {

        if (typeof p.category === 'object') {
          if (p.category.name) cand.push(p.category.name);
          if (p.category.label) cand.push(p.category.label);
          if (p.category.code) cand.push(p.category.code);
        } else {
          cand.push(p.category);
        }
      }
      if (p.categoryName) cand.push(p.categoryName);
      if (p.name) cand.push(p.name);
      if (p.type) cand.push(p.type);
    }

    if (item.productCategory != null) cand.push(item.productCategory);
    if (item.productCategoryName != null) cand.push(item.productCategoryName);
    if (item.category != null) cand.push(item.category);
    if (item.categoryName != null) cand.push(item.categoryName);
    if (item.productName) cand.push(item.productName);

    const normalized = Array.from(new Set(cand.map(normalize).filter(Boolean)));
    if (normalized.length === 0) return null;
    return normalized[0];
  };

  // ---------- itemMatchesFilters: 일치, 포함(fuzzy) 등 유연하게 검사 ----------
  const itemMatchesFilters = (item, normalizedCategoryValue, rentalPeriodInt, normalizedCategoryLabel) => {
    const itemCategory = detectItemCategory(item);
    const pn = item.productName ? normalize(item.productName) : null;

    let categoryMatch = true;
    if (normalizedCategoryValue) {
      if (itemCategory) {
        if (itemCategory === normalizedCategoryValue || itemCategory === normalizedCategoryLabel) {
          categoryMatch = true;
        } else if (itemCategory.includes(normalizedCategoryValue) || normalizedCategoryValue.includes(itemCategory)) {
          categoryMatch = true;
        } else if (normalizedCategoryLabel && (itemCategory.includes(normalizedCategoryLabel) || normalizedCategoryLabel.includes(itemCategory))) {
          categoryMatch = true;
        } else {
          if (pn) {
            if (pn.includes(normalizedCategoryValue) || (normalizedCategoryLabel && pn.includes(normalizedCategoryLabel))) {
              categoryMatch = true;
            } else {
              categoryMatch = false;
            }
          } else {
            categoryMatch = false;
          }
        }
      } else {
        if (pn) {
          if (pn.includes(normalizedCategoryValue) || (normalizedCategoryLabel && pn.includes(normalizedCategoryLabel))) {
            categoryMatch = true;
          } else {
            categoryMatch = false;
          }
        } else {
          categoryMatch = false;
        }
      }
    }

    const periodMatch = !rentalPeriodInt || (item.rentalPeriodYears != null && Number(item.rentalPeriodYears) === rentalPeriodInt);

    return categoryMatch && periodMatch;
  };
  // ---------- end helpers ----------

  // ---------- computeDaySummary: 상세에서 하루 요약 재계산 ----------
  const computeDaySummary = async (dateStr) => {
    const params = new URLSearchParams();
    params.append("date", dateStr);
    if (selectedCategory) params.append("category", selectedCategory);
    if (rentalPeriod) params.append("rentalPeriod", rentalPeriod);

    const res = await fetch(`${API_BASE_URL}/api/sales/details?${params}`);
    if (!res.ok) {
      console.error('[computeDaySummary] details fetch failed', res.status);
      throw new Error(`상세(요약 재계산) 불가: ${res.status}`);
    }

    const details = await res.json();

    const normalizedCategoryValue = selectedCategory ? normalize(selectedCategory) : null;
    const normalizedCategoryLabel = selectedCategory ? getCategoryLabelForValue(selectedCategory) : null;
    const rentalPeriodInt = rentalPeriod ? parseInt(rentalPeriod, 10) : null;

    let orderCount = 0;
    let productCount = 0;
    let totalSales = 0;

    details.forEach(rental => {
      const items = rental.items || [];
      let visibleItems = items.filter(it => itemMatchesFilters(it, normalizedCategoryValue, rentalPeriodInt, normalizedCategoryLabel));

      if (visibleItems.length > 0) {
        orderCount += 1;
        visibleItems.forEach(it => {
          const qty = it.quantity != null ? Number(it.quantity) : 0;
          const ppu = it.pricePerUnit != null ? Number(it.pricePerUnit) : 0;
          const yrs = it.rentalPeriodYears != null ? Number(it.rentalPeriodYears) : 1;
          const itemTotal = it.itemTotalPrice != null ? Number(it.itemTotalPrice) : (ppu * qty * yrs * 12);
          productCount += qty;
          totalSales += itemTotal;
        });
      }
    });

    const summary = { date: dateStr, orderCount, productCount, totalSales };
    return summary;
  };

  // ---------- fetchSalesData, fetchAllMonthsData 등 기존 로직(필터시 computeDaySummary 호출) ----------
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
      let finalData = data;
      if (selectedCategory || rentalPeriod) {
        const dates = Array.from(new Set(data.map(d => d.date)));
        finalData = await Promise.all(dates.map(d => computeDaySummary(d)));
      }
      setSalesData(finalData);
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMonthsData = async () => {
    try {
      setLoading(true);
      
      let allData = [];

      // 상세 검색 활성화되어 있으면, 해당 기간의 모든 연도/월 포함
      let yearsToFetch = [];
      if (isAdvancedSearchActive && searchDateRange) {
        const startYear = searchDateRange.start.getFullYear();
        const endYear = searchDateRange.end.getFullYear();
        for (let y = startYear; y <= endYear; y++) {
          yearsToFetch.push(y);
        }
      } else {
        // 기본값: 현재 연도만
        yearsToFetch.push(new Date().getFullYear());
      }

      // 선택된 연도 범위 전체의 월 데이터를 모두 불러오기
      for (const year of yearsToFetch) {
        for (let month = 1; month <= 12; month++) {
          const params = new URLSearchParams();
          params.append("year", year);
          params.append("month", month);
          if (selectedCategory) params.append("category", selectedCategory);
          if (rentalPeriod) params.append("rentalPeriod", rentalPeriod);

          try {
            const res = await fetch(`${API_BASE_URL}/api/sales/calendar?${params}`);
            if (res.ok) {
              const monthData = await res.json();
              allData.push(...monthData);
            } else {
              console.warn(`월(${month}) 데이터 가져오기 실패:`, res.status);
            }
          } catch (err) {
            console.error(`${year}년 ${month}월 데이터 로드 실패:`, err);
          }
        }
      }

      // 상세 검색 범위가 있으면, 해당 범위로 필터링
      if (isAdvancedSearchActive && searchDateRange) {
        const startDateStr = formatDateForAPI(searchDateRange.start);
        const endDateStr = formatDateForAPI(searchDateRange.end);
        allData = allData.filter(sale => sale.date >= startDateStr && sale.date <= endDateStr);
      }

      // 카테고리나 기간 필터 있으면 재계산
      if (selectedCategory || rentalPeriod) {
        const uniqueDates = Array.from(new Set(allData.map(d => d.date)));
        const recalculated = await Promise.all(uniqueDates.map(d => computeDaySummary(d)));
        setAllMonthsData(recalculated);
      } else {
        setAllMonthsData(allData);
      }
    } catch (err) {
      console.error('전체 월 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
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

      const startDateStr = formatDateForAPI(searchDateRange.start);
      const endDateStr = formatDateForAPI(searchDateRange.end);

      const filteredData = data.filter(sale => {
        return sale.date >= startDateStr && sale.date <= endDateStr;
      });

      if ((selectedCategory || rentalPeriod) && filteredData.length > 0) {
        const dates = Array.from(new Set(filteredData.map(d => d.date)));
        const recalculated = await Promise.all(dates.map(d => computeDaySummary(d)));
        setSalesData(recalculated);
      } else {
        setSalesData(filteredData);
      }
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

      const startDateStr = formatDateForAPI(start);
      const endDateStr = formatDateForAPI(end);

      const filteredData = data.filter(sale => {
        return sale.date >= startDateStr && sale.date <= endDateStr;
      });

      if ((selectedCategory || rentalPeriod) && filteredData.length > 0) {
        const dates = Array.from(new Set(filteredData.map(d => d.date)));
        const recalculated = await Promise.all(dates.map(d => computeDaySummary(d)));
        setSalesData(recalculated);
      } else {
        setSalesData(filteredData);
      }

      setIsAdvancedSearchActive(true);
      setSearchDateRange({ start, end });
      setSummaryPeriod("");
      setSelectedDate(new Date(start));

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setQuickDateRange = (type) => {
    const today = new Date();
    let start, end;

    if (type === 'today') {
      start = new Date(today);
      end = new Date(today);
    } else if (type === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    setStartDate(formatDateForAPI(start));
    setEndDate(formatDateForAPI(end));

    setTimeout(() => {
      fetchAdvancedSearchWithDates(start, end);
    }, 100);
  };

  const fetchAdvancedSearchWithDates = async (start, end) => {
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

      const startDateStr = formatDateForAPI(start);
      const endDateStr = formatDateForAPI(end);

      const filteredData = data.filter(sale => {
        return sale.date >= startDateStr && sale.date <= endDateStr;
      });

      if ((selectedCategory || rentalPeriod) && filteredData.length > 0) {
        const dates = Array.from(new Set(filteredData.map(d => d.date)));
        const recalculated = await Promise.all(dates.map(d => computeDaySummary(d)));
        setSalesData(recalculated);
      } else {
        setSalesData(filteredData);
      }

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

  // ---------- fetchDayDetails (모달용 상세) ----------
  const fetchDayDetails = async (date) => {
    try {
      const params = new URLSearchParams();
      params.append("date", date);
      if (selectedCategory) params.append("category", selectedCategory);
      if (rentalPeriod) params.append("rentalPeriod", rentalPeriod);

      const res = await fetch(`${API_BASE_URL}/api/sales/details?${params}`);
      if (!res.ok) throw new Error("상세 내역을 불러오는데 실패했습니다.");

      const data = await res.json();
      console.log('[fetchDayDetails] raw data:', data);

      const normalizedCategoryValue = selectedCategory ? normalize(selectedCategory) : null;
      const normalizedCategoryLabel = selectedCategory ? getCategoryLabelForValue(selectedCategory) : null;
      const rentalPeriodInt = rentalPeriod ? parseInt(rentalPeriod, 10) : null;

      const processed = data.map(rental => {
        const items = rental.items || [];
        const anyItemHasCategory = items.some(it => detectItemCategory(it) != null);

        let filteredItems = items.filter(it => itemMatchesFilters(it, normalizedCategoryValue, rentalPeriodInt, normalizedCategoryLabel));

        if (normalizedCategoryValue && filteredItems.length === 0 && !anyItemHasCategory && items.length > 0) {
          filteredItems = items.filter(it => !rentalPeriodInt || (it.rentalPeriodYears != null && Number(it.rentalPeriodYears) === rentalPeriodInt));
        }

        const normalizedItems = filteredItems.map(item => {
          const pricePerUnit = item.pricePerUnit != null ? Number(item.pricePerUnit) : 0;
          const quantity = item.quantity != null ? Number(item.quantity) : 0;
          const years = item.rentalPeriodYears != null ? Number(item.rentalPeriodYears) : 1;
          const itemTotal = item.itemTotalPrice != null ? Number(item.itemTotalPrice) : (pricePerUnit * quantity * years * 12);
          return {
            ...item,
            pricePerUnit,
            quantity,
            rentalPeriodYears: years,
            itemTotalPrice: itemTotal
          };
        });

        const totalPrice = normalizedItems.reduce((s, it) => s + (it.itemTotalPrice || 0), 0);

        return {
          ...rental,
          items: normalizedItems,
          totalPrice
        };
      });

      const visible = processed.filter(r => (r.items || []).length > 0);

      setSelectedDayOrders(visible);
      setShowDetailModal(true);
    } catch (err) {
      console.error(err);
      alert("상세 내역을 불러오는데 실패했습니다.");
    }
  };
  // ---------- end fetchDayDetails ----------

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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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

      let isInSearchRange = true;
      if (isAdvancedSearchActive && searchDateRange) {
        isInSearchRange = currentDate >= searchDateRange.start && currentDate <= searchDateRange.end;
      }

      // 필터 조건이 있을 때 orderCount가 0이면 표시하지 않음
      const shouldShow = daySales && isInSearchRange && daySales.orderCount > 0;

      days.push(
        <td
          key={day}
          style={{
            border: '1px solid #ddd',
            padding: '8px',
            verticalAlign: 'top',
            height: '120px',
            width: '14.28%',
            cursor: shouldShow ? 'pointer' : 'default',
            background: !isInSearchRange ? '#f5f5f5' : (shouldShow ? '#e3f2fd' : '#fff'),
            opacity: !isInSearchRange ? 0.5 : 1,
            overflow: 'hidden',
            position: 'relative'
          }}
          onClick={() => {
            if (shouldShow) {
              fetchDayDetails(dateStr);
            }
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{day}</div>
          {shouldShow && (
            <div style={{
              fontSize: '0.75rem',
              lineHeight: '1.3'
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
    let dataToSum;

    if (isAdvancedSearchActive && searchDateRange) {
      const startDateStr = formatDateForAPI(searchDateRange.start);
      const endDateStr = formatDateForAPI(searchDateRange.end);

      dataToSum = allMonthsData.filter(sale => {
        return sale.date >= startDateStr && sale.date <= endDateStr;
      });
    } else {
      dataToSum = allMonthsData;
    }

    return dataToSum.reduce((acc, cur) => ({
      orderCount: acc.orderCount + (cur.orderCount || 0),
      productCount: acc.productCount + (cur.productCount || 0),
      totalSales: acc.totalSales + (cur.totalSales || 0)
    }), { orderCount: 0, productCount: 0, totalSales: 0 });
  };

  const changeMonth = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);

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
      <h2 className="mb-4">📊 판매 내역 통계</h2>

      <Card className="mb-4 p-3 bg-light">
        <div className="mb-3">
          <h5>
            매출 요약
            {isAdvancedSearchActive && searchDateRange && (
              <span className="ms-2 text-muted" style={{ fontSize: '0.9rem' }}>
                ({formatDateForAPI(searchDateRange.start)} ~ {formatDateForAPI(searchDateRange.end)})
              </span>
            )}
            {!isAdvancedSearchActive && (
              <span className="ms-2 text-muted" style={{ fontSize: '0.9rem' }}>
                ({new Date().getFullYear()}년 전체)
              </span>
            )}
          </h5>
        </div>
        <Row className="text-center">
          {loading ? (
            <Col>
              <Spinner animation="border" />
              <div className="mt-2">데이터를 불러오는 중...</div>
            </Col>
          ) : (
            <>
              <Col md={4}>
                <h5>주문</h5>
                <h3 className="text-primary">{totals.orderCount}건</h3>
                <span style={{ fontSize: "0.75rem", color: "gray" }}>(결제 주문 건수 합산)</span>
              </Col>
              <Col md={4}>
                <h5>상품</h5>
                <h3 className="text-success">{totals.productCount}건</h3>
                <span style={{ fontSize: "0.75rem", color: "gray" }}>(결제 상품 건수 × 상품 수량 합산)</span>
              </Col>
              <Col md={4}>
                <h5>매출</h5>
                <h3 className="text-danger">{totals.totalSales.toLocaleString()}원</h3>
              </Col>
            </>
          )}
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
          <Row className="mt-3 p-3 border-top align-items-end">
            <Col md={2}>
              <Form.Label>빠른 검색</Form.Label>
              <ButtonGroup className="w-100">
                <Button variant="outline-primary" onClick={() => setQuickDateRange('today')}>
                  오늘
                </Button>
                <Button variant="outline-primary" onClick={() => setQuickDateRange('month')}>
                  한 달
                </Button>
              </ButtonGroup>
            </Col>
            <Col md={4}>
              <Form.Label>시작일</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="기간 선택"
              />
            </Col>
            <Col md={4}>
              <Form.Label>종료일</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="기간 선택"
              />
            </Col>
            <Col md={2} className="d-flex align-items-end">
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
            <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(-1)}>◀ 이전 달</Button>
            <h4>{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월</h4>
            <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(1)}>다음 달 ▶</Button>
          </Card.Header>
          <Card.Body>
            <Table bordered style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <th key={day} style={{ textAlign: 'center', background: '#f5f5f5', width: '14.28%' }}>{day}</th>
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
            <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(-1)}>◀ 이전 달</Button>
            <h5>{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 판매 내역</h5>
            <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(1)}>다음 달 ▶</Button>
          </Card.Header>
          <Card.Body>
            {salesData.length === 0 ? (
              <Alert variant="info">해당 기간의 판매 내역이 없습니다.</Alert>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('date')}>
                      날짜 {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                    </th>
                    <th>주문 건수</th>
                    <th>판매 상품</th>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('totalSales')}>
                      총 매출 {sortConfig.key === 'totalSales' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
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
                      <td><Button size="sm" variant="outline-primary" onClick={() => fetchDayDetails(sale.date)}>보기</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

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
                          <h5 className="text-primary">{(item.itemTotalPrice || 0).toLocaleString()}원</h5>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-top">
                    <Row>
                      <Col md={6}><h5>총 결제금액</h5></Col>
                      <Col md={6} className="text-end"><h5 className="text-success">{(rental.totalPrice || 0).toLocaleString()}원</h5></Col>
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