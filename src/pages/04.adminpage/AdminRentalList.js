import { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Dropdown, Badge, Tabs, Tab, Pagination, Form } from "react-bootstrap";
import { API_BASE_URL } from "../../config/url";
import { OrderStatus, statusLabel } from "../../util/orderStatus";
import AdminRentalCard from "./AdminRentalCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminRentalListPage({ user }) {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("RESERVED");
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState({});
  const [totalPagesMap, setTotalPagesMap] = useState({});
  const [totalItemsMap, setTotalItemsMap] = useState({});
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const userRole = user?.role || storedUser?.role;

    if (userRole !== "ADMIN") {
      alert("관리자만 접근 가능한 페이지입니다.");
      navigate(`/member/login`);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchTotalItems();
    fetchRentals(activeTab, currentPage[activeTab] || 1);
  }, [user, activeTab, currentPage]);

  // 탭/페이지별 조회
  const fetchRentals = async (status, page) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/rental/control`, {
        params: { status, page, size: itemsPerPage }
      });
      setRentals(res.data.items);
      setTotalPagesMap((prev) => ({ ...prev, [status]: res.data.totalPages }));
      setTotalItemsMap((prev) => ({ ...prev, [status]: res.data.totalItems }));
    } catch (err) {
      console.error("대여 내역 불러오기 실패:", err);
      alert("대여 내역을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 각 탭별 총 아이템 수 조회
  const fetchTotalItems = async () => {
    const counts = {};
    await Promise.all(
      OrderStatus.map(async (status) => {
        try {
          const res = await axios.get(`${API_BASE_URL}/rental/control/count`, { params: { status } });
          counts[status] = res.data.totalItems;
        } catch (err) {
          console.error("총 아이템 수 조회 실패:", err);
          counts[status] = 0;
        }
      })
    );
    setTotalItemsMap(counts);
  };

  // 상태 변경 (단일 상품)
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/rental/control/status/${itemId}`, { newStatus });
      setCurrentPage({});
      await fetchTotalItems();
      fetchRentals(activeTab, 1);
      setSelectedItems([]);
    } catch (err) {
      console.error("상태 변경 실패:", err);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  // 상태 변경 (체크된 상품)
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedItems.length === 0) {
      alert("변경할 상품을 선택해주세요.");
      return;
    }
    if (!window.confirm(`선택한 ${selectedItems.length}개의 상품 상태를 '${statusLabel(newStatus)}'로 변경하시겠습니까?`)) return;

    try {
      await Promise.all(
        selectedItems.map((id) =>
          axios.patch(`${API_BASE_URL}/rental/control/status/${id}`, { newStatus })
        )
      );
      alert("상태가 성공적으로 변경되었습니다.");
      setCurrentPage({});
      await fetchTotalItems();
      fetchRentals(activeTab, 1);
      setSelectedItems([]);
    } catch (err) {
      console.error("일괄 상태 변경 실패:", err);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    const allSelected = rentals.every((i) => selectedItems.includes(i.itemId));
    if (allSelected) {
      setSelectedItems((prev) => prev.filter((id) => !rentals.map((i) => i.itemId).includes(id)));
    } else {
      setSelectedItems((prev) => [...new Set([...prev, ...rentals.map((i) => i.itemId)])]);
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
        <h4 className="mt-3">대여 현황을 불러오는 중입니다...</h4>
      </Container>
    );
  }

  return (
    <Container className="mt-3" style={{ maxWidth: "1000px" }}>
      <h2 className="mb-4">대여 현황</h2>

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        {OrderStatus.map((status) => (
          <Tab
            key={status}
            eventKey={status}
            title={
              <>
                {statusLabel(status)}{" "}
                <Badge bg="secondary" pill>
                  {totalItemsMap[status] || 0}
                </Badge>
              </>
            }
          >
            {rentals.length > 0 ? (
              <>
                <Row className="d-flex align-items-center justify-content-between mb-2">
                  <Col xs="auto">
                    <Form.Check
                      type="checkbox"
                      label="전체 선택"
                      checked={rentals.every((i) => selectedItems.includes(i.itemId))}
                      onChange={toggleSelectAll}
                    />
                  </Col>

                  {selectedItems.length > 0 && (
                    <Col xs="auto">
                      <Dropdown>
                        <Dropdown.Toggle variant="success" size="sm">
                          ✅ 일괄 상태 변경 ({selectedItems.length}개)
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {OrderStatus.map((s) => (
                            <Dropdown.Item
                              key={s}
                              onClick={() => handleBulkStatusChange(s)}
                              disabled={s === "RETURN_REQUESTED" && s !== "RETURNED"}
                            >
                              {statusLabel(s)}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </Col>
                  )}
                </Row>
                
                <Row xs={1} md={2} lg={2} className="g-4 mt-2">
                  {rentals.map((item) => (
                    <AdminRentalCard
                      key={item.itemId}
                      item={item}
                      selected={selectedItems.includes(item.itemId)}
                      onSelect={() => toggleSelectItem(item.itemId)}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </Row>

                {totalPagesMap[status] > 1 && (
                  <Pagination className="justify-content-center mt-4">
                    <Pagination.First
                      onClick={() => setCurrentPage((prev) => ({ ...prev, [status]: 1 }))}
                      disabled={(currentPage[status] || 1) === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setCurrentPage((prev) => ({ ...prev, [status]: prev[status] - 1 }))}
                      disabled={(currentPage[status] || 1) === 1}
                    />
                    {(() => {
                      const current = currentPage[status] || 1;
                      const startPage = Math.floor((current - 1) / 10) * 10 + 1;
                      const endPage = Math.min(startPage + 9, totalPagesMap[status]);
                      const pages = [];
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <Pagination.Item
                            key={i}
                            active={current === i}
                            onClick={() => setCurrentPage((prev) => ({ ...prev, [status]: i }))}
                          >
                            {i}
                          </Pagination.Item>
                        );
                      }
                      return pages;
                    })()}
                    <Pagination.Next
                      onClick={() => setCurrentPage((prev) => ({ ...prev, [status]: prev[status] + 1 }))}
                      disabled={(currentPage[status] || 1) === totalPagesMap[status]}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage((prev) => ({ ...prev, [status]: totalPagesMap[status] }))}
                      disabled={(currentPage[status] || 1) === totalPagesMap[status]}
                    />
                  </Pagination>
                )}
              </>
            ) : (
              <p className="text-center text-muted my-5">해당 상태의 상품이 없습니다.</p>
            )}
          </Tab>
        ))}
      </Tabs>
    </Container>
  );
}