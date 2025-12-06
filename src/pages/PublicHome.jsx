import { Link } from 'react-router-dom';

const PublicHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 via-white to-medical-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-medical-blue-600">
                DoctorPath AI
              </h1>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/login"
                className="border-2 border-medical-blue-600 text-medical-blue-600 px-6 py-2 rounded-lg hover:bg-medical-blue-50 transition-colors font-semibold"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-medical-blue-600 text-white px-6 py-2 rounded-lg hover:bg-medical-blue-700 transition-colors font-semibold"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Clinical Decision Support System
            <span className="block text-medical-blue-600 mt-2">for Cancer Detection</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connecting patients, doctors, and administrators with AI-powered diagnostic tools
            to improve cancer detection and treatment outcomes for Liver, Lung, and Breast cancer.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="bg-medical-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-medical-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border-2 border-medical-blue-600 text-medical-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-medical-blue-50 transition-colors"
            >
              Login
            </Link>
            <a
              href="#features"
              className="border-2 border-medical-blue-600 text-medical-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-medical-blue-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Key Features
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-medical-blue-50 p-6 rounded-xl">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Chatbot
              </h4>
              <p className="text-gray-600">
                Get instant answers to your health questions with our intelligent chatbot assistant.
              </p>
            </div>
            <div className="bg-medical-blue-50 p-6 rounded-xl">
              <div className="text-4xl mb-4">🩺</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Diagnostic Tools
              </h4>
              <p className="text-gray-600">
                Advanced diagnostic tools to help doctors assess cancer risk for Liver, Lung, and Breast cancer and make informed decisions.
              </p>
            </div>
            <div className="bg-medical-blue-50 p-6 rounded-xl">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Knowledge Graph
              </h4>
              <p className="text-gray-600">
                Visual representation of medical knowledge and patient data relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 DoctorPath AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;

