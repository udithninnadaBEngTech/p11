import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import LessonPage from './pages/LessonPage';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function OwnerRoute({ children }) {
  const { isOwner } = useAuth();
  return isOwner ? children : <Navigate to="/" />;
}

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/dashboard"
          element={
            <OwnerRoute>
              <Dashboard />
            </OwnerRoute>
          }
        />
        <Route
          path="/subject/:id"
          element={
            <PrivateRoute>
              <SubjectPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/lesson/:id"
          element={
            <PrivateRoute>
              <LessonPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;