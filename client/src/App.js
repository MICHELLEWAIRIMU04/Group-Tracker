import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import CSS
import './assets/styles/main.css';
import './assets/styles/GroupStyles.css';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import Contributions from './pages/Contributions';
import MembersList from './pages/MembersList';
import MemberDetails from './pages/MemberDetails';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import GroupActivityDetail from './pages/GroupActivityDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <>
              <Header />
              <main className="main-content">
                <div style={{ width: '100%' }}>
                  <Home />
                </div>
              </main>
              <Footer />
              <ThemeToggle />
            </>
          } />
          
          <Route path="/about" element={
            <>
              <Header />
              <main className="main-content">
                <div style={{ width: '100%' }}>
                  <About />
                </div>
              </main>
              <Footer />
              <ThemeToggle />
            </>
          } />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with sidebar */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="app-container">
                <Header />
                <div className="main-content">
                  <Sidebar />
                  <div className="content-area">
                    <Dashboard />
                  </div>
                </div>
                <Footer />
                <ThemeToggle />
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/activities" element={
            <ProtectedRoute>
              <div className="app-container">
                <Header />
                <div className="main-content">
                  <Sidebar />
                  <div className="content-area">
                    <Activities />
                  </div>
                </div>
                <Footer />
                <ThemeToggle />
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/activities/:id" element={
            <ProtectedRoute>
              <div className="app-container">
                <Header />
                <div className="main-content">
                  <Sidebar />
                  <div className="content-area">
                    <ActivityDetail />
                  </div>
                </div>
                <Footer />
                <ThemeToggle />
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/contributions" element={
            <ProtectedRoute>
              <div className="app-container">
                <Header />
                <div className="main-content">
                  <Sidebar />
                  <div className="content-area">
                    <Contributions />
                  </div>
                </div>
                <Footer />
                <ThemeToggle />
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/members" element={
            <ProtectedRoute>
              <div className="app-container">
                <Header />
                <div className="main-content">
                  <Sidebar />
                  <div className="content-area">
                    <MembersList />
                  </div>
                </div>
                <Footer />
                <ThemeToggle />
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/members/:id" element={
            <ProtectedRoute>
              <div className="app-container">
                <Header />
                <div className="main-content">
                  <Sidebar />
                  <div className="content-area">
                    <MemberDetails />
                  </div>
                </div>
                <Footer />
                <ThemeToggle />
              </div>
            </ProtectedRoute>
          } />
          
          {/* Group routes */}
          <Route path="/groups" element={
            <ProtectedRoute>
              <div className="app-container">
                <Header />
                <div className="main-content">
                  <Sidebar />
                  <div className="content-area">
                    <Groups />
                  </div>
                </div>
                <Footer />
                <ThemeToggle />
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/groups/:id" element={
            <ProtectedRoute>
              <div className="app-container">
                <Header />
                <div className="main-content">
                  <Sidebar />
                  <div className="content-area">
                    <GroupDetail />
                  </div>
                </div>
                <Footer />
                <ThemeToggle />
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/groups/:groupId/activities/:activityId" element={
            <ProtectedRoute>
              <div className="app-container">
                <Header />
                <div className="main-content">
                  <Sidebar />
                  <div className="content-area">
                    <GroupActivityDetail />
                  </div>
                </div>
                <Footer />
                <ThemeToggle />
              </div>
            </ProtectedRoute>
          } />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;