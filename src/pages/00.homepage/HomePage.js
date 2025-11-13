import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Container, Image, Carousel } from 'react-bootstrap';
import { API_BASE_URL } from '../../config/url';
import axios from 'axios';
import calcMonthlyPrice from '../../util/calcMonthlyPrice';
import CategoryGrid from "../02.product/CategoryGrid";

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
            monthlyPrice: calcMonthlyPrice(6, p.price),
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

      {/* 캐러셀 영역 */}
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
                src={`${API_BASE_URL}/images${p.mainImage.replace(/.*images/, '')}`}
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
        <div className="mt-4" style={{ lineHeight: 1.6 }}>
          <p
            style={{
              fontSize: '1.05rem',
              fontStyle: 'italic',          // 약간 기울임
              fontFamily: '"Georgia", "Times New Roman", serif', // 세리프 계열
              color: '#333',                // 진하지만 부드러운 색
              letterSpacing: '0.7px',       // 글자 간격 약간 넓힘
            }}
          >
            당신의 삶의 질을 높히기 위해<br />
            저희는 편안함을 대여해 드립니다.
          </p>
        </div>
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
