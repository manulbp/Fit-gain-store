import { Avatar, Badge, Button, Divider, Drawer, IconButton, List, ListItem, ListItemText, Popover } from '@mui/material';
import { AlignLeft, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import AuthModal from './AuthModal';
import SearchhModal from './SearchhModal';

const Header = ({ toggleAdminSidebar }) => {
  const { User, logoutUser } = useContext(UserContext);
  const { cartCount } = useContext(CartContext);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutUser();
    handleProfileClose();
    setDrawerOpen(false);
    navigate('/');
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const user = User.user || User.admin;
  const admin = user?.role === 'admin';

  const drawerContent = (
    <div className="w-64 h-full bg-white flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <Link to={!admin ? "/" : "/admin"}>
          <h1 className="font-bold text-gray-800 text-3xl"><i>FIT-GAIN</i></h1>
        </Link>
        <IconButton onClick={toggleDrawer(false)}><X size={20} /></IconButton>
      </div>
      <List>
        {!admin && (
          <>
            <ListItem button onClick={() => { navigate('/'); setDrawerOpen(false); }}>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/shop'); setDrawerOpen(false); }}>
              <ListItemText primary="Shop" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/contact'); setDrawerOpen(false); }}>
              <ListItemText primary="Contact Us" />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => { setOpenSearchModal(true); setDrawerOpen(false); }}>
              <ListItemText primary="Search" />
            </ListItem>
          </>
        )}
        {user && !admin && (
          <ListItem button onClick={() => { navigate('/cart'); setDrawerOpen(false); }}>
            <ListItemText primary="Cart" />
            <Badge badgeContent={cartCount} color="error" sx={{ ml: 2 }}>
              <ShoppingBag size={20} />
            </Badge>
          </ListItem>
        )}
        <Divider />
        {user ? (
          <>
            <ListItem>
              <div className="flex items-center gap-2">
                <Avatar className="!bg-neutral-600">{user.name.charAt(0).toUpperCase()}</Avatar>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-neutral-700 capitalize">{user.name}</span>
                  {admin && <span className="text-sm text-neutral-500 capitalize">Admin</span>}
                </div>
              </div>
            </ListItem>
            {!admin && (
              <>
                <ListItem button onClick={() => { navigate('/profile'); setDrawerOpen(false); }}>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem button onClick={() => { navigate('/checkout'); setDrawerOpen(false); }}>
                  <ListItemText primary="Checkout" />
                </ListItem>
                <ListItem button onClick={() => { navigate('/history'); setDrawerOpen(false); }}>
                  <ListItemText primary="History" />
                </ListItem>
              </>
            )}
            {admin && (
              <ListItem button onClick={() => { navigate('/admin'); setDrawerOpen(false); }}>
                <ListItemText primary="Admin Dashboard" />
              </ListItem>
            )}
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={() => { setOpenAuthModal(true); setDrawerOpen(false); }}>
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <header className="bg-gray-400 shadow-sm sticky top-0 left-0 z-20">
      <div className="flex justify-between items-center max-w-6xl mx-auto py-5 px-2">
        <div className="w-fit flex justify-start items-center gap-2">
          {admin && (
            <IconButton className="!flex lg:!hidden" onClick={() => toggleAdminSidebar?.(true)()}>
              <AlignLeft size={20} />
            </IconButton>
          )}
          <Link to={!admin ? "/" : "/admin"}>
            <h1 className="font-bold text-gray-800 text-2xl">FIT-GAIN</h1>
          </Link>
        </div>
        <div className="flex justify-end items-center gap-8">
          <IconButton className="md:!hidden" onClick={toggleDrawer(true)}>
            <Menu size={24} />
          </IconButton>
          <ul className="hidden lg:flex gap-6 items-center text-base text-gray-800">
            {!admin && (
              <>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </>
            )}
          </ul>
          {!admin && (
            <p className="hidden lg:block">|</p>
          )}
          <div className="hidden lg:flex justify-end items-center gap-4 relative">
            {!admin && (
              <IconButton onClick={() => setOpenSearchModal(true)}><Search size={20} /></IconButton>
            )}
            {user && !admin && (
              <IconButton onClick={() => navigate('/cart')}>
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingBag size={20} />
                </Badge>
              </IconButton>
              
            )}
            {user ? (
              <div>
                <div className="flex justify-start items-center gap-2 cursor-pointer" onClick={handleProfileClick}>
                  <Avatar className="!bg-neutral-600">{user.name.charAt(0).toUpperCase()}</Avatar>
                  <div className="flex flex-col justify-start items-start gap-0">
                    <p className="text-base font-bold text-neutral-700 capitalize mt-1">{user.name}</p>
                    {admin && <p className="text-sm font-normal text-neutral-500 capitalize -mt-2">Admin</p>}
                  </div>
                </div>
                <Popover
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={handleProfileClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    style: {
                      width: '128px',
                      backgroundColor: 'white',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                      borderRadius: '4px',
                    },
                  }}
                >
                  <div className="w-full flex flex-col gap-2 justify-center items-center p-2">
                    {!admin && (
                      <>
                        <Button variant="text" className="!text-neutral-700 !capitalize" onClick={() => { navigate("/profile"); handleProfileClose(); }} fullWidth>
                          Profile
                        </Button>
                        <Button variant="text" className="!text-neutral-700 !capitalize" onClick={() => { navigate("/checkout"); handleProfileClose(); }} fullWidth>
                          Checkout
                        </Button>
                        <Button variant="text" className="!text-neutral-700 !capitalize" onClick={() => { navigate("/history"); handleProfileClose(); }} fullWidth>
                          History
                        </Button>
                      </>
                    )}
                    {admin && (
                      <Button variant="text" className="!text-neutral-700 !capitalize" onClick={() => { navigate("/admin"); handleProfileClose(); }} fullWidth>
                        Admin Dashboard
                      </Button>
                    )}
                    <Button variant="text" className="!text-red-500 !capitalize" onClick={handleLogout} fullWidth>
                      Logout
                    </Button>
                  </div>
                </Popover>
              </div>
            ) : (
              <Button variant="contained" className="!bg-neutral-700 !text-white !capitalize" onClick={() => setOpenAuthModal(true)}>
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
      <AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
      <SearchhModal open={openSearchModal} onClose={() => setOpenSearchModal(false)} />
    </header>
  );
};

export default Header;