import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Grid, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { ProductCard } from '../components/ProductCard';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [sort, setSort] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/product/all');
        const productsData = response.data.products || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (category) {
      result = result.filter(product => product.category.toLowerCase() === category.toLowerCase());
    }

    if (condition) {
      result = result.filter(product => product.condition.toLowerCase() === condition.toLowerCase());
    }

    if (sort === 'lowToHigh') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'highToLow') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [category, condition, sort, products]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam && ['equipment', 'supplement'].includes(categoryParam.toLowerCase())) {
      setCategory(categoryParam.toLowerCase());
    }
  }, [location.search]);

  return (
    <Box className="flex flex-col min-h-screen bg-gray-200 px-6 py-8">
      <Box className="mb-6" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <FormControl sx={{ flex: 1 }} className="bg-white rounded-lg p-2">
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="equipment">Equipment</MenuItem>
            <MenuItem value="supplement">Supplement</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ flex: 1 }} className="bg-white rounded-lg p-2">
          <InputLabel>Condition</InputLabel>
          <Select
            value={condition}
            label="Condition"
            onChange={(e) => setCondition(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="new">Brand New</MenuItem>
            <MenuItem value="used">Secondary</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ flex: 1 }} className="bg-white rounded-lg p-2">
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sort}
            label="Sort By"
            onChange={(e) => setSort(e.target.value)}
          >
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="lowToHigh">Price: Low to High</MenuItem>
            <MenuItem value="highToLow">Price: High to Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Typography variant="h5" className="text-2xl font-semibold mb-6 text-gray-800">
        Shop
      </Typography>
      
      <div className="border-b border-gray-400 mb-8"></div>
      
      {filteredProducts.length === 0 ? (
        <Typography className="text-gray-500 text-center">No products found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
      
      <footer className="mt-12 p-4 text-center text-gray-500 text-sm border-t border-gray-400">
        © {new Date().getFullYear()} FitGear. All rights reserved.
      </footer>
    </Box>
  );
};

export default Shop;
