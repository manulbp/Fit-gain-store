import { Button, Drawer, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { UserContext } from "../context/UserContext";

const SidebarContent = ({ navigate, toggleDrawer }) => (
  <div className="w-fit flex min-h-screen flex-col justify-start items-start p-4 bg-neutral-950">
    <div className="w-full text-white flex justify-start items-center">
      <Typography sx={{ color: 'white', fontSize: 16, mb: 2 }}>Admin Dashboard</Typography>
    </div>
    <Button
      hidden
      variant="contained"
      color="primary"
      sx={{ mb: 2, width: 200 }}
      onClick={() => {
        navigate("/admin");
        toggleDrawer && toggleDrawer(false)();
      }}
    >
      Dashboard
    </Button>
    <Button
      variant="contained"
      color="warning"
      sx={{ mb: 2, width: 200 }}
      onClick={() => {
        navigate("/admin/users");
        toggleDrawer && toggleDrawer(false)();
      }}
    >
      Users
    </Button>
    <Button
      variant="contained"
      color="secondary"
      sx={{ mb: 2, width: 200 }}
      onClick={() => {
        navigate("/admin/products");
        toggleDrawer && toggleDrawer(false)();
      }}
    >
      Products
    </Button>
    <Button
      variant="contained"
      color="error"
      sx={{ mb: 2, width: 200 }}
      onClick={() => {
        navigate("/admin/checkouts");
        toggleDrawer && toggleDrawer(false)();
      }}
    >
      Checkouts
    </Button>
    <Button
      variant="contained"
      color="success"
      sx={{ mb: 2, width: 200 }}
      onClick={() => {
        navigate("/admin/payments");
        toggleDrawer && toggleDrawer(false)();
      }}
    >
      Payments
    </Button>
    <Button
      variant="contained"
      color="warning"
      sx={{ mb: 2, width: 200 }}
      onClick={() => {
        navigate("/admin/refunds");
        toggleDrawer && toggleDrawer(false)();
      }}
    >
      Refunds
    </Button>
    <Button
      variant="contained"
      color="info"
      sx={{ mb: 2, width: 200 }}
      onClick={() => {
        navigate("/admin/customer-support");
        toggleDrawer && toggleDrawer(false)();
      }}
    >
      Customer Support
    </Button>
  </div>
);

const AdminLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { User } = useContext(UserContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = User.user || User.admin;
  const admin = user?.role === 'admin';

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  if (!admin) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <Header toggleAdminSidebar={toggleDrawer} />
      <div className="w-full flex justify-start items-start relative">
        <div className=" hidden lg:flex">
          <div className="w-fit min-h-screen hidden lg:flex flex-col justify-start items-start sticky top-24 left-0 z-10">
            <SidebarContent navigate={navigate} />
          </div>
        </div>
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <SidebarContent navigate={navigate} toggleDrawer={toggleDrawer} />
        </Drawer>
        <div className="w-full flex justify-start items-start">
          <div className="container mx-auto px-2">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;