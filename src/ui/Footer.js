export default function Footer() {
  return (
    <footer className="bg-dark text-light text-center py-3 mt-5">
      <p className="mt-3">회사소개 | 인재채용 | 입점 및 제휴문의 | 공지사항 | 이용약관 | 개인정보처리방침 | 광고안내</p>
      <p>© {new Date().getFullYear()}. Qualirent all rights reserved.</p>
    </footer>
  );
}