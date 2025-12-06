import { useState, useEffect } from 'react';
import { getPatientData, getPatientAppointments, getPatientTestResults } from '../services/api';
import ChatbotWidget from '../components/ChatbotWidget';

const PatientDashboard = () => {
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const data = await getPatientData(user.id);
        const apps = await getPatientAppointments(user.id);
        const tests = await getPatientTestResults(user.id);
        
        setPatientData(data);
        setAppointments(apps);
        setTestResults(tests);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-medical-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const recentTests = testResults.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {patientData?.name || 'Patient'}!
        </h2>
        <p className="text-medical-blue-100">
          Here's an overview of your health information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Upcoming Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Recent Test Results</p>
              <p className="text-3xl font-bold text-gray-900">{testResults.length}</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔬</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Medical Records</p>
              <p className="text-3xl font-bold text-gray-900">{patientData?.medicalHistory?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-medical-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{apt.doctor}</p>
                      <p className="text-sm text-gray-600">{apt.reason}</p>
                    </div>
                    <span className="px-2 py-1 bg-medical-blue-100 text-medical-blue-700 text-xs rounded-full">
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📅 {apt.date}</span>
                    <span>🕐 {apt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming appointments</p>
          )}
        </div>

        {/* Recent Test Results */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Test Results</h3>
          {recentTests.length > 0 ? (
            <div className="space-y-4">
              {recentTests.map((test) => (
                <div
                  key={test.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{test.testType}</p>
                      <p className="text-sm text-gray-600">Date: {test.date}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        test.status === 'normal'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>Value: <span className="font-semibold">{test.value}</span></p>
                    {test.normalRange && (
                      <p className="text-gray-500">Normal Range: {test.normalRange}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No test results available</p>
          )}
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default PatientDashboard;

