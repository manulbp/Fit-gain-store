import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { assets } from '../../assets/assets';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc or desc
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:4000/api/product/all');
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await res.json();
      console.log('API Response:', data); // Debug log
      // Ensure products is an array
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // Delete product
  const deleteProduct = async (pid) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/product/delete/${pid}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete product');
      }
      setProducts(products.filter((product) => product._id !== pid));
      alert('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      alert('Failed to delete product');
    }
  };

  // Generate PDF report
  const generateReport = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Product Report', 20, 20);
    let yPosition = 30;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(12);
      doc.text(`Product #${i + 1}`, 20,yPosition);
      yPosition += 10;
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      if (product.image) {
        try {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = `http://localhost:4000/${product.image}`;
          });
          const imgWidth = 60;
          const imgHeight = 60;
          doc.addImage(img, 'JPEG', 20, yPosition, imgWidth, imgHeight);
          const textX = 90;
          let textY = yPosition + 5;
          doc.text(`Name: ${product.productname}`, textX, textY);
          textY += 8;
          doc.text(`Category: ${product.category}`, textX, textY);
          textY += 8;
          doc.text(`Condition: ${product.condition}`, textX, textY);
          textY += 8;
          doc.text(`Quantity: ${product.quantity}`, textX, textY);
          textY += 8;
          doc.text(`Price: $${product.price}`, textX, textY);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error('Error loading image:', error);
          doc.text(`Name: ${product.productname}`, 20, yPosition);
          yPosition += 8;
        }
      } else {
        doc.text(`Name: ${product.productname}`, 20, yPosition);
        yPosition += 8;
      }

      doc.text(`Description:`, 20, yPosition);
      yPosition += 8;
      const splitDescription = doc.splitTextToSize(product.description, 170);
      doc.text(splitDescription, 20, yPosition);
      yPosition += splitDescription.length * 7;

      if (product.guidance) {
        doc.text(`Guidance:`, 20, yPosition);
        yPosition += 8;
        const splitGuidance = doc.splitTextToSize(product.guidance, 170);
        doc.text(splitGuidance, 20, yPosition);
        yPosition += splitGuidance.length * 7;
      }

      yPosition += 15;
    }

    doc.save('product_report.pdf');
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Sort and filter products
  const sortedAndFilteredProducts = products
    .filter(
      (product) =>
        product.productname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    );

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <div className="max-w-8xl mx-auto mt-10 p-10 bg-gray-200 min-h-screen rounded-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">Product List</h1>

        {/* Search and Sort */}
        <div className="flex justify-between mb-6 gap-4">
          <input
            type="text"
            placeholder="Search by name or category"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/2 p-2 border rounded-md"
          />
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Sort by Price ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
          </button>
          <button
            onClick={generateReport}
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Generate Report
          </button>
          <button
            onClick={() => navigate('/admin/products/add-product')}
            className="bg-black text-white py-2 px-4 rounded hover:bg-gray-500"
          >
            Add New Product
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedAndFilteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-md p-4  shadow-sm hover:shadow-lg transition"
            >
              {product.image && (
                <div className="mb-3 flex justify-center">
                  <img
                    src={`http://localhost:4000/${product.image}`}
                    alt={product.productname}
                    className="w-40 h-40 object-cover rounded-md shadow border border-gray-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = assets.noImage;
                    }}
                  />
                </div>
              )}
              <h2 className="text-xl font-bold mb-2 text-center">{product.productname}</h2>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-gray-500 mb-1">Category: {product.category}</p>
              <p className="text-gray-500 mb-1">Condition: {product.condition}</p>
              <p className="text-gray-500 mb-1">Quantity: {product.quantity}</p>
              <p className="text-gray-500 mb-1">Price: ${product.price}</p>
              {product.guidance && (
                <p className="text-gray-500 text-sm italic mt-2">{product.guidance}</p>
              )}
              <div className="mt-4 flex space-x-2">
                <button
                  className="bg-gray-400 text-white font-semibold py-2 px-6 rounded-3xl shadow hover:bg-gray-500 transition-all duration-200"
                  onClick={() => navigate(`/admin/product/view/${product._id}`)}
                >
                  View
                </button>
                <button
                  className="bg-gray-500 text-white font-semibold py-2 px-6 rounded-3xl shadow hover:bg-gray-600 transition-all duration-200"
                  onClick={() => navigate(`/admin/product/edit/${product._id}`)}
                >
                  Edit
                </button>
                <button
                  className="bg-gray-600 text-white font-semibold py-2 px-6 rounded-3xl shadow hover:bg-gray-700 transition-all duration-200"
                  onClick={() => deleteProduct(product._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;