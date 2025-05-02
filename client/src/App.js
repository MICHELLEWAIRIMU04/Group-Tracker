import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import MembersList from './pages/MembersList';
import MemberDetails from './pages/MemberDetails';
import Activities from './pages/Activities';
import Contributions from './pages/Contributions';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// CSS
import './assets/styles/main.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// App Layout component (used for protected routes with sidebar)
const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="content-area">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Public Layout component (used for public pages without sidebar)
const PublicLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <div style={{ width: '100%' }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } />
          
          <Route path="/about" element={
            <PublicLayout>
              <About />
            </PublicLayout>
          } />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MembersList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/members/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MemberDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Activities />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contributions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Contributions />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;