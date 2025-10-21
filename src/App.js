import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
import { useState } from 'react';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      
        <AppRoutes user={user} />
      <Footer />
    </>
  );
}

