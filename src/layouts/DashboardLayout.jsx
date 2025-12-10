import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUserProfile } from '../services/api';
import logo from '../logo.png';

const DashboardLayout = ({ children, userRole, userName: initialUserName }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState(initialUserName);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Update userName and profileImage from localStorage when location changes
  useEffect(() => {
    const updateUserData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name);
          
          // Try to get profile image from user profile
          try {
            const profile = await getUserProfile(user.id, user.role);
            if (profile?.profileImage) {
              setProfileImage(profile.profileImage);
            } else {
              setProfileImage(null);
            }
          } catch (err) {
            // If profile fetch fails, continue without image
            setProfileImage(null);
          }
        }
      } catch (error) {
        console.error('Error reading user data:', error);
      }
    };
    updateUserData();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = {
    patient: [
      { path: '/patient/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/patient/appointments', label: 'Appointments', icon: '📅' },
      { path: '/patient/medical-history', label: 'Medical History', icon: '📋' },
      { path: '/patient/test-results', label: 'Test Results', icon: '🔬' },
    ],
    doctor: [
      { path: '/doctor/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/doctor/patients', label: 'Patients', icon: '👥' },
      { path: '/doctor/appointments', label: 'Appointments', icon: '📅' },
      { path: '/doctor/diagnosis', label: 'Diagnosis Tool', icon: '🩺' },
      { path: '/doctor/data-entry', label: 'Data Entry', icon: '📝' },
    ],
  };

  const currentMenuItems = menuItems[userRole] || [];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-medical-blue-700 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="DoctorPath AI" className="h-8 w-8 rounded-lg object-contain" />
            <h1 className={`font-bold text-xl ${sidebarOpen ? 'block' : 'hidden'}`}>
              DoctorPath AI
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-medical-blue-600 rounded-lg"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {currentMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-medical-blue-600'
                      : 'hover:bg-medical-blue-600'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-medical-blue-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-medical-blue-600 transition-colors"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {currentMenuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            <Link
              to={`/${userRole}/profile`}
              className="flex items-center space-x-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-medical-blue-300"
                />
              ) : (
                <div className="w-10 h-10 bg-medical-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {userName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

