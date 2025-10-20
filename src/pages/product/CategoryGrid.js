import { Card } from "react-bootstrap";
import { FILTER_OPTIONS } from "./Filter";
import { API_BASE_URL } from "../../config/url";

export default function CategoryGrid({ category, setCategory }) {
  const toggleCategory = (value) => {
    if (value === null) {
      setCategory([]);
    } else {
      setCategory((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
  };

  return (
    <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
      {FILTER_OPTIONS.category
        .filter((c) => c.value !== null)
        .map((c) => {
          const selected = category.includes(c.value);
          return (
            <Card
              key={c.value}
              onClick={() => toggleCategory(c.value)}
              style={{
                width: "90px",
                cursor: "pointer",
                border: selected ? "2px solid #0d6efd" : "1px solid #ccc",
                boxShadow: selected ? "0 0 6px rgba(13,110,253,0.4)" : "none",
                transition: "all 0.2s ease",
              }}
              className="text-center"
            >
              <Card.Img
                variant="top"
                src={`${API_BASE_URL}/images/category-${c.value.toLowerCase()}.jpg`}
                alt={c.label}
                style={{ height: "80px", objectFit: "cover" }}
              />
              <Card.Body className="p-2">
                <Card.Text
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: selected ? "600" : "400",
                  }}
                >
                  {c.label}
                </Card.Text>
              </Card.Body>
            </Card>
          );
        })}
    </div>
  );
}
