import { useState, useEffect } from 'react';
import { getAdminStats, getAllPatients, getAllAppointments } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const statsData = await getAdminStats();
      const patientsData = await getAllPatients();
      const appointmentsData = await getAllAppointments();
      
      setStats(statsData);
      setPatients(patientsData);
      setAppointments(appointmentsData);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-medical-blue-100">
          System overview and management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalPatients || 0}</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Doctors</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalDoctors || 0}</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Upcoming Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.upcomingAppointments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.completedAppointments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Appointments</h3>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-medical-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{apt.patientName}</p>
                      <p className="text-sm text-gray-600">with {apt.doctorName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      apt.status === 'upcoming' 
                        ? 'bg-medical-blue-100 text-medical-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
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
            <p className="text-gray-500">No appointments</p>
          )}
        </div>

        {/* Patient List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">All Patients</h3>
          {patients.length > 0 ? (
            <div className="space-y-3">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-medical-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {patient.age} years
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span>📍 {patient.address}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No patients</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

