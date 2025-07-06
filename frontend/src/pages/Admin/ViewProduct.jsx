import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ViewProduct = () => {
  const { pid } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/api/product/get/${pid}`);
        const data = await res.json();
        setProduct(data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [pid]);


  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  if (!product) return <div className="text-center mt-10">Product not found</div>;

  return (
    <div className="bg-gray-200 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Centered Product Image */}
        <div className="flex justify-center py-8 bg-gray-200">
          {product.image ? (
            <img
              src={`http://localhost:4000/${product.image}`}
              alt={product.productname}
              className="rounded-lg shadow-md w-72 h-72 object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-72 h-72 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Centered Product Name */}
        <div className="text-center pt-6 pb-2">
          <h1 className="text-3xl font-bold text-gray-800">{product.productname}</h1>
          <p className="mt-2 text-2xl font-semibold text-gray-700">${product.price}</p>
        </div>

        {/* Product Details */}
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

        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
