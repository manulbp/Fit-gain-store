import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditProduct = () => {
  const { pid } = useParams();
  // const [searchParams] = useSearchParams();
  // const pid = searchParams.get("id");
  console.log("pid",pid)
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    productname: '',
    description: '',
    category: '',
    condition: '',
    quantity: '',
    price: '',
    guidance: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Fetch the product data for the given product ID (pid)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/product/get/${pid}`);
        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await res.json();
        setProduct(data.product);
        
        // Set the current image path for display
        if (data.product.image) {
          setCurrentImage(`http://localhost:4000/${data.product.image}`);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [pid]);

  // Handle image file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImage(selectedFile);
      // Create a preview URL for the selected image
      const previewURL = URL.createObjectURL(selectedFile);
      setImagePreview(previewURL);
    }
  };

  // Handle form submission to update the product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      // Create FormData object to send both text fields and file
      const formData = new FormData();
      formData.append('productname', product.productname);
      formData.append('description', product.description);
      formData.append('category', product.category);
      formData.append('condition', product.condition);
      formData.append('quantity', product.quantity);
      formData.append('price', product.price);
      formData.append('guidance', product.guidance || '');
      
      // Only append image if a new one was selected
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch(`http://localhost:4000/api/product/update/${pid}`, {
        method: 'PUT',
        body: formData, // Send FormData instead of JSON
      });

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      // After successful update, navigate back to the product list
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="max-w-8xl mx-auto mt-10 p-10 bg-gray-200 min-h-screen rounded-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">Edit Product Details</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" htmlFor="image">Product Image</label>
            
            {/* Current image preview */}
            {(currentImage || imagePreview) && (
              <div className="mb-3">
                <p className="text-sm mb-2">Current Image:</p>
                <img 
                  src={imagePreview || currentImage} 
                  alt="Product preview" 
                  className="w-40 h-40 object-cover rounded-md shadow-sm border border-gray-300"
                />
              </div>
            )}
            
            {/* Image upload input */}
            <input
              type="file"
              id="image"
              onChange={handleFileChange}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200"
            />
            <p className="text-xs text-gray-500 mt-1">Upload a new image to replace the current one (optional)</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold" htmlFor="productname">Product Name</label>
            <input
              type="text"
              id="productname"
              value={product.productname}
              onChange={(e) => setProduct({ ...product, productname: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold" htmlFor="description">Description</label>
            <textarea
              id="description"
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold" htmlFor="category">Category</label>
            <select
              id="category"
              value={product.category}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="">Select</option>
              <option value="Equipment">Equipment</option>
              <option value="Supplement">Supplement</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold" htmlFor="condition">Condition</label>
            <select
              id="condition"
              value={product.condition}
              onChange={(e) => setProduct({ ...product, condition: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="">Select</option>
              <option value="New">Brand-new</option>
              <option value="Used">Secondhand</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold" htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={product.quantity}
              onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold" htmlFor="price">Price</label>
            <input
              type="number"
              id="price"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold" htmlFor="guidance">Guidance</label>
            <textarea
              id="guidance"
              value={product.guidance}
              onChange={(e) => setProduct({ ...product, guidance: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="mt-6 text-center">
            <button 
              type="submit" 
              className={`bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800 ${submitLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={submitLoading}
            >
              {submitLoading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
