import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { CartContext } from '../context/CartContext';
import { assets } from '../assets/assets';

const ProductDetail = () => {
  const { pid } = useParams();
  const { authToken } = useContext(UserContext);
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:4000/api/product/get/${pid}`);
        setProduct(res.data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [pid]);

  const increaseQuantity = () => {
    if (product && selectedQuantity < product.quantity) {
      setSelectedQuantity((prevQuantity) => prevQuantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, selectedQuantity);
      
      // Update the product level to reflect the new quantity
      setProduct(prevProduct => ({
        ...prevProduct,
        quantity: prevProduct.quantity - selectedQuantity
      }));
      
      alert(`Added ${selectedQuantity} ${selectedQuantity > 1 ? 'units' : 'unit'} of ${product.productname} to cart`);
      setSelectedQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return <div className="text-center mt-10">{error || 'Product not found'}</div>;
  }

  return (
    <div className="bg-gray-200 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex justify-center py-8 bg-gray-200">
          {product.image ? (
            <img
              src={`http://localhost:4000/${product.image}`}
              alt={product.productname}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = assets.noImage;
              }}
              className="rounded-lg shadow-md w-72 h-72 object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-72 h-72 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
        <div className="text-center pt-6 pb-2">
          <h1 className="text-3xl font-bold text-gray-800">{product.productname}</h1>
          <p className="mt-2 text-2xl font-semibold text-gray-700">${product.price}</p>
        </div>
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{product.category}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Condition</p>
              <p className="font-medium">{product.condition}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-500">In Stock</p>
              <p className="font-medium">{product.quantity} units</p>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          {product.guidance && (
            <div className="mb-6 p-4 bg-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Guidance</h2>
              <p className="text-gray-700">{product.guidance}</p>
            </div>
          )}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-l-lg transition-colors"
                onClick={decreaseQuantity}
                disabled={Boolean(selectedQuantity <= 1)}
              >
                -
              </button>
              <span className="px-6 py-2 font-medium">{selectedQuantity}</span>
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-r-lg transition-colors"
                onClick={increaseQuantity}
                disabled={Boolean(product && selectedQuantity >= product.quantity)}
              >
                +
              </button>
            </div>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-8 rounded-3xl transition-colors w-full sm:w-auto"
              onClick={handleAddToCart} 
              disabled={Boolean(product && product.quantity == 0)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;