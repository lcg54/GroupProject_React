import { Container, Image, Carousel } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
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


  return (
    <Container className="py-5" style={{ backgroundColor: '#3CB371', color: '#000000ff', maxWidth: '800px' }}>
      {/* 텍스트 영역 */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '7rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Renting
        </h1>
        <h3 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
          quality of life
        </h3>

      </div>

      {/* 캐러셀 영역 - Container 안의 너비 유지 */}
      <div style={{ textAlign: 'center' }}>
        <Carousel
          // fade
          interval={3000}
          indicators={true}
          controls={true}
          nextIcon={<span className="carousel-control-next-icon" aria-hidden="true" />}
          prevIcon={<span className="carousel-control-prev-icon" aria-hidden="true" />}
        >
          {popularProducts.map((p) => (
            <Carousel.Item
              key={p.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/product/${p.id}`)}
            >
              <Image
                src={p.id === 'example' ? p.mainImage : `${API_BASE_URL}/images/${p.mainImage}`}
                alt={p.name}
                fluid
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'contain',
                  borderRadius: '10px',
                }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
        <p style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>
          당신의 삶의 질을 높히기 위해
        </p>
        <p style={{ fontSize: '1rem' }}>
          저희는 편안함을 대여해 드립니다.
        </p>
      </div>

      {/* 카테고리 영역 */}
      <div className="mt-5">
        <CategoryGrid
          category={[]}
          onClickCategory={handleCategoryClick}
        // styleType="mini"
        />
      </div>
    </Container>
  );
};

export default HeroSection;
