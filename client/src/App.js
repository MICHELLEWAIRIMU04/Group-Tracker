import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
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

// App Layout component
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" />
              </ProtectedRoute>
            }
          />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;