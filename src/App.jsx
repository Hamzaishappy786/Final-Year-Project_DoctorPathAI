import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import PublicHome from './pages/PublicHome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import DoctorDataEntry from './pages/DoctorDataEntry';
import KnowledgeGraphViewer from './pages/KnowledgeGraphViewer';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-medical-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout userRole={user.role} userName={user.name}>
      {children}
    </DashboardLayout>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Patient Routes */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Appointments</h2>
                <p className="text-gray-600">Appointment management page coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/medical-history"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Medical History</h2>
                <p className="text-gray-600">Medical history page coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/test-results"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Test Results</h2>
                <p className="text-gray-600">Test results page coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Patients</h2>
                <p className="text-gray-600">Patient management page coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Appointments</h2>
                <p className="text-gray-600">Appointment management page coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/diagnosis"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/data-entry"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDataEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/data-entry/:patientId"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDataEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/knowledge-graph/:patientId"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <KnowledgeGraphViewer />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Patient Management</h2>
                <p className="text-gray-600">Patient management page coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Doctor Management</h2>
                <p className="text-gray-600">Doctor management page coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Appointment Management</h2>
                <p className="text-gray-600">Appointment management page coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

