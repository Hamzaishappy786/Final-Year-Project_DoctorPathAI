import { useState, useEffect } from 'react';
import {
  getPatientData,
  getPatientAppointments,
  getPatientTestResults,
  getHospitals,
  getDoctorsByHospital,
  createDoctorRequest,
  getPatientDoctorRequests
} from '../services/api';
import ChatbotWidget from '../components/ChatbotWidget';

const PatientDashboard = () => {
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [patientRequests, setPatientRequests] = useState([]);
  const [requestNote, setRequestNote] = useState('');
  const [shareNote, setShareNote] = useState('');
  const [shareFile, setShareFile] = useState(null);
  const [shareFilePreview, setShareFilePreview] = useState(null);
  const [allowDataShare, setAllowDataShare] = useState(true);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setPatientId(user.id);
        const data = await getPatientData(user.id);
        const apps = await getPatientAppointments(user.id);
        const tests = await getPatientTestResults(user.id);
        const hospitalsList = await getHospitals();
        const requests = await getPatientDoctorRequests(user.id);
        
        setPatientData(data);
        setAppointments(apps);
        setTestResults(tests);
        setHospitals(hospitalsList);
        setPatientRequests(requests);

        if (hospitalsList.length > 0) {
          const defaultHospital = hospitalsList[0].name;
          setSelectedHospital(defaultHospital);
          const doctors = await getDoctorsByHospital(defaultHospital);
          setAvailableDoctors(doctors);
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleHospitalChange = async (value) => {
    setSelectedHospital(value);
    setSelectedDoctor('');
    const doctors = await getDoctorsByHospital(value);
    setAvailableDoctors(doctors);
  };

  const handleShareFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setRequestError('Please choose a file smaller than 15MB.');
      return;
    }

    setRequestError('');
    setShareFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setShareFilePreview(ev.target?.result || null);
    };
    reader.readAsDataURL(file);
  };

  const removeShareFile = () => {
    setShareFile(null);
    setShareFilePreview(null);
  };

  const handleDoctorRequestSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      setRequestError('Please log in again to continue.');
      return;
    }
    if (!selectedDoctor) {
      setRequestError('Please select a doctor to send your request.');
      return;
    }

    setRequestSubmitting(true);
    setRequestMessage('');
    setRequestError('');

    try {
      const dataShare = allowDataShare
        ? {
            allowDataShare: true,
            note: shareNote,
            fileName: shareFile?.name || null,
            fileSize: shareFile?.size || null,
            fileType: shareFile?.type || null,
            fileContent: shareFilePreview || null
          }
        : { allowDataShare: false };

      const result = await createDoctorRequest({
        patientId,
        doctorId: parseInt(selectedDoctor),
        hospital: selectedHospital,
        note: requestNote,
        dataShare
      });

      if (result.success) {
        setRequestMessage('Request sent to your selected doctor.');
        setPatientRequests((prev) => [result.request, ...prev]);
        setRequestNote('');
        setShareNote('');
        removeShareFile();
      } else {
        setRequestError(result.message || 'Unable to send request right now.');
      }
    } catch (err) {
      setRequestError('Failed to send request. Please try again.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-medical-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const recentTests = testResults.slice(0, 3);
  const sortedRequests = [...patientRequests].sort(
    (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
  );

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

      {/* Doctor Selection & Data Sharing */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Choose your doctor</h3>
              <p className="text-sm text-gray-600 mt-1">
                Pick a hospital, select your doctor, and share data with permission.
              </p>
            </div>
          </div>

          {requestMessage && (
            <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg">
              {requestMessage}
            </div>
          )}
          {requestError && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
              {requestError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleDoctorRequestSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital</label>
              <select
                value={selectedHospital}
                onChange={(e) => handleHospitalChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
              >
              {hospitals.map((hospital) => (
                <option key={hospital.branchCode} value={hospital.name}>
                  {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
              >
                <option value="">-- Select doctor --</option>
                {availableDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Filtered by the hospital you choose.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Request note</label>
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
                placeholder="Share your reason or preferred timing..."
              />
            </div>

            <div className="border border-dashed border-gray-300 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Share your data (optional)</p>
                  <p className="text-xs text-gray-500">
                    Upload reports so the doctor can review without re-entering.
                  </p>
                </div>
                <label className="cursor-pointer text-medical-blue-600 font-semibold text-sm">
                  Upload
                  <input type="file" className="hidden" onChange={handleShareFileChange} />
                </label>
              </div>

              {shareFile && (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded p-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{shareFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(shareFile.size / 1024 / 1024).toFixed(2)} MB • {shareFile.type || 'file'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-red-600 text-sm hover:underline"
                    onClick={removeShareFile}
                  >
                    Remove
                  </button>
                </div>
              )}

              <textarea
                value={shareNote}
                onChange={(e) => setShareNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none text-sm"
                placeholder="Add context about the data (e.g., MRI from Dec 2024)"
              />

              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={allowDataShare}
                  onChange={(e) => setAllowDataShare(e.target.checked)}
                  className="rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
                />
                <span>I allow this doctor to view the uploaded data</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={requestSubmitting}
              className="w-full bg-medical-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-medical-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {requestSubmitting ? 'Sending...' : 'Send doctor request'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Your doctor requests</h3>
              <p className="text-sm text-gray-600 mt-1">
                Track approvals, schedule changes, and data access.
              </p>
            </div>
          </div>

          {sortedRequests.length === 0 ? (
            <p className="text-gray-500 text-sm">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedRequests.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-medical-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{req.doctorName}</p>
                      <p className="text-xs text-gray-500">{req.hospital}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : req.status === 'declined'
                          ? 'bg-red-100 text-red-700'
                          : req.status === 'reschedule'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-medical-blue-100 text-medical-blue-700'
                      }`}
                    >
                      {req.status || 'pending'}
                    </span>
                  </div>
                  {req.note && <p className="text-sm text-gray-700 mb-2">{req.note}</p>}
                  {req.scheduleNote && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Doctor note:</span> {req.scheduleNote}
                    </p>
                  )}
                  {req.proposedSlot && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Proposed time:</span> {req.proposedSlot}
                    </p>
                  )}
                  {req.dataShare?.allowDataShare && (
                    <div className="mt-3 p-3 rounded-lg bg-medical-blue-50 border border-medical-blue-100">
                      <p className="text-sm font-semibold text-medical-blue-800 mb-1">
                        Data shared with doctor
                      </p>
                      {req.dataShare.note && (
                        <p className="text-xs text-medical-blue-900">{req.dataShare.note}</p>
                      )}
                      {req.dataShare.fileName && (
                        <div className="mt-2 text-xs text-medical-blue-900">
                          <p>
                            File: {req.dataShare.fileName} (
                            {req.dataShare.fileSize
                              ? (req.dataShare.fileSize / 1024 / 1024).toFixed(2) + ' MB'
                              : 'size unknown'}
                            )
                          </p>
                          {req.dataShare.fileContent && (
                            <a
                              href={req.dataShare.fileContent}
                              download={req.dataShare.fileName}
                              className="text-medical-blue-700 font-semibold hover:underline mt-1 inline-block"
                            >
                              Download / View
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Sent on {new Date(req.createdAt || Date.now()).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
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

