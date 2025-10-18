import { Route, Routes } from "react-router-dom";
import HomePage from './../pages/HomePage';
import ProductList from './../pages/ProductList';
import Product from '../pages/Product';

export default function AppRoutes({ user }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product/list" element={<ProductList user={user} />} />
      <Route path="/product/:id" element={<Product user={user} />} />

    </Routes>
  );
}