import { useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const lastScrollY = useRef(window.scrollY);
  const ticking = useRef(false);

  // 스크롤 방향에 따라 visible 상태 조절
  useEffect(() => {
    const scrollTimeout = { current: null };

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (menuOpen) {
          setVisible(true); // 메뉴 열려있으면 항상 보여주기
        } else {
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            // 아래로 스크롤 중 & 어느정도 내려왔으면 숨기기
            setVisible(false);
          } else {
            // 위로 스크롤 중이면 보이기
            setVisible(true);
          }
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;

        // 스크롤 멈춤 감지 (300ms 후 헤더 보임)
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setVisible(true);
        }, 300);
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [menuOpen]);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <>
      <Navbar
        className={`header ${visible ? 'header-visible' : 'header-hidden'}`}
        sticky="top"
      >
        <Button
          variant="outline-secondary"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-controls="side-menu"
          aria-expanded={menuOpen}
          className="me-3"
        >
          <img src="/path-to-hamburger-icon.svg" alt="Menu" />
        </Button>

        <Nav className="ms-auto d-none d-lg-flex align-items-center">
          {user ? (
            <>
              <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>
                {user.name}님
              </span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleLogoutClick}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Nav.Link href="/member/login">login</Nav.Link>
              <Nav.Link href="/member/signup">signup</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar>

      {/* 사이드 메뉴 */}
      <div
        id="side-menu"
        style={{
          position: 'fixed',
          top: 0,
          left: menuOpen ? 0 : '-250px',
          height: '100vh',
          width: '250px',
          backgroundColor: '#f8f9fa',
          boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
          padding: '2rem 1rem',
          transition: 'left 0.3s ease',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Button variant="light" onClick={() => { navigate('/'); setMenuOpen(false); }} style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          홈페이지 가기
        </Button>
        <Button variant="light" onClick={() => { navigate('/product/list'); setMenuOpen(false); }}>
          상품목록
        </Button>
        <Button variant="light" onClick={() => { navigate('/inquiry/list'); setMenuOpen(false); }}>
          문의게시판
        </Button>
        <Button variant="light" onClick={() => { navigate('/review'); setMenuOpen(false); }}>
          후기게시판
        </Button>
        <Button variant="light" onClick={() => { navigate('/mypage'); setMenuOpen(false); }}>
          마이페이지
        </Button>
        <Button variant="light" onClick={() => { navigate('/cart'); setMenuOpen(false); }}>
          장바구니
        </Button>
        <Button variant="light" onClick={() => { navigate('/admin/product/register'); setMenuOpen(false); }}>
          상품등록
        </Button>

        <hr />

        {user ? (
          <>
            <div style={{ padding: '0.5rem', backgroundColor: '#e9ecef', borderRadius: '5px', textAlign: 'center', marginBottom: '0.5rem' }}>
              <strong>{user.name}</strong>님
            </div>
            <Button variant="light" onClick={() => { navigate('/member/edit'); setMenuOpen(false); }}>
              내정보 수정
            </Button>
            <Button variant="secondary" onClick={() => { handleLogoutClick(); setMenuOpen(false); }}>
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <Button variant="light" onClick={() => { navigate('/member/login'); setMenuOpen(false); }}>
              로그인
            </Button>
            <Button variant="light" onClick={() => { navigate('/member/signup'); setMenuOpen(false); }}>
              회원가입
            </Button>
          </>
        )}
      </div>

      {/* 메뉴 오버레이 */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '100vw',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 1100,
          }}
        />
      )}
    </>
  );
}