import { mockPatients, mockDoctors, mockAppointments, chatbotResponses, mockHospitals } from './mockData';
import runMedgemmaInference from './modelClient';

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper functions to manage localStorage data
const getStoredUsers = (key) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveStoredUsers = (key, users) => {
  try {
    localStorage.setItem(key, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const getAllPatientsData = () => {
  const storedPatients = getStoredUsers('newPatients');
  return [...mockPatients, ...storedPatients];
};

const getAllDoctorsData = () => {
  const storedDoctors = getStoredUsers('newDoctors');
  return [...mockDoctors, ...storedDoctors];
};

const getStoredHospitals = () => getStoredUsers('hospitals');

const getStoredDoctorRequests = () => getStoredUsers('doctorRequests');

const saveDoctorRequests = (requests) => {
  saveStoredUsers('doctorRequests', requests);
};

// Signup function
export const signup = async (formData) => {
  await delay(1000);
  
  const allPatients = getAllPatientsData();
  const allDoctors = getAllDoctorsData();
  
  // Check if email already exists
  const existingPatient = allPatients.find(p => p.email === formData.email);
  const existingDoctor = allDoctors.find(d => d.email === formData.email);
  
  if (existingPatient || existingDoctor) {
    return {
      success: false,
      message: 'Email already registered. Please use a different email or login.'
    };
  }
  
  // Generate new ID (start from 1000 to avoid conflicts with mock data)
  const storedPatients = getStoredUsers('newPatients');
  const storedDoctors = getStoredUsers('newDoctors');
  const newId = 1000 + storedPatients.length + storedDoctors.length + 1;
  
  if (formData.role === 'patient') {
    const newPatient = {
      id: newId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      age: parseInt(formData.age),
      gender: formData.gender,
      address: formData.address,
      bloodGroup: formData.bloodGroup,
      appointments: [],
      medicalHistory: [],
      testResults: []
    };
    
    storedPatients.push(newPatient);
    saveStoredUsers('newPatients', storedPatients);
    
    return {
      success: true,
      user: {
        id: newPatient.id,
        name: newPatient.name,
        email: newPatient.email,
        role: 'patient'
      }
    };
  } else if (formData.role === 'doctor') {
    const newDoctor = {
      id: newId,
      name: formData.name,
      email: formData.email,
      specialization: formData.specialization,
      phone: formData.phone,
      experience: formData.experience || '0 years',
      qualifications: formData.qualifications || '',
      hospital: formData.hospital || 'Independent / Private Clinic',
      patients: []
    };
    
    storedDoctors.push(newDoctor);
    saveStoredUsers('newDoctors', storedDoctors);
    
    return {
      success: true,
      user: {
        id: newDoctor.id,
        name: newDoctor.name,
        email: newDoctor.email,
        role: 'doctor'
      }
    };
  }
  
  return {
    success: false,
    message: 'Invalid role selected'
  };
};

// Authentication
export const login = async (email, password) => {
  await delay(800);
  
  const allPatients = getAllPatientsData();
  const allDoctors = getAllDoctorsData();
  
  // Check patient
  const patient = allPatients.find(p => p.email === email);
  if (patient) {
    return {
      success: true,
      user: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        role: 'patient'
      }
    };
  }
  
  // Check doctor
  const doctor = allDoctors.find(d => d.email === email);
  if (doctor) {
    return {
      success: true,
      user: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        role: 'doctor'
      }
    };
  }
  
  return {
    success: false,
    message: 'Invalid email or password'
  };
};

// Patient APIs
export const getPatientData = async (patientId) => {
  await delay(600);
  const allPatients = getAllPatientsData();
  const patient = allPatients.find(p => p.id === patientId);
  return patient || null;
};

export const getPatientAppointments = async (patientId) => {
  await delay(500);
  const allPatients = getAllPatientsData();
  const patient = allPatients.find(p => p.id === patientId);
  return patient?.appointments || [];
};

export const getPatientMedicalHistory = async (patientId) => {
  await delay(500);
  const allPatients = getAllPatientsData();
  const patient = allPatients.find(p => p.id === patientId);
  return patient?.medicalHistory || [];
};

export const getPatientTestResults = async (patientId) => {
  await delay(500);
  const allPatients = getAllPatientsData();
  const patient = allPatients.find(p => p.id === patientId);
  return patient?.testResults || [];
};

// Doctor APIs
export const getDoctorPatients = async (doctorId) => {
  await delay(600);
  const allDoctors = getAllDoctorsData();
  const doctor = allDoctors.find(d => d.id === doctorId);
  if (!doctor) return [];
  
  const allPatients = getAllPatientsData();
  return allPatients.filter(p => doctor.patients.includes(p.id));
};

export const getAllPatients = async () => {
  await delay(600);
  return getAllPatientsData();
};

export const getHospitals = async () => {
  await delay(300);
  const stored = getStoredHospitals();
  return [...mockHospitals, ...stored];
};

export const getDoctorsByHospital = async (hospitalName) => {
  await delay(500);
  const doctors = getAllDoctorsData();
  if (!hospitalName || hospitalName === 'all') return doctors;
  return doctors.filter((doc) => (doc.hospital || 'Independent / Private Clinic') === hospitalName);
};

export const createDoctorRequest = async ({
  patientId,
  doctorId,
  hospital,
  note,
  dataShare
}) => {
  await delay(600);

  const allPatients = getAllPatientsData();
  const allDoctors = getAllDoctorsData();
  const patient = allPatients.find((p) => p.id === patientId);
  const doctor = allDoctors.find((d) => d.id === doctorId);

  if (!patient || !doctor) {
    return { success: false, message: 'Doctor or patient not found' };
  }

  const requests = getStoredDoctorRequests();
  const newRequest = {
    id: Date.now(),
    patientId,
    patientName: patient.name,
    doctorId,
    doctorName: doctor.name,
    hospital: hospital || doctor.hospital || 'Independent / Private Clinic',
    note: note || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    scheduleNote: null,
    proposedSlot: null,
    dataShare:
      dataShare && dataShare.allowDataShare
        ? {
            allowDataShare: true,
            note: dataShare.note || '',
            fileName: dataShare.fileName || null,
            fileSize: dataShare.fileSize || null,
            fileType: dataShare.fileType || null,
            fileContent: dataShare.fileContent || null
          }
        : null
  };

  requests.push(newRequest);
  saveDoctorRequests(requests);

  return { success: true, request: newRequest };
};

export const getPatientDoctorRequests = async (patientId) => {
  await delay(400);
  const requests = getStoredDoctorRequests();
  return requests.filter((req) => req.patientId === patientId);
};

export const getDoctorRequests = async (doctorId) => {
  await delay(400);
  const requests = getStoredDoctorRequests();
  return requests.filter((req) => req.doctorId === doctorId);
};

export const updateDoctorRequestStatus = async (requestId, status, { scheduleNote, proposedSlot } = {}) => {
  await delay(400);
  const requests = getStoredDoctorRequests();
  const idx = requests.findIndex((req) => req.id === requestId);

  if (idx === -1) {
    return { success: false, message: 'Request not found' };
  }

  requests[idx] = {
    ...requests[idx],
    status,
    scheduleNote: scheduleNote || requests[idx].scheduleNote,
    proposedSlot: proposedSlot || requests[idx].proposedSlot,
    updatedAt: new Date().toISOString()
  };

  saveDoctorRequests(requests);
  return { success: true, request: requests[idx] };
};

export const getAllAppointments = async () => {
  await delay(500);
  return mockAppointments;
};

// Diagnosis calculation (mock) - Generic for Liver, Lung, and Breast cancer
export const calculateDiagnosis = async (cancerType, tumorSize, biomarker1, biomarker2 = null, additionalFactor = null) => {
  await delay(1000);
  
  // Mock probability calculation
  let riskScore = 0;
  
  // Tumor size contribution (0-40 points) - same for all cancer types
  if (tumorSize < 1) riskScore += 5;
  else if (tumorSize < 2) riskScore += 15;
  else if (tumorSize < 5) riskScore += 30;
  else if (tumorSize < 10) riskScore += 38;
  else riskScore += 40;
  
  // Cancer-specific biomarker calculations (0-40 points)
  if (cancerType === 'liver') {
    // AFP Level for Liver Cancer
    const afpLevel = biomarker1;
    if (afpLevel < 10) riskScore += 5;
    else if (afpLevel < 100) riskScore += 20;
    else if (afpLevel < 400) riskScore += 32;
    else riskScore += 40;
  } else if (cancerType === 'lung') {
    // CEA Level for Lung Cancer
    const ceaLevel = biomarker1;
    if (ceaLevel < 3) riskScore += 5;
    else if (ceaLevel < 5) riskScore += 15;
    else if (ceaLevel < 10) riskScore += 28;
    else riskScore += 40;
    
    // Smoking history (0-20 points)
    if (additionalFactor === 'yes' || additionalFactor === 'current') {
      riskScore += 20;
    } else if (additionalFactor === 'former') {
      riskScore += 10;
    }
  } else if (cancerType === 'breast') {
    // CA 15-3 Level for Breast Cancer
    const ca153Level = biomarker1;
    if (ca153Level < 30) riskScore += 5;
    else if (ca153Level < 50) riskScore += 18;
    else if (ca153Level < 100) riskScore += 30;
    else riskScore += 40;
    
    // HER2 Status (0-20 points)
    if (biomarker2 === 'positive') {
      riskScore += 20;
    } else if (biomarker2 === 'negative') {
      riskScore += 5;
    }
  }
  
  const probability = Math.min(95, Math.max(5, riskScore));
  
  let recommendation = '';
  const cancerName = cancerType.charAt(0).toUpperCase() + cancerType.slice(1);
  
  if (probability < 30) {
    recommendation = `Low risk for ${cancerName} cancer. Continue regular monitoring and follow-up in 6 months. Maintain healthy lifestyle and regular screenings.`;
  } else if (probability < 60) {
    recommendation = `Moderate risk for ${cancerName} cancer. Additional imaging studies and biopsy recommended. Schedule follow-up consultation within 1 month. Consider referral to oncology specialist.`;
  } else {
    recommendation = `High risk for ${cancerName} cancer. Immediate comprehensive diagnostic workup required. Urgent referral to oncology specialist recommended. Consider advanced imaging and tissue biopsy.`;
  }
  
  // Build result object with cancer-specific fields
  const result = {
    probability: probability.toFixed(1),
    riskLevel: probability < 30 ? 'Low' : probability < 60 ? 'Moderate' : 'High',
    recommendation,
    cancerType: cancerName,
    tumorSize
  };
  
  // Add cancer-specific biomarkers
  if (cancerType === 'liver') {
    result.afpLevel = biomarker1;
  } else if (cancerType === 'lung') {
    result.ceaLevel = biomarker1;
    result.smokingHistory = additionalFactor;
  } else if (cancerType === 'breast') {
    result.ca153Level = biomarker1;
    result.her2Status = biomarker2;
  }
  
  return result;
};

// Chatbot API
export const getChatbotResponse = async (message) => {
  await delay(1500);
  
  // Simple keyword matching for demo
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
    return "I can help you schedule an appointment. Please contact our reception at +92 300 1234567 or use the appointment booking feature in your dashboard.";
  }
  
  if (lowerMessage.includes('test') || lowerMessage.includes('result')) {
    return "Your test results are available in your dashboard. For detailed interpretation, please consult with your doctor during your next appointment.";
  }
  
  if (lowerMessage.includes('symptom') || lowerMessage.includes('pain')) {
    return "If you're experiencing symptoms, it's important to consult with your doctor. For urgent concerns, please contact emergency services or visit the nearest hospital.";
  }
  
  if (lowerMessage.includes('liver') || lowerMessage.includes('hepat')) {
    return "For liver cancer, screening typically involves AFP blood tests and imaging studies like CT scans or MRIs. Regular monitoring is important if you have risk factors like hepatitis or cirrhosis.";
  }
  
  if (lowerMessage.includes('lung') || lowerMessage.includes('respiratory')) {
    return "Lung cancer screening may include CEA blood tests, chest X-rays, and CT scans. If you have a history of smoking, regular screenings are especially important.";
  }
  
  if (lowerMessage.includes('breast') || lowerMessage.includes('mammogram')) {
    return "Breast cancer screening includes mammograms, CA 15-3 blood tests, and HER2 status testing. Regular self-examinations and annual screenings are recommended for early detection.";
  }
  
  // Random response
  const randomResponse = chatbotResponses[Math.floor(Math.random() * chatbotResponses.length)];
  return randomResponse;
};

// Profile APIs
export const getUserProfile = async (userId, userRole) => {
  await delay(500);
  
  // Check for profile image in separate storage (for mock users)
  const profileImages = getStoredUsers('profileImages');
  const storedImage = profileImages.find(img => img.userId === userId && img.role === userRole);
  
  if (userRole === 'patient') {
    const allPatients = getAllPatientsData();
    const patient = allPatients.find(p => p.id === userId);
    if (patient) {
      return { 
        ...patient, 
        role: 'patient',
        profileImage: storedImage?.image || patient.profileImage || null
      };
    }
  } else if (userRole === 'doctor') {
    const allDoctors = getAllDoctorsData();
    const doctor = allDoctors.find(d => d.id === userId);
    if (doctor) {
      return { 
        ...doctor, 
        role: 'doctor',
        profileImage: storedImage?.image || doctor.profileImage || null
      };
    }
  }
  
  return null;
};

export const updateUserProfile = async (userId, userRole, updatedData) => {
  await delay(800);
  
  if (userRole === 'patient') {
    const storedPatients = getStoredUsers('newPatients');
    const patientIndex = storedPatients.findIndex(p => p.id === userId);
    
    if (patientIndex !== -1) {
      // Update stored patient
      storedPatients[patientIndex] = {
        ...storedPatients[patientIndex],
        ...updatedData,
        age: updatedData.age ? parseInt(updatedData.age) : storedPatients[patientIndex].age
      };
      saveStoredUsers('newPatients', storedPatients);
      
      return {
        success: true,
        user: {
          id: storedPatients[patientIndex].id,
          name: storedPatients[patientIndex].name,
          email: storedPatients[patientIndex].email,
          role: 'patient'
        }
      };
    } else {
      // Check mock data (read-only, but we can still update localStorage user)
      const mockPatient = mockPatients.find(p => p.id === userId);
      if (mockPatient) {
        // Store profile image separately for mock users
        if (updatedData.profileImage) {
          const profileImages = getStoredUsers('profileImages');
          const existingIndex = profileImages.findIndex(img => img.userId === userId && img.role === 'patient');
          if (existingIndex !== -1) {
            profileImages[existingIndex].image = updatedData.profileImage;
          } else {
            profileImages.push({ userId, role: 'patient', image: updatedData.profileImage });
          }
          saveStoredUsers('profileImages', profileImages);
        }
        
        // For mock patients, we can't modify the original data, but update the user session
        return {
          success: true,
          user: {
            id: mockPatient.id,
            name: updatedData.name || mockPatient.name,
            email: updatedData.email || mockPatient.email,
            role: 'patient'
          },
          message: 'Profile updated (mock data is read-only)'
        };
      }
    }
  } else if (userRole === 'doctor') {
    const storedDoctors = getStoredUsers('newDoctors');
    const doctorIndex = storedDoctors.findIndex(d => d.id === userId);
    
    if (doctorIndex !== -1) {
      // Update stored doctor
      storedDoctors[doctorIndex] = {
        ...storedDoctors[doctorIndex],
        ...updatedData
      };
      saveStoredUsers('newDoctors', storedDoctors);
      
      return {
        success: true,
        user: {
          id: storedDoctors[doctorIndex].id,
          name: storedDoctors[doctorIndex].name,
          email: storedDoctors[doctorIndex].email,
          role: 'doctor'
        }
      };
    } else {
      // Check mock data
      const mockDoctor = mockDoctors.find(d => d.id === userId);
      if (mockDoctor) {
        // Store profile image separately for mock users
        if (updatedData.profileImage) {
          const profileImages = getStoredUsers('profileImages');
          const existingIndex = profileImages.findIndex(img => img.userId === userId && img.role === 'doctor');
          if (existingIndex !== -1) {
            profileImages[existingIndex].image = updatedData.profileImage;
          } else {
            profileImages.push({ userId, role: 'doctor', image: updatedData.profileImage });
          }
          saveStoredUsers('profileImages', profileImages);
        }
        
        return {
          success: true,
          user: {
            id: mockDoctor.id,
            name: updatedData.name || mockDoctor.name,
            email: updatedData.email || mockDoctor.email,
            role: 'doctor'
          },
          message: 'Profile updated (mock data is read-only)'
        };
      }
    }
  }
  
  return {
    success: false,
    message: 'User not found'
  };
};

// Patient Data Entry APIs
export const savePatientData = async (data) => {
  await delay(1000);
  
  try {
    // Store patient data in localStorage
    const storedData = getStoredUsers('patientDataEntries');
    const entry = {
      id: Date.now(),
      ...data,
      doctorId: JSON.parse(localStorage.getItem('user'))?.id
    };
    
    storedData.push(entry);
    saveStoredUsers('patientDataEntries', storedData);
    
    // Kick off medgemma inference (non-blocking)
    let modelResult = null;
    const inferencePayload = {
      patientId: entry.patientId,
      doctorId: entry.doctorId,
      clinicalNotes: entry.clinicalNotes,
      patientData: entry.patientData,
      patientDataFileName: entry.patientDataFileName,
      imagingData: entry.imagingData,
      timestamp: entry.timestamp,
    };

    const inferenceResponse = await runMedgemmaInference(inferencePayload);
    if (inferenceResponse.success) {
      modelResult = inferenceResponse.data;
    }

    const enrichedEntry = { ...entry, modelResult };
    const idx = storedData.findIndex((e) => e.id === entry.id);
    if (idx !== -1) {
      storedData[idx] = enrichedEntry;
      saveStoredUsers('patientDataEntries', storedData);
    }
    
    return {
      success: true,
      dataSaved: true,
      entryId: entry.id,
      modelSuccess: Boolean(modelResult),
      modelMessage: inferenceResponse.success ? 'Model inference completed.' : inferenceResponse.message,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to save patient data'
    };
  }
};

export const getPatientDataEntries = async (patientId) => {
  await delay(500);
  const storedData = getStoredUsers('patientDataEntries');
  return storedData.filter(entry => entry.patientId === patientId);
};

// Knowledge Graph Generation API
// This function will call the Python backend script
export const generateKnowledgeGraph = async (patientId) => {
  await delay(2000);
  
  try {
    // Get patient data entries
    const entries = await getPatientDataEntries(patientId);
    
    if (entries.length === 0) {
      return {
        success: false,
        message: 'No data found for this patient. Please add data first.'
      };
    }
    
    // Get the latest entry
    const latestEntry = entries[entries.length - 1];
    
    // If the latest entry already contains model output, use it
    const graphFromModel = latestEntry.modelResult?.graph || null;
    const metadata = latestEntry.modelResult?.metadata || latestEntry.modelResult || {};

    const knowledgeGraphData = graphFromModel
      ? {
          patientId,
          generatedAt: new Date().toISOString(),
          nodes: graphFromModel.nodes || [],
          edges: graphFromModel.edges || [],
          metadata,
          status: 'generated',
        }
      : {
          patientId,
      generatedAt: new Date().toISOString(),
          nodes: [],
          edges: [],
          metadata: { message: 'No model graph available. Please run inference.' },
          status: 'missing',
    };
    
    // Store knowledge graph
    const storedGraphs = getStoredUsers('knowledgeGraphs');
    const existingIndex = storedGraphs.findIndex(kg => kg.patientId === patientId);
    
    if (existingIndex !== -1) {
      storedGraphs[existingIndex] = knowledgeGraphData;
    } else {
      storedGraphs.push(knowledgeGraphData);
    }
    
    saveStoredUsers('knowledgeGraphs', storedGraphs);
    
    return {
      success: true,
      knowledgeGraph: knowledgeGraphData,
      message: 'Knowledge graph generated successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to generate knowledge graph'
    };
  }
};

export const getKnowledgeGraph = async (patientId) => {
  await delay(500);
  const storedGraphs = getStoredUsers('knowledgeGraphs');
  return storedGraphs.find(kg => kg.patientId === patientId) || null;
};

