// Mock data with Pakistani names and medical information

export const mockPatients = [
  {
    id: 1,
    name: "Ahmed Ali Khan",
    email: "patient@test.com",
    phone: "+92 300 1234567",
    age: 45,
    gender: "Male",
    address: "Lahore, Punjab",
    bloodGroup: "O+",
    appointments: [
      {
        id: 1,
        date: "2024-12-15",
        time: "10:00 AM",
        doctor: "Dr. Fatima Sheikh",
        status: "upcoming",
        reason: "Follow-up consultation"
      },
      {
        id: 2,
        date: "2024-12-01",
        time: "02:30 PM",
        doctor: "Dr. Fatima Sheikh",
        status: "completed",
        reason: "Initial diagnosis"
      }
    ],
    medicalHistory: [
      {
        id: 1,
        date: "2024-11-20",
        diagnosis: "Hepatitis B",
        treatment: "Antiviral medication",
        doctor: "Dr. Fatima Sheikh",
        cancerType: "liver"
      },
      {
        id: 2,
        date: "2024-10-15",
        diagnosis: "Elevated liver enzymes",
        treatment: "Diet modification",
        doctor: "Dr. Fatima Sheikh",
        cancerType: "liver"
      }
    ],
    testResults: [
      {
        id: 1,
        date: "2024-12-01",
        testType: "AFP Level",
        value: "250 ng/mL",
        normalRange: "< 10 ng/mL",
        status: "abnormal",
        cancerType: "liver"
      },
      {
        id: 2,
        date: "2024-12-01",
        testType: "CT Scan",
        value: "Tumor detected",
        size: "3.5 cm",
        location: "Right lobe",
        status: "abnormal",
        cancerType: "liver"
      }
    ]
  },
  {
    id: 2,
    name: "Sana Malik",
    email: "sana.malik@test.com",
    phone: "+92 321 9876543",
    age: 52,
    gender: "Female",
    address: "Karachi, Sindh",
    bloodGroup: "A+",
    appointments: [
      {
        id: 3,
        date: "2024-12-20",
        time: "11:00 AM",
        doctor: "Dr. Fatima Sheikh",
        status: "upcoming",
        reason: "Post-surgery checkup"
      }
    ],
    medicalHistory: [
      {
        id: 3,
        date: "2024-11-10",
        diagnosis: "Liver cancer - Stage II",
        treatment: "Surgical resection",
        doctor: "Dr. Fatima Sheikh",
        cancerType: "liver"
      }
    ],
    testResults: [
      {
        id: 3,
        date: "2024-12-10",
        testType: "AFP Level",
        value: "45 ng/mL",
        normalRange: "< 10 ng/mL",
        status: "abnormal",
        cancerType: "liver"
      }
    ]
  },
  {
    id: 3,
    name: "Muhammad Hassan",
    email: "hassan@test.com",
    phone: "+92 333 4567890",
    age: 38,
    gender: "Male",
    address: "Islamabad, Capital Territory",
    bloodGroup: "B+",
    appointments: [
      {
        id: 4,
        date: "2024-12-18",
        time: "09:00 AM",
        doctor: "Dr. Fatima Sheikh",
        status: "upcoming",
        reason: "Routine screening"
      }
    ],
    medicalHistory: [
      {
        id: 4,
        date: "2024-09-05",
        diagnosis: "Cirrhosis",
        treatment: "Medication and lifestyle changes",
        doctor: "Dr. Fatima Sheikh",
        cancerType: "liver"
      }
    ],
    testResults: [
      {
        id: 4,
        date: "2024-12-05",
        testType: "AFP Level",
        value: "8 ng/mL",
        normalRange: "< 10 ng/mL",
        status: "normal",
        cancerType: "liver"
      }
    ]
  },
  {
    id: 4,
    name: "Ayesha Raza",
    email: "ayesha.raza@test.com",
    phone: "+92 334 5678901",
    age: 48,
    gender: "Female",
    address: "Lahore, Punjab",
    bloodGroup: "B+",
    appointments: [
      {
        id: 5,
        date: "2024-12-22",
        time: "02:00 PM",
        doctor: "Dr. Usman Ahmed",
        status: "upcoming",
        reason: "Breast cancer screening follow-up"
      }
    ],
    medicalHistory: [
      {
        id: 5,
        date: "2024-11-15",
        diagnosis: "Breast cancer - Stage I",
        treatment: "Lumpectomy and radiation",
        doctor: "Dr. Usman Ahmed",
        cancerType: "breast"
      }
    ],
    testResults: [
      {
        id: 5,
        date: "2024-12-12",
        testType: "CA 15-3 Level",
        value: "52 U/mL",
        normalRange: "< 30 U/mL",
        status: "abnormal",
        cancerType: "breast"
      },
      {
        id: 6,
        date: "2024-12-12",
        testType: "HER2 Status",
        value: "Positive",
        normalRange: "Negative",
        status: "abnormal",
        cancerType: "breast"
      }
    ]
  },
  {
    id: 5,
    name: "Bilal Qureshi",
    email: "bilal.qureshi@test.com",
    phone: "+92 345 6789012",
    age: 55,
    gender: "Male",
    address: "Karachi, Sindh",
    bloodGroup: "A+",
    appointments: [
      {
        id: 6,
        date: "2024-12-19",
        time: "10:30 AM",
        doctor: "Dr. Usman Ahmed",
        status: "upcoming",
        reason: "Lung cancer monitoring"
      }
    ],
    medicalHistory: [
      {
        id: 6,
        date: "2024-10-20",
        diagnosis: "Lung cancer - Stage III",
        treatment: "Chemotherapy and targeted therapy",
        doctor: "Dr. Usman Ahmed",
        cancerType: "lung"
      }
    ],
    testResults: [
      {
        id: 7,
        date: "2024-12-08",
        testType: "CEA Level",
        value: "8.5 ng/mL",
        normalRange: "< 3 ng/mL",
        status: "abnormal",
        cancerType: "lung"
      },
      {
        id: 8,
        date: "2024-12-08",
        testType: "CT Scan - Chest",
        value: "Tumor detected",
        size: "4.2 cm",
        location: "Right upper lobe",
        status: "abnormal",
        cancerType: "lung"
      }
    ]
  }
];

export const mockDoctors = [
  {
    id: 1,
    name: "Dr. Fatima Sheikh",
    email: "doctor@test.com",
    specialization: "Hepatology & Liver Cancer",
    phone: "+92 300 1112233",
    experience: "15 years",
    qualifications: "MBBS, FCPS (Gastroenterology)",
    hospital: "Aga Khan University Hospital",
    patients: [1, 2, 3]
  },
  {
    id: 2,
    name: "Dr. Usman Ahmed",
    email: "usman.ahmed@test.com",
    specialization: "Oncology - Lung & Breast Cancer",
    phone: "+92 321 2223344",
    experience: "12 years",
    qualifications: "MBBS, FCPS (Oncology)",
    hospital: "Shaukat Khanum Memorial Cancer Hospital",
    patients: [4, 5]
  }
];

export const mockAppointments = [
  {
    id: 1,
    patientId: 1,
    patientName: "Ahmed Ali Khan",
    doctorId: 1,
    doctorName: "Dr. Fatima Sheikh",
    date: "2024-12-15",
    time: "10:00 AM",
    status: "upcoming",
    reason: "Follow-up consultation - Liver"
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Sana Malik",
    doctorId: 1,
    doctorName: "Dr. Fatima Sheikh",
    date: "2024-12-20",
    time: "11:00 AM",
    status: "upcoming",
    reason: "Post-surgery checkup - Liver"
  },
  {
    id: 3,
    patientId: 3,
    patientName: "Muhammad Hassan",
    doctorId: 1,
    doctorName: "Dr. Fatima Sheikh",
    date: "2024-12-18",
    time: "09:00 AM",
    status: "upcoming",
    reason: "Routine screening - Liver"
  },
  {
    id: 4,
    patientId: 4,
    patientName: "Ayesha Raza",
    doctorId: 2,
    doctorName: "Dr. Usman Ahmed",
    date: "2024-12-22",
    time: "02:00 PM",
    status: "upcoming",
    reason: "Breast cancer screening follow-up"
  },
  {
    id: 5,
    patientId: 5,
    patientName: "Bilal Qureshi",
    doctorId: 2,
    doctorName: "Dr. Usman Ahmed",
    date: "2024-12-19",
    time: "10:30 AM",
    status: "upcoming",
    reason: "Lung cancer monitoring"
  }
];

// Chatbot responses - Generic for all cancer types
export const chatbotResponses = [
  "I understand you're concerned about your health. Can you tell me more about your symptoms?",
  "Based on your description, I recommend consulting with your doctor. Would you like to schedule an appointment?",
  "Cancer screening typically involves blood tests and imaging studies. Have you had these tests done?",
  "It's important to maintain regular follow-ups with your healthcare provider. How can I help you today?",
  "I can help you understand your test results or answer questions about cancer screening and treatment. What would you like to know?",
  "Early detection is crucial for successful cancer treatment. If you have concerns, please don't hesitate to contact your doctor.",
  "Regular screenings and monitoring are important for cancer prevention and early detection. Have you discussed screening options with your doctor?",
  "I'm here to help answer your questions about cancer diagnosis, treatment, and management. What specific information are you looking for?",
];

// Hospital list with city and codes
export const mockHospitals = [
  {
    name: "Aga Khan University Hospital",
    city: "Karachi",
    branchCode: "KHI01",
    totalPatients: 120,
    totalDoctors: 45
  },
  {
    name: "Shaukat Khanum Memorial Cancer Hospital",
    city: "Lahore",
    branchCode: "LHE02",
    totalPatients: 98,
    totalDoctors: 38
  },
  {
    name: "Liaquat National Hospital",
    city: "Karachi",
    branchCode: "KHI03",
    totalPatients: 75,
    totalDoctors: 30
  },
  {
    name: "Dow University Hospital",
    city: "Karachi",
    branchCode: "KHI04",
    totalPatients: 60,
    totalDoctors: 22
  },
  {
    name: "Punjab Institute of Cardiology",
    city: "Lahore",
    branchCode: "LHE05",
    totalPatients: 82,
    totalDoctors: 28
  },
  {
    name: "Independent / Private Clinic",
    city: "Islamabad",
    branchCode: "ISB01",
    totalPatients: 25,
    totalDoctors: 10
  }
];

