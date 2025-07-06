import { useContext, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { UserContext } from './context/UserContext';
import AdminLayout from './Layouts/AdminLayout';
import MainLayout from './Layouts/MainLayout';
import AboutUs from './pages/AboutUs';
import AddCheckout from './pages/AddCheckout';
import AddProduct from './pages/Admin/AddProduct';
import AdminLogIn from './pages/Admin/AdminLogIn';
import AdminPaymentTable from './pages/Admin/AdminPaymentTable';
import AdminRefundPanel from './pages/Admin/AdminRefundPanel';
import AllUsers from './pages/Admin/AllUsers';
import CheckoutReview from './pages/Admin/CheckoutReview';
import CustomerSupport from './pages/Admin/CustomerSupport';
import EditProduct from './pages/Admin/EditProduct';
import ProductList from './pages/Admin/ProductList';
import ViewProduct from './pages/Admin/ViewProduct';
import Cart from './pages/Cart';
import Checkouts from './pages/Checkouts';
import ContactUs from './pages/ContactUs';
import Home from './pages/Home';
import LogIn from './pages/LogIn';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import Reviews from './pages/Reviews';
import Shop from './pages/Shop';
import TransactionHistory from './pages/TransactionHistory';
import UserPaymentForm from './pages/UserPaymentForm';
import { setUserHeaders } from './services/api';
import AdminTicket from './components/Panels/AdminTicket';
import AdminChat from './components/Panels/AdminChat';

export default function App() {
  const { User } = useContext(UserContext);
  const isAuthenticated = User.user || User.admin;
  const isAdmin = User.admin && User.admin.role === 'admin';

  useEffect(() => {
    const activeUser = User.user || User.admin;
    if (activeUser) {
      setUserHeaders(activeUser);
    }
  }, [User]);

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:pid" element={<ProductDetail />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/admin-login" element={<AdminLogIn />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {isAuthenticated && (
            <>
              <Route path="/add-checkout" element={<AddCheckout />} />
              <Route path="/checkout" element={<Checkouts />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/history" element={<TransactionHistory />} />
              <Route path="/payment" element={<UserPaymentForm />} />
            </>
          )}
        </Route>

        {isAdmin && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AllUsers />} />
            <Route path="users" element={<AllUsers />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/add-product" element={<AddProduct />} />
            <Route path="product/view/:pid" element={<ViewProduct />} />
            <Route path="product/edit/:pid" element={<EditProduct />} />
            <Route path="payments" element={<AdminPaymentTable />} />
            <Route path="checkouts" element={<CheckoutReview />} />
            <Route path="refunds" element={<AdminRefundPanel />} />
            <Route path="customer-support" element={<CustomerSupport />} >
              <Route index element={<AdminTicket />} />
              <Route path="ticket" element={<AdminTicket />} />
              <Route path="chat" element={<AdminChat />} />
            </Route>
          </Route>
        )}
      </Routes>
    </Router>
  );
}