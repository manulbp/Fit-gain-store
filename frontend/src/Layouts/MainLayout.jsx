import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { UserContext } from "../context/UserContext";

const MainLayout = () => {
  const { pathname } = useLocation();
  const { User } = useContext(UserContext);
  const user = User.user || User.admin;
  const admin = user?.role === 'admin';
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  if (admin) {
    return (<Navigate to={"/admin"} replace />);
  }
  
  return (
    <div className="w-full min-h-screen bg-gray-100">
      <Header />
      <div className="w-full">
        <div className="container mx-auto px-2">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;