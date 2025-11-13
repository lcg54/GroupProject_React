import { Button, Card, Col, Dropdown, Form } from "react-bootstrap";
import { API_BASE_URL } from "../../config/url";
import { RentalStatus, RentalStatusLabel } from "../../util/status";
import { formatDate, formatPrice } from "../../util/form";
import calcRemainingDays from "../../util/calcRemainingDays";
import { PaymentStatusLabel } from "../../util/status";

export default function AdminRentalCard({ item, onStatusChange, onSelect, selected }) {
  return (
    <Col>
      <Card className={selected ? "border-primary shadow-sm" : ""}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div className="d-flex align-items-center">
              <Form.Check
                type="checkbox"
                checked={selected}
                onChange={onSelect}
                className="me-2"
              />
              <Card.Title className="mb-0">{item.productName}</Card.Title>
            </div>

            <div className="gap-2 d-flex">
              <Button variant="outline-secondary" size="sm" style={{ pointerEvents: "none", opacity: 1, }}>
                {PaymentStatusLabel(item.paymentStatus)}
              </Button>

              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" size="sm">
                  상태 변경
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {RentalStatus.map((s) => (
                    <Dropdown.Item
                      key={s}
                      onClick={() => onStatusChange(item.itemId, s)}
                    >
                      {RentalStatusLabel(s)}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <img
              src={`${API_BASE_URL}/images/${item.mainImage}`}
              alt={item.productName}
              className="rounded me-3"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "contain",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            />
            <div className="flex-grow-1 ms-3">
              <Card.Text className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                상품주문번호: {item.itemId}
              </Card.Text>
              <Card.Text className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                수량: {item.quantity}개
              </Card.Text>
              <Card.Text className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                옵션: 월 {formatPrice(item.pricePerUnit)} × {item.rentalPeriodYears}년
                (총 {formatPrice(item.itemTotalPrice)})
              </Card.Text>
              <Card.Text className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                대여 기간: {formatDate(item.rentalStart)} ~ {formatDate(item.rentalEnd)}
                <strong><br />{calcRemainingDays(item)}</strong>
              </Card.Text>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}
