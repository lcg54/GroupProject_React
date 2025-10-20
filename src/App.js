import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
<<<<<<< HEAD
import { useEffect, useState } from 'react';

export default function App() {
=======
import { useState } from 'react';

export default function App() {
  const [user, setUser] = useState(null); // 로그인 로그아웃
>>>>>>> 46dd89c547044ba658b053c645d34dcdc9f7fe3c

  return (
    <>
      <Header />
      <AppRoutes user={user} />
      <Footer />
    </>
  );
}