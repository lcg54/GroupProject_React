import './App.css';
import Header from './ui/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './ui/Footer';
import { useEffect, useState } from 'react';

export default function App() {

  return (
    <>
      <Header />
      <AppRoutes />
      <Footer />
    </>
  );
}