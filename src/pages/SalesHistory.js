import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { DayPicker } from "react-day-picker";
import 'react-day-picker/dist/style.css';


export default function App({ user }) {
  /* 
  <div className="mb-4">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
            />
            <Button className="mt-2" onClick={() => { }}>
              검색
            </Button>
          </div>
  */
  /*
  판매 내역 
  기본세팅 현재일자를 기준으로 현재년도의 현재 일자의 월간 판매내역 게시

  [년도 선택] [월 선택]
  --- 1개월 기준 보여줌

  ---------------
  고급 필터 [카테고리] [상품 이름 검색]


  ================
  오늘/ 
  주문 건수 , 상품 판매 건수, 총 주문 금액, 

  */

  const navigate = useNavigate();
  console.log("App 컴포넌트 렌더링됨");

  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [showCalendar, setShowCalendar] = useState(false);
  const [salesSearchResult, setSalesSearchResult] = useState();
  const [filteredSales, setFilteredSales] = useState();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [salesProducts, setSalesProducts] = useState([
    {
      date: new Date('2025-10-20'),
      orderCount: 56,      // 주문이 56번
      productCount: 128,   // 주문한 상품 총 개수는 128개
      totalSales: 345000,
    },
    {
      date: new Date('2025-10-21'),
      orderCount: 60,      // 주문이 60번
      productCount: 150,   // 주문한 상품 총 개수는 150개
      totalSales: 400000,
    },
    {
      date: new Date('2025-10-22'),
      orderCount: 75,      // 주문이 75번
      productCount: 200,   // 주문한 상품 총 개수는 200개
      totalSales: 500000,
    }
  ]);

  /*
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
  */


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
    return date.toISOString().slice(0, 10);
  };

  const onSearchClick = () => {
    setShowCalendar(false);
  };
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
      </div >
      <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>판매 내역 검색</p>
      <div tyle={{ display: 'flex', gap: '10px' }}>
        <span>
          <Form.Select>
            <option></option>
          </Form.Select>
        </span>

        <span>
          <Form.Select>
            <option></option>
          </Form.Select>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label>기간 검색:</label>
        <input
          type="text"
          readOnly
          placeholder="시작일"
          value={formatDate(range.from)}
          onClick={() => setShowCalendar(true)}
          style={{ cursor: 'pointer', padding: '6px', width: '120px' }}
        />
        <span>~</span>
        <input
          type="text"
          readOnly
          placeholder="종료일"
          value={formatDate(range.to)}
          onClick={() => setShowCalendar(true)}
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
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
          />
          <Button className="mt-2" onClick={onSearchClick}>검색</Button>
          <Button variant="secondary" className="mt-2 ms-2" onClick={() => setShowCalendar(false)}>취소</Button>
        </div>
      )}

    </Container >
  );
}