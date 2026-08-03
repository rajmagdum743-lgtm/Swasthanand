import { useState, useEffect } from 'react';
import Header from './components/common/Header';
import CartDrawer from './components/cart/CartDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import LoginModal from './components/auth/LoginModal';
import TraceOriginModal from './components/traceability/TraceOriginModal';
import { useAuth } from './hooks/useAuth';
import { useProducts } from './context/ProductContext';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import ContactPage from './components/pages/ContactPage';
import RecommendationPage from './components/pages/RecommendationPage';
import TraceabilityPage from './components/pages/TraceabilityPage';
import HowItWorksPage from './components/pages/HowItWorksPage';

// Admin layout and pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDealers from './pages/admin/AdminDealers';
import AdminCustomers from './pages/admin/AdminCustomers';

// Dealer layout and pages
import DealerLayout from './layouts/DealerLayout';
import DealerDashboard from './pages/dealer/DealerDashboard';
import DealerInventory from './pages/dealer/DealerInventory';
import DealerOrders from './pages/dealer/DealerOrders';
import DealerTraceability from './pages/dealer/DealerTraceability';
import DealerLifecycle from './pages/dealer/DealerLifecycle';
import DealerNotifications from './pages/dealer/DealerNotifications';
import DealerProfile from './pages/dealer/DealerProfile';

function App() {
  const { isAuthenticated, user } = useAuth();
  const { products, categories } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register' | 'dealer' | 'admin'>('login');
  const location = useLocation();
  const navigate = useNavigate();

  const [traceData, setTraceData] = useState<{ isOpen: boolean; product: any | null }>({ isOpen: false, product: null });

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Route protection logic (prevents unauthorized access without overriding public website browsing)
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'CUSTOMER') {
        if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dealer')) {
          navigate('/', { replace: true });
        }
      } else if (user?.role === 'ADMIN' && location.pathname.startsWith('/dealer')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.role === 'DEALER' && location.pathname.startsWith('/admin')) {
        navigate('/dealer/dashboard', { replace: true });
      }
    } else {
      // Unauthenticated access protection: allow /admin to render AdminLoginForm, redirect /dealer to homepage
      if (location.pathname.startsWith('/dealer')) {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  const handleCheckoutToggle = () => {
    setIsCartOpen(false);
    if (isAuthenticated) {
      setIsCheckoutOpen(true);
    } else {
      setLoginModalMode('login');
      setIsLoginOpen(true);
    }
  };

  const handleTraceOpen = (product: any) => {
    setTraceData({ isOpen: true, product });
  };

  const isDealerRoute = location.pathname.startsWith('/dealer');
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Dealer routes render completely standalone — no public shell wrapper
  if (isDealerRoute) {
    return (
      <Routes>
        <Route path="/dealer/*" element={<DealerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DealerDashboard />} />
          <Route path="inventory" element={<DealerInventory />} />
          <Route path="orders" element={<DealerOrders />} />
          <Route path="traceability" element={<DealerTraceability />} />
          <Route path="lifecycle" element={<DealerLifecycle />} />
          <Route path="notifications" element={<DealerNotifications />} />
          <Route path="profile" element={<DealerProfile />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    );
  }

  // Admin routes render completely standalone — no public shell wrapper
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="dealers" element={<AdminDealers />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="login" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    );
  }

  // Public site shell
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => { setLoginModalMode('login'); setIsLoginOpen(true); }}
        onOpenRegister={() => { setLoginModalMode('register'); setIsLoginOpen(true); }}
        onOpenDealerLogin={() => { setLoginModalMode('dealer'); setIsLoginOpen(true); }}
        onOpenAdminLogin={() => { setLoginModalMode('admin'); setIsLoginOpen(true); }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckoutToggle}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        initialMode={loginModalMode}
      />
      <TraceOriginModal
        isOpen={traceData.isOpen}
        onClose={() => setTraceData({ ...traceData, isOpen: false })}
        product={traceData.product}
      />

      <main>
        <Routes>
          <Route path="/" element={
            <HomePage
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              handleTraceOpen={handleTraceOpen}
            />
          } />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/recommend" element={<RecommendationPage />} />
          <Route path="/traceability" element={<TraceabilityPage />} />
          <Route path="/traceability/:batchId" element={<TraceabilityPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
        </Routes>
      </main>

      <footer className="bg-slate-900 text-white py-24 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center p-2 mb-6">
                <img src="/logo.png" alt="Swasthanand" className="w-full h-full object-contain grayscale brightness-200" />
              </div>
              <span className="text-3xl font-black">Swasthanand</span>
            </div>
            <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">
              Empowering farmers through technology and bringing pure, traceable food to your table.
            </p>
          </div>
          <div>
            <h4 className="text-emerald-500 font-bold uppercase tracking-wider mb-8">Quick Links</h4>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><a href="/" className="hover:text-white transition-colors">Our Farms</a></li>
              <li><a href="/traceability" className="hover:text-white transition-colors">Traceability Report</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Become a Partner</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-emerald-500 font-bold uppercase tracking-wider mb-8">Support</h4>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><a href="/" className="hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-800 text-slate-500 font-medium flex justify-between">
          <p>© 2024 Swasthanand. All rights reserved.</p>
          <p>Handcrafted with love for the Earth.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
