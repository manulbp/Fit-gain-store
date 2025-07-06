import React, { useState, useEffect } from 'react';
import './Product.css';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    productname: '',
    description: '',
    category: '',
    condition: '',
    quantity: '',
    price: '',
    guidance: '',
    image: null,
    imagePreview: null,
  });

  useEffect(() => {
    return () => {
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setFormData({ ...formData, image: file, imagePreview: previewURL });
    } else {
      setFormData({ ...formData, image: null, imagePreview: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (!formData.productname || !formData.description || !formData.category || !formData.quantity || !formData.price || !formData.image) {
      setErrorMessage('All required fields, including image, must be filled');
      setLoading(false);
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      setErrorMessage('Quantity must be a positive number');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setErrorMessage('Price must be a positive number');
      setLoading(false);
      return;
    }

    const productData = new FormData();
    productData.append('productname', formData.productname);
    productData.append('description', formData.description);
    productData.append('category', formData.category);
    productData.append('condition', formData.condition || 'New');
    productData.append('quantity', parseInt(formData.quantity));
    productData.append('price', parseFloat(formData.price));
    productData.append('guidance', formData.guidance || '');
    productData.append('image', formData.image);

    try {
      const res = await fetch('http://localhost:4000/api/product/add', {
        method: 'POST',
        body: productData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add product');
      }

      navigate('/admin', { state: { newProduct: { ...formData, image: data.product.image } } });
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto mt-12 px-6 py-10 bg-gray-300 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-8">Add a New Product</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Product Image</label>
            <input
              type="file"
              id="image"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200"
              required
            />
            {formData.imagePreview && (
              <img
                src={formData.imagePreview}
                alt="Preview"
                className="mt-4 rounded shadow-md w-40 h-40 object-cover"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product name:</label>
            <input
              type="text"
              name="productname"
              placeholder="Enter product name"
              value={formData.productname}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product description:</label>
            <textarea
              name="description"
              rows="6"
              placeholder="Enter your description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product category:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">Select</option>
              <option value="Equipment">Equipment</option>
              <option value="Supplement">Supplement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product condition:</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">Select</option>
              <option value="New">Brand-new</option>
              <option value="Used">Secondhand</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inventory level:</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product price:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nutritional guidance (regarding supplements):</label>
            <textarea
              name="guidance"
              rows="6"
              placeholder="Type here"
              value={formData.guidance}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            ></textarea>
          </div>

          {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-lg text-white font-medium transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-800'
            }`}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
