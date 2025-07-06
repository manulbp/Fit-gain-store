import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../src/assets/assets'; // Import assets for fallback image

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract search query from URL
  const searchQuery = new URLSearchParams(location.search).get('query');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5080/backend/product/all");
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        
        // Filter products based on search query
        const filteredProducts = data.products.filter(product => 
          product.productname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Process products with image paths
        const processedProducts = filteredProducts.map(product => ({
          ...product,
          image: product.image ? `http://localhost:5080/${product.image}` : null,
          price: parseFloat(product.price) || 0,
          quantity: parseInt(product.quantity) || 0,
          category: product.category
            ? product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()
            : 'Unknown',
        }));
        
        setProducts(processedProducts);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchProducts();
    }
  }, [searchQuery]);

  if (loading) return <div className="text-center mt-10">Searching...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  
  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Search Results for "{searchQuery}"
      </h1>
      
      {products.length === 0 ? (
        <div className="text-center">
          <p>No products found matching your search.</p>
          <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div key={product._id} className="border rounded-md p-4 bg-white shadow hover:shadow-lg transition">
              {/* Image Display */}
              <div className="mb-4 flex justify-center">
                <img
                  src={product.image || assets.noImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = assets.noImage;
                  }}
                  alt={product.productname || 'Product'}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
              <h2 className="text-xl font-bold mb-2">{product.productname}</h2>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-gray-500 mb-1">Category: {product.category}</p>
              <p className="text-gray-500 mb-1">Condition: {product.condition}</p>
              <p className="text-gray-500 mb-1">Quantity: {product.quantity}</p>
              <p className="text-gray-500 mb-1">Price: ${parseFloat(product.price).toFixed(2)}</p>
              {product.guidance && (
                <p className="text-gray-500 text-sm italic mt-2">{product.guidance}</p>
              )}
              <div className="mt-4">
                <button
                  className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-3xl"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
