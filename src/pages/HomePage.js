import { Container, Row, Col, Image, Carousel } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import DoubleCircle from "./home/DoubleCircle";
import CategoryGrid from "./product/CategoryGrid";
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/url';
import axios from 'axios';

const HeroSection = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/product/popular`);
        setPopularProducts(
          res.data.map(p => ({
            ...p,
            monthlyPrice: p.price / (6 * 10) - 2100,
          }))
        );
      } catch (err) {
        console.error("인기상품 불러오기 실패", err);
      }
    };

    fetchPopularProducts();
  }, []);

  const handleCategoryClick = (categoryValue) => {
    // 상품 목록 페이지로 이동하면서 쿼리파라미터 전달
    navigate(`/product/list?category=${categoryValue}`);
  };

  const carouselStyle = {
    height: '900px',
    maxHeight: '650px',
    objectFit: 'cover',
    width: '100%',
    backgroundColor: "#eee",
  };

  return (
    <Container
      style={{ maxWidth: '900px', backgroundColor: '#FFFDF2', padding: '10rem 2rem', borderRadius: '10px' }}
      className="my-5"
    >
      <Row className="align-items-start">
        <Col md={6} className="d-flex flex-column align-items-start pe-6">
          <div style={{ marginBottom: '1.5rem' }}>
            <DoubleCircle />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Renting quality<br />of life
          </h1>
          <p>당신의 삶의 질을 높히기 위해<br />저희는 편안함을 대여해 드립니다.</p>
        </Col>
        <Col md={6} className="text-center ps-6">

          <Carousel
            fade
            interval={4000}
            indicators={true}
            controls={true}
            nextIcon={<span className="carousel-control-next-icon" aria-hidden="true" />}
            prevIcon={<span className="carousel-control-prev-icon" aria-hidden="true" />}
          >
            {popularProducts.map((p) => (
              <Carousel.Item
                key={p.id}
                style={{ cursor: 'pointer' }}
                // 클릭하면 상품상세로 이동
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <Image
                  src={p.id === 'example' ? p.mainImage : `${API_BASE_URL}/images/${p.mainImage}`}
                  alt={p.name}
                  fluid
                  rounded
                  style={carouselStyle}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
      </Row>

      {/* 카테고리 (그냥 카테고리페이지를 가져옴) */}
      <div className="mt-5">
        <CategoryGrid
          category={[]} // 아무 선택 없음
          onClickCategory={handleCategoryClick}
          styleType="mini" // 미니 스타일로 보여줌
        />
      </div>
    </Container>
  );
};

export default HeroSection;
