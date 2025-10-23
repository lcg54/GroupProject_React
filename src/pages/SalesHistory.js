import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { DayPicker } from "react-day-picker";
import 'react-day-picker/dist/style.css';


export default function App({ user }) {

  const navigate = useNavigate();
  console.log("App 컴포넌트 렌더링됨");

  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [showCalendar, setShowCalendar] = useState(null);
  const [filteredSales, setFilteredSales] = useState();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilterSearch, setShowFilterSearch] = useState(false);


  const [salesProducts, setSalesProducts] = useState([
    {
      date: new Date('2025-10-01'),
      orderCount: 50,
      productCount: 500,
      totalSales: 500000,
      category: "DRYER",
    },
    {
      date: new Date('2025-10-02'),
      orderCount: 10,
      productCount: 100,
      totalSales: 100000,
      category: "REFRIGERATOR",
    },
    {
      date: new Date('2025-09-21'),
      orderCount: 60,
      productCount: 150,
      totalSales: 400000,
      category: "OVEN",
    },
    {
      date: new Date('2025-07-23'),
      orderCount: 75,
      productCount: 200,
      totalSales: 500000,
      category: "MICROWAVE",
    },
    {
      date: new Date('2023-01-23'),
      orderCount: 95,
      productCount: 100,
      totalSales: 590000,
      category: "WASHER",
    },
    {
      date: new Date('2024-10-21'),
      orderCount: 75,
      productCount: 200,
      totalSales: 500000,
      category: "AIRCON",
    }
  ]);

  const CATEGORY_OPTIONS = [
    "REFRIGERATOR", "WASHER", "DRYER", "AIRCON", "TV", "OVEN", "MICROWAVE", "OTHER",
  ];


  const today = new Date();

  const isSameDate = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const todaySales = salesProducts.find(sales => isSameDate(sales.date, today)) || {
    orderCount: 0,
    productCount: 0,
    totalSales: 0,
  };


  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onSearchClick = () => {
    setShowCalendar(false);
    filterSalesData("range", { from: range.from, to: range.to }, selectedCategory);
  };

  const years = Array.from(new Set(salesProducts.map(item => item.date.getFullYear()))).sort((a, b) => b - a);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const onYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setSelectedMonth('');
  };

  const onMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
  };

  useEffect(() => {
    if (!selectedYear) {
      setFilteredSales(null);
      return;
    }

    filterSalesData("yearMonth", { year: selectedYear, month: selectedMonth }, selectedCategory);
  }, [selectedYear, selectedMonth, salesProducts, selectedCategory]);


  const onFilterSearchClick = () => {
    setShowFilterSearch(prev => !prev);
  };

  const filterByCategory = (items, category) => {
    if (!category) return items;
    return items.filter(item => item.category === category);
  };

  const filterSalesData = (filterType, value, category) => {
    setLoading(true);

    setTimeout(() => {
      let filtered = [];

      if (filterType === "yearMonth") {
        const { year, month } = value;

        filtered = salesProducts.filter(item => {
          const itemYear = item.date.getFullYear().toString();
          const itemMonth = (item.date.getMonth() + 1).toString().padStart(2, '0');
          if (month) return itemYear === year && itemMonth === month.padStart(2, '0');
          return itemYear === year;
        });
      }

      if (filterType === "range") {
        const { from, to } = value;

        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);

        filtered = salesProducts.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= from && itemDate <= endOfDay;
        });
      }

      filtered = filterByCategory(filtered, category);

      if (filtered.length > 0) {
        const totalOrderCount = filtered.reduce((acc, cur) => acc + cur.orderCount, 0);
        const totalProductCount = filtered.reduce((acc, cur) => acc + cur.productCount, 0);
        const totalSales = filtered.reduce((acc, cur) => acc + cur.totalSales, 0);
        setFilteredSales({ totalOrderCount, totalProductCount, totalSales });
      } else {
        setFilteredSales(null);
      }

      setLoading(false);
    }, 400);
  };

  // 관리자 페이지 설정 
  useEffect(() => {
    console.log("user 상태:", user);
    if (!user) {
      alert("관리자 페이지입니다.");
      navigate("/login");
    } else if (user?.role !== "ADMIN") {
      alert("관리자 페이지입니다.");
      navigate("/")
    }
  }, [user, navigate]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div>
        <h2>비공개 페이지 입니다.</h2>
      </div>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">판매 내역</h2>
      <div>
        <Card className="mb-4 p-3">
          <p className="text-center mb-4" style={{ fontSize: '2rem' }}>Today</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', textAlign: 'center' }}>
            <span><strong>주문 건수</strong> {todaySales.orderCount}건</span>
            <span><strong>판매 상품 건수</strong> {todaySales.productCount}건</span>
            <span><strong>총 주문 금액</strong> {todaySales.totalSales}원</span>
          </div>
        </Card>
      </div>
      <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>판매 내역 검색</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <Form.Label style={{ display: 'inline', marginBottom: 0, lineHeight: 'normal', fontSize: '1.2rem', fontWeight: 'bold', padding: '0 8px' }}>
            년도
          </Form.Label>
          <Form.Select style={{ width: '160px' }} value={selectedYear} onChange={onYearChange}>
            <option value="">년도</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Form.Select>
        </span>

        <span style={{ display: 'flex', alignItems: 'center' }}>
          <Form.Label style={{ display: 'inline', marginBottom: 0, lineHeight: 'normal', fontSize: '1.2rem', fontWeight: 'bold', padding: '0 8px' }}>
            월
          </Form.Label>
          <Form.Select style={{ width: '140px' }} value={selectedMonth} onChange={onMonthChange}>
            <option value="">전체</option>
            {months.map(m => (
              <option key={m} value={m.toString().padStart(2, '0')}>
                {m}월
              </option>
            ))}
          </Form.Select>
        </span>
      </div>
      <div className="mt-2" style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={onFilterSearchClick}>고급 필터</Button>
        {showFilterSearch && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
              <label style={{ display: 'inline', marginBottom: 0, lineHeight: 'normal', fontSize: '1.2rem', fontWeight: 'bold', padding: '0 8px' }}>기간 검색:</label>
              <input
                type="text"
                readOnly
                placeholder="시작일"
                value={formatDate(range.from)}
                onClick={() => setShowCalendar('from')}
                style={{ cursor: 'pointer', padding: '6px', width: '120px' }}
              />
              <span>~</span>
              <input
                type="text"
                readOnly
                placeholder="종료일"
                value={formatDate(range.to)}
                onClick={() => setShowCalendar('to')}
                style={{ cursor: 'pointer', padding: '6px', width: '120px' }}
              />
            </div>
            {showCalendar && (
              <div style={{
                position: 'absolute',
                zIndex: 1000,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                padding: '1rem',
                marginTop: '8px'
              }}>
                <DayPicker
                  mode="single"
                  selected={showCalendar === 'from' ? range.from : range.to}
                  onSelect={(date) => {
                    if (!date) return;
                    if (showCalendar === 'from') {
                      setRange((prev) => ({ from: date, to: prev.to && date > prev.to ? date : prev.to }));
                    } else if (showCalendar === 'to') {
                      setRange((prev) => ({ from: prev.from, to: date && date < prev.from ? prev.from : date }));
                    }
                  }}
                  numberOfMonths={1}
                />
                <Button className="mt-2" onClick={onSearchClick}>검색</Button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
              <Form.Label style={{ display: 'inline', marginBottom: 0, lineHeight: 'normal', fontSize: '1.2rem', fontWeight: 'bold', padding: '0 8px' }}>
                카테고리
              </Form.Label>
              <Form.Select style={{ width: '140px' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">전체</option>
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </div>
          </div>
        )}
      </div>
      <div style={{ minHeight: '150px', minWidth: '300px', backgroundColor: '#fafafa', margin: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {filteredSales ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <td>주문 건수</td>
                <td>판매 상품 건수</td>
                <td>총 주문 금액</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{filteredSales.totalOrderCount} 건</td>
                <td>{filteredSales.totalProductCount} 건</td>
                <td>{filteredSales.totalSales.toLocaleString()} 원</td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <p style={{ color: '#666', fontSize: '1.2rem', margin: 0 }}>
            검색 내역이 없습니다.
          </p>
        )
        }
      </div >
    </Container >
  );
}