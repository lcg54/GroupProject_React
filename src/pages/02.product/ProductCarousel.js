import { useState } from "react";
import { Carousel, Row, Col } from "react-bootstrap";
import { API_BASE_URL } from "../../config/url";

export default function ProductCarousel({ product }) {
  const mainImages = product.images?.main || [];
  const subImages = product.images?.sub || [];
  const allImages = [...mainImages, ...subImages];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <Carousel
        activeIndex={activeIndex}
        onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
        className="bg-white p-2 rounded-4 shadow-sm"
        nextIcon={
          <span
            aria-hidden="true"
            className="carousel-control-next-icon"
            style={{ filter: "invert(0.2) brightness(0.7)" }}
          />
        }
        prevIcon={
          <span
            aria-hidden="true"
            className="carousel-control-prev-icon"
            style={{ filter: "invert(0.2) brightness(0.7)" }}
          />
        }
        indicators={true}
        variant="dark"
      >
        {allImages.map((src, i) => (
          <Carousel.Item key={i} className="bg-white rounded-4 overflow-hidden">
            <div style={{ backgroundColor: "white", borderRadius: "1rem" }}>
              <img
                className="d-block w-100"
                src={`${API_BASE_URL}${src}`}
                alt={`상품 이미지 ${i + 1}`}
                style={{
                  height: "400px",
                  objectFit: "contain",
                  backgroundColor: "white",
                  borderRadius: "1rem",
                }}
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      <Row className="mt-3 gx-2">
        {allImages.map((src, i) => (
          <Col xs={3} key={i}>
            <div
              className="mb-2"
              onClick={() => setActiveIndex(i)}
              style={{
                cursor: "pointer",
                borderRadius: "0.5rem",
                border: activeIndex === i ? "2px solid #333" : "1px solid #ddd",
                backgroundColor: "white",
                padding: "2px",
              }}
            >
              <img
                src={`${API_BASE_URL}${src}`}
                alt={`썸네일 ${i + 1}`}
                style={{
                  width: "100%",
                  height: "80px",
                  objectFit: "contain",
                  borderRadius: "0.5rem",
                  backgroundColor: "white",
                }}
              />
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
}