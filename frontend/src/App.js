import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Notifications from './pages/Notifications';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardListings from './pages/dashboard/DashboardListings';
import Analytics from './pages/dashboard/Analytics';
import Sales from './pages/dashboard/Sales';

// Protected Route Component
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <Loading fullScreen />;
    }
    
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify-email" element={<VerifyEmail />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/listings" element={<Listings />} />
                            <Route path="/listings/:id" element={<ListingDetail />} />
                            
                            {/* Protected Routes */}
                            <Route 
                                path="/profile" 
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/orders" 
                                element={
                                    <ProtectedRoute>
                                        <Orders />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/notifications" 
                                element={
                                    <ProtectedRoute>
                                        <Notifications />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/payment" 
                                element={
                                    <ProtectedRoute>
                                        <Payment />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/payment-success" 
                                element={
                                    <ProtectedRoute>
                                        <PaymentSuccess />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/dashboard" 
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/dashboard/listings" 
                                element={
                                    <ProtectedRoute>
                                        <DashboardListings />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/listings/create" 
                                element={
                                    <ProtectedRoute>
                                        <CreateListing />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/dashboard/analytics" 
                                element={
                                    <ProtectedRoute>
                                        <Analytics />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/dashboard/sales" 
                                element={
                                    <ProtectedRoute>
                                        <Sales />
                                    </ProtectedRoute>
                                } 
                            />
                            
                            {/* 404 */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;
