import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoctorPatients, savePatientData, generateKnowledgeGraph } from '../services/api';

const DoctorDataEntry = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [modelStatus, setModelStatus] = useState('');
  
  // Form data
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [patientData, setPatientData] = useState('');
  const [patientDataFile, setPatientDataFile] = useState(null);
  const [imagingFiles, setImagingFiles] = useState([]);
  const [imagingTypes, setImagingTypes] = useState({});
  
  const navigate = useNavigate();
  const { patientId } = useParams();

  useEffect(() => {
    const loadData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const data = await getDoctorPatients(user.id);
        setPatients(data);
        
        // If patientId is in URL, set it
        if (patientId) {
          setSelectedPatientId(patientId);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [patientId]);

  const handlePatientDataFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      setPatientDataFile(file);
      
      // Read file content if it's a text file
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPatientData(e.target.result);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleImagingFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        setError(`${file.name} is too large. Maximum size is 50MB per file.`);
        return false;
      }
      return true;
    });
    
    setImagingFiles(prev => [...prev, ...validFiles]);
    
    // Set default imaging type for new files
    validFiles.forEach(file => {
      setImagingTypes(prev => ({
        ...prev,
        [file.name]: 'CT Scan'
      }));
    });
  };

  const removeImagingFile = (fileName) => {
    setImagingFiles(prev => prev.filter(file => file.name !== fileName));
    setImagingTypes(prev => {
      const newTypes = { ...prev };
      delete newTypes[fileName];
      return newTypes;
    });
  };

  const handleImagingTypeChange = (fileName, type) => {
    setImagingTypes(prev => ({
      ...prev,
      [fileName]: type
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatientId) {
      setError('Please select a patient');
      return;
    }

    if (!clinicalNotes && !patientData && !patientDataFile && imagingFiles.length === 0) {
      setError('Please provide at least one type of data (Clinical Notes, Patient Data, or Imaging Data)');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    setModelStatus('');

    try {
      // Convert files to base64 for storage
      const imagingData = await Promise.all(
        imagingFiles.map(async (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                name: file.name,
                type: imagingTypes[file.name] || 'CT Scan',
                data: e.target.result,
                size: file.size,
                mimeType: file.type
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      let patientDataContent = patientData;
      if (patientDataFile && !patientData) {
        // If file is selected but content not read, read it
        patientDataContent = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsText(patientDataFile);
        });
      }

      const dataToSave = {
        patientId: parseInt(selectedPatientId),
        clinicalNotes: clinicalNotes || null,
        patientData: patientDataContent || null,
        patientDataFileName: patientDataFile?.name || null,
        imagingData: imagingData.length > 0 ? imagingData : null,
        timestamp: new Date().toISOString()
      };

      const result = await savePatientData(dataToSave);
      
      if (result.success) {
        setSuccess('Data saved successfully!');
        if (result.modelSuccess) {
          setModelStatus('Model inference completed and attached to this entry.');
        } else if (result.modelMessage) {
          setModelStatus(`Model inference warning: ${result.modelMessage}`);
        } else {
          setModelStatus('Model inference was not run.');
        }
        // Reset form
        setClinicalNotes('');
        setPatientData('');
        setPatientDataFile(null);
        setImagingFiles([]);
        setImagingTypes({});
        
        // Optionally generate knowledge graph
        if (result.dataSaved) {
          setTimeout(() => {
            setSuccess('Data saved successfully! You can now generate the knowledge graph.');
          }, 1000);
        }
      } else {
        setError(result.message || 'Failed to save data');
      }
    } catch (err) {
      setError('An error occurred while saving data');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateKnowledgeGraph = async () => {
    if (!selectedPatientId) {
      setError('Please select a patient first');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const result = await generateKnowledgeGraph(parseInt(selectedPatientId));
      
      if (result.success) {
        setSuccess('Knowledge graph generated successfully!');
        // Navigate to view the knowledge graph
        setTimeout(() => {
          navigate(`/doctor/knowledge-graph/${selectedPatientId}`);
        }, 1500);
      } else {
        setError(result.message || 'Failed to generate knowledge graph');
      }
    } catch (err) {
      setError('An error occurred while generating knowledge graph');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-medical-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  const selectedPatient = patients.find(p => p.id === parseInt(selectedPatientId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Patient Data Entry</h2>
        <p className="text-medical-blue-100">
          Add clinical notes, patient data, and imaging data to generate knowledge graph
        </p>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {modelStatus && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          {modelStatus}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div>
            <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-2">
              Select Patient *
            </label>
            <select
              id="patient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
            >
              <option value="">-- Select a patient --</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.email})
                </option>
              ))}
            </select>
            {selectedPatient && (
              <p className="mt-2 text-sm text-gray-600">
                Age: {selectedPatient.age} | Gender: {selectedPatient.gender} | Location: {selectedPatient.address}
              </p>
            )}
          </div>

          {/* Clinical Notes */}
          <div>
            <label htmlFor="clinicalNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Clinical Notes
            </label>
            <textarea
              id="clinicalNotes"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
              placeholder="Enter clinical observations, diagnosis, treatment plans, etc..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional: Add detailed clinical notes about the patient
            </p>
          </div>

          {/* Patient Data (Genomic/Other) */}
          <div>
            <label htmlFor="patientData" className="block text-sm font-medium text-gray-700 mb-2">
              Patient Data (Genomic/Other)
            </label>
            <div className="space-y-3">
              <textarea
                id="patientData"
                value={patientData}
                onChange={(e) => setPatientData(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent outline-none"
                placeholder="Enter genomic data, lab results, or other patient data (JSON, CSV, or plain text)..."
              />
              <div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,.csv,.json,.xml"
                    onChange={handlePatientDataFileChange}
                    className="hidden"
                  />
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-block">
                    📁 Or upload file (TXT, CSV, JSON, XML)
                  </span>
                </label>
                {patientDataFile && (
                  <span className="ml-3 text-sm text-gray-600">
                    Selected: {patientDataFile.name}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Optional: Add genomic data, lab results, or other structured patient data
            </p>
          </div>

          {/* Imaging Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imaging Data (CT Scan, MRI, etc.)
            </label>
            <div className="space-y-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.dcm,.dicom"
                  multiple
                  onChange={handleImagingFileChange}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-block">
                  📁 Upload Imaging Files (JPG, PNG, DICOM)
                </span>
              </label>
              
              {imagingFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {imagingFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={imagingTypes[file.name] || 'CT Scan'}
                          onChange={(e) => handleImagingTypeChange(file.name, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-medical-blue-500 outline-none"
                        >
                          <option value="CT Scan">CT Scan</option>
                          <option value="MRI">MRI</option>
                          <option value="X-Ray">X-Ray</option>
                          <option value="Ultrasound">Ultrasound</option>
                          <option value="PET Scan">PET Scan</option>
                          <option value="Other">Other</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeImagingFile(file.name)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Optional: Upload medical imaging files (CT scans, MRIs, X-rays, etc.)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-medical-blue-600 text-white rounded-lg hover:bg-medical-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Data'}
              </button>
              {selectedPatientId && (
                <button
                  type="button"
                  onClick={handleGenerateKnowledgeGraph}
                  disabled={generating}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Generating...' : 'Generate Knowledge Graph'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>You can provide one or all three types of data (Clinical Notes, Patient Data, Imaging Data)</li>
          <li>All data will be used to generate a comprehensive knowledge graph</li>
          <li>Knowledge graph generation uses Python backend script for analysis</li>
          <li>Once data is saved, you can generate the knowledge graph at any time</li>
        </ul>
      </div>
    </div>
  );
};

export default DoctorDataEntry;

