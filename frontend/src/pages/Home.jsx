import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { assets } from "../assets/assets";
import axios from 'axios';
import { Button } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState({
    equipment: [],
    supplements: []
  });
  const location = useLocation();
  const newProduct = location.state?.newProduct || null;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/product/latest');
        setProducts({
          equipment: response.data.equipment || [],
          supplements: response.data.supplements || [],
        });
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Add newProduct to the appropriate category if it exists
  const equipmentProducts = newProduct && newProduct.category.toLowerCase() === 'equipment'
    ? [newProduct, ...products.equipment].slice(0, 4)
    : products.equipment.slice(0, 4);

  const supplementProducts = newProduct && newProduct.category.toLowerCase() === 'supplement'
    ? [newProduct, ...products.supplements].slice(0, 4)
    : products.supplements.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-6 py-8">
      <header className="bg-gradient-to-r from-gray-400 to-gray-500 text-white p-6 rounded-lg shadow mb-8">
        <h1 className="text-2xl font-bold text-center text-black">Welcome to Fit-Gain Store</h1>
        </header>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-600">Explore Our Products</h2>
        <div className="border-b border-gray-400 mb-8"></div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Fitness Equipment</h2>
          <Button variant='contained' className='!bg-neutral-700 !text-white !capitalize'
            onClick={() => navigate('/shop?category=equipment')} endIcon={<ArrowRight size={16} strokeWidth={2} />}>View More</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {equipmentProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Supplements</h2>
          <Button variant='contained' className='!bg-neutral-700 !text-white !capitalize'
            onClick={() => navigate('/shop?category=supplement')} endIcon={<ArrowRight size={16} strokeWidth={2} />}>View More</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {supplementProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <footer className="mt-12 p-4 text-center text-gray-500 text-sm border-t border-gray-400">
        © {new Date().getFullYear()} FitGear. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;