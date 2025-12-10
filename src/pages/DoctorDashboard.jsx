import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoctorPatients, calculateDiagnosis, getDoctorRequests, updateDoctorRequestStatus } from '../services/api';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancerType, setCancerType] = useState('liver');
  const [tumorSize, setTumorSize] = useState('');
  const [biomarker1, setBiomarker1] = useState('');
  const [biomarker2, setBiomarker2] = useState('');
  const [additionalFactor, setAdditionalFactor] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestResponses, setRequestResponses] = useState({});
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setDoctorId(user.id);
        const data = await getDoctorPatients(user.id);
        setPatients(data);
        const reqs = await getDoctorRequests(user.id);
        setRequests(reqs);
      }
      setLoading(false);
      setRequestsLoading(false);
    };
    loadData();
  }, []);

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    setCalculating(true);
    setDiagnosisResult(null);

    try {
      const result = await calculateDiagnosis(
        cancerType,
        parseFloat(tumorSize),
        parseFloat(biomarker1),
        biomarker2 || null,
        additionalFactor || null
      );
      setDiagnosisResult(result);
    } catch (error) {
      console.error('Error calculating diagnosis:', error);
    } finally {
      setCalculating(false);
    }
  };

  const getBiomarkerLabel = () => {
    if (cancerType === 'liver') return 'AFP Level (ng/mL)';
    if (cancerType === 'lung') return 'CEA Level (ng/mL)';
    if (cancerType === 'breast') return 'CA 15-3 Level (U/mL)';
    return 'Biomarker Level';
  };

  const getBiomarkerPlaceholder = () => {
    if (cancerType === 'liver') return 'e.g., 250';
    if (cancerType === 'lung') return 'e.g., 5.5';
    if (cancerType === 'breast') return 'e.g., 45';
    return 'Enter value';
  };

  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
  );

  const updateResponseField = (requestId, field, value) => {
    setRequestResponses((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value
      }
    }));
  };

  const handleRequestDecision = async (requestId, status) => {
    if (!doctorId) return;
    setProcessingRequestId(requestId);
    setRequestError('');

    const payload = requestResponses[requestId] || {};

    try {
      const result = await updateDoctorRequestStatus(requestId, status, {
        scheduleNote: payload.note || '',
        proposedSlot: payload.slot || ''
      });

      if (result.success) {
        const refreshed = await getDoctorRequests(doctorId);
        setRequests(refreshed);
        setRequestResponses((prev) => ({
          ...prev,
          [requestId]: { slot: '', note: '' }
        }));
      } else {
        setRequestError(result.message || 'Unable to update request.');
      }
    } catch (err) {
      setRequestError('Failed to update request. Please try again.');
    } finally {
      setProcessingRequestId(null);
    }
  };

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
        <h2 className="text-2xl font-bold mb-2">Doctor Dashboard</h2>
        <p className="text-medical-blue-100">
          Manage your patients and use diagnostic tools
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Active Cases</p>
              <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🩺</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Diagnosis Tools</p>
              <p className="text-3xl font-bold text-gray-900">1</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔬</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Requests & Shared Data */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Patient Requests</h3>
            <p className="text-sm text-gray-600">
              Review doctor selection requests, share timings, and download patient-provided data.
            </p>
          </div>
        </div>

        {requestError && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {requestError}
          </div>
        )}

        {requestsLoading ? (
          <p className="text-gray-500 text-sm">Loading requests...</p>
        ) : sortedRequests.length === 0 ? (
          <p className="text-gray-500 text-sm">No requests yet.</p>
        ) : (
          <div className="space-y-4">
            {sortedRequests.map((req) => (
              <div
                key={req.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-medical-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{req.patientName || 'Patient'}</p>
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

                {req.dataShare?.allowDataShare && (
                  <div className="mb-3 p-3 rounded-lg bg-medical-blue-50 border border-medical-blue-100">
                    <p className="text-sm font-semibold text-medical-blue-800">Patient shared data</p>
                    {req.dataShare.note && (
                      <p className="text-xs text-medical-blue-900 mb-1">{req.dataShare.note}</p>
                    )}
                    {req.dataShare.fileName && (
                      <div className="text-xs text-medical-blue-900">
                        <p>
                          File: {req.dataShare.fileName}{' '}
                          {req.dataShare.fileSize &&
                            `(${(req.dataShare.fileSize / 1024 / 1024).toFixed(2)} MB)`}
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

                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Propose time / slot
                    </label>
                    <input
                      type="text"
                      value={requestResponses[req.id]?.slot || ''}
                      onChange={(e) => updateResponseField(req.id, 'slot', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none text-sm"
                      placeholder="e.g., Dec 20, 3:30 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Note to patient
                    </label>
                    <input
                      type="text"
                      value={requestResponses[req.id]?.note || ''}
                      onChange={(e) => updateResponseField(req.id, 'note', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none text-sm"
                      placeholder="Add scheduling guidance..."
                    />
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleRequestDecision(req.id, 'accepted')}
                    disabled={processingRequestId === req.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-60"
                  >
                    {processingRequestId === req.id && req.status !== 'accepted'
                      ? 'Updating...'
                      : 'Accept'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestDecision(req.id, 'reschedule')}
                    disabled={processingRequestId === req.id}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm disabled:opacity-60"
                  >
                    Propose new time
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestDecision(req.id, 'declined')}
                    disabled={processingRequestId === req.id}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Requested on {new Date(req.createdAt || Date.now()).toLocaleString()}
                </p>
                {req.scheduleNote && (
                  <p className="text-xs text-gray-600">Doctor note: {req.scheduleNote}</p>
                )}
                {req.proposedSlot && (
                  <p className="text-xs text-gray-600">Last proposed slot: {req.proposedSlot}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Diagnosis Tool */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Diagnosis Tool</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enter patient test results to calculate cancer risk probability
          </p>

          <form onSubmit={handleDiagnosisSubmit} className="space-y-4">
            <div>
              <label htmlFor="cancerType" className="block text-sm font-medium text-gray-700 mb-2">
                Cancer Type
              </label>
              <select
                id="cancerType"
                value={cancerType}
                onChange={(e) => {
                  setCancerType(e.target.value);
                  setBiomarker1('');
                  setBiomarker2('');
                  setAdditionalFactor('');
                  setDiagnosisResult(null);
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
              >
                <option value="liver">Liver Cancer</option>
                <option value="lung">Lung Cancer</option>
                <option value="breast">Breast Cancer</option>
              </select>
            </div>

            <div>
              <label htmlFor="tumorSize" className="block text-sm font-medium text-gray-700 mb-2">
                Tumor Size (cm)
              </label>
              <input
                id="tumorSize"
                type="number"
                step="0.1"
                min="0"
                value={tumorSize}
                onChange={(e) => setTumorSize(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., 3.5"
              />
            </div>

            <div>
              <label htmlFor="biomarker1" className="block text-sm font-medium text-gray-700 mb-2">
                {getBiomarkerLabel()}
              </label>
              <input
                id="biomarker1"
                type="number"
                step="0.1"
                min="0"
                value={biomarker1}
                onChange={(e) => setBiomarker1(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
                placeholder={getBiomarkerPlaceholder()}
              />
            </div>

            {cancerType === 'breast' && (
              <div>
                <label htmlFor="biomarker2" className="block text-sm font-medium text-gray-700 mb-2">
                  HER2 Status
                </label>
                <select
                  id="biomarker2"
                  value={biomarker2}
                  onChange={(e) => setBiomarker2(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select HER2 Status</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="equivocal">Equivocal</option>
                </select>
              </div>
            )}

            {cancerType === 'lung' && (
              <div>
                <label htmlFor="additionalFactor" className="block text-sm font-medium text-gray-700 mb-2">
                  Smoking History
                </label>
                <select
                  id="additionalFactor"
                  value={additionalFactor}
                  onChange={(e) => setAdditionalFactor(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Smoking History</option>
                  <option value="never">Never Smoked</option>
                  <option value="former">Former Smoker</option>
                  <option value="current">Current Smoker</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={calculating}
              className="w-full bg-medical-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-medical-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculating ? 'Calculating...' : 'Calculate Risk Probability'}
            </button>
          </form>

          {/* Diagnosis Result */}
          {diagnosisResult && (
            <div className="mt-6 p-4 bg-gradient-to-br from-medical-blue-50 to-medical-blue-100 rounded-lg border border-medical-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">Diagnosis Result</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Risk Probability:</span>
                  <span className={`text-2xl font-bold ${
                    diagnosisResult.riskLevel === 'High' ? 'text-red-600' :
                    diagnosisResult.riskLevel === 'Moderate' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {diagnosisResult.probability}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Risk Level:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    diagnosisResult.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                    diagnosisResult.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {diagnosisResult.riskLevel}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-medical-blue-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Recommendation:</p>
                  <p className="text-sm text-gray-600">{diagnosisResult.recommendation}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-medical-blue-200 text-xs text-gray-500">
                  <p>Cancer Type: {diagnosisResult.cancerType}</p>
                  <p>Tumor Size: {diagnosisResult.tumorSize} cm</p>
                  {diagnosisResult.afpLevel && <p>AFP Level: {diagnosisResult.afpLevel} ng/mL</p>}
                  {diagnosisResult.ceaLevel && <p>CEA Level: {diagnosisResult.ceaLevel} ng/mL</p>}
                  {diagnosisResult.ca153Level && <p>CA 15-3 Level: {diagnosisResult.ca153Level} U/mL</p>}
                  {diagnosisResult.her2Status && <p>HER2 Status: {diagnosisResult.her2Status}</p>}
                  {diagnosisResult.smokingHistory && <p>Smoking History: {diagnosisResult.smokingHistory}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Knowledge Graph Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Knowledge Graph</h3>
              <p className="text-sm text-gray-600 mt-1">
                Visual representation of medical knowledge and patient relationships
              </p>
            </div>
            <a
              href="/doctor/data-entry"
              className="px-4 py-2 bg-medical-blue-600 text-white rounded-lg hover:bg-medical-blue-700 transition-colors text-sm font-semibold"
            >
              + Add Data
            </a>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🕸️</div>
              <p className="text-gray-600 font-medium">Knowledge Graph Visualization</p>
              <p className="text-sm text-gray-500 mt-2">
                Add patient data to generate knowledge graph
              </p>
              <Link
                to="/doctor/data-entry"
                className="mt-4 inline-block px-4 py-2 bg-medical-blue-600 text-white rounded-lg hover:bg-medical-blue-700 transition-colors text-sm"
              >
                Go to Data Entry
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Patients</h3>
        {patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Age</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Gender</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{patient.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.age}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.gender}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.address}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-medical-blue-100 text-medical-blue-700 text-xs rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No patients assigned</p>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

