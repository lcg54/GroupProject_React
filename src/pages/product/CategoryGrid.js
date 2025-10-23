import { Card, Image } from "react-bootstrap";
import { FILTER_OPTIONS } from "./Filter";
import { API_BASE_URL } from "../../config/url";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CategoryGrid({ category = [], setCategory, onClickCategory, styleType = "default" }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/product/category/images`)
      .then((res) => {
        console.log("카테고리 이미지 API 결과:", res.data);
        setImages(res.data);
      })
      .catch((err) => {
        console.error("카테고리 이미지를 불러오는 중 오류 발생:", err);
      });
  }, []);
  
  const toggleCategory = (value) => {
    if (setCategory) {
      setCategory((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }

    if (onClickCategory) {
      onClickCategory(value);
    }
  };

  const isMini = styleType === "mini";

  const getImageForCategory = (categoryValue) => {
    const product = images.find(
      (p) => p.category?.toLowerCase() === categoryValue.toLowerCase()
    );
    return product?.categoryImage || null;
  };

  return (
    <div
      className={`d-flex ${
        isMini ? "flex-nowrap overflow-auto pb-3" : "flex-wrap"
      } gap-2 justify-content-center`}
      style={isMini ? { userSelect: "none" } : {}}
    >
      {FILTER_OPTIONS.category
        .filter((c) => c.value !== null)
        .map((c) => {
          const selected = category.includes(c.value);

          // 백엔드에서 받은 이미지 우선 사용, 없으면 placeholder
          const imageSrc =
            getImageForCategory(c.value);
          return (
            <Card
              key={c.value}
              onClick={() => toggleCategory(c.value)}
              title={c.label}
              style={{
                width: isMini ? "80px" : "90px",
                minWidth: isMini ? "80px" : undefined,
                height: isMini ? "100px" : undefined,
                border: isMini
                  ? "none"
                  : selected
                  ? "2px solid #0d6efd"
                  : "1px solid #ccc",
                backgroundColor: isMini ? "transparent" : "#fff",
                boxShadow: isMini
                  ? "none"
                  : selected
                  ? "0 0 6px rgba(13,110,253,0.4)"
                  : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: isMini ? "0.25rem" : undefined,
                flexShrink: 0,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <Image
                src={imageSrc}
                alt={c.label}
                roundedCircle={isMini}
                style={{
                  width: isMini ? "60px" : "100%",
                  height: isMini ? "60px" : "80px",
                  objectFit: 'contain',
                  marginBottom: isMini ? "0.25rem" : undefined,
                }}
              />
              <div
                style={{
                  fontWeight: isMini || selected ? "600" : "400",
                  fontSize: isMini ? "0.75rem" : "0.85rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
              >
                {c.label}
              </div>
            </Card>
          );
        })}
    </div>
  );
}