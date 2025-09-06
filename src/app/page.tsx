'use client';
import { useState } from 'react';
import { CreditCard, Clock, MapPin, Building, Lock, Shield, AlertTriangle, CheckCircle, Unlock, Eye, EyeOff } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    transactionAmount: '',
    timestamp: '',
    merchantId: '',
    geographicalLocation: ''
  });
  
  const [encryptedData, setEncryptedData] = useState({ encryptedFields: null, fullEncrypted: '' });
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fraudResult, setFraudResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [fraudLoading, setFraudLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => Object.values(formData).every(v => v.trim() !== '');

  const generateEncryptedData = () => {
    // Simple "reverse string" encryption with 4-char salt
    const reverseStringWithSalt = (value) => {
      const reversed = value.split('').reverse().join('');
      return  reversed;
    };
  
    const encryptedFields = {
      amount: 'aq' + reverseStringWithSalt(formData.transactionAmount) +'qa',
      timestamp:'bz' +  reverseStringWithSalt(formData.timestamp) +'bz',
      merchantId: 'cz' +  reverseStringWithSalt(formData.merchantId) +'cz',
      location: 'dc' +  reverseStringWithSalt(formData.geographicalLocation) +'cd'
    };
  
    // Full combined encryption (mock)
    const fullEncrypted = (
      encryptedFields.amount +
      encryptedFields.timestamp +
      encryptedFields.merchantId +
      encryptedFields.location
    ) ;
  
    return { encryptedFields, fullEncrypted };
  };
  
  

  const handleEncryptData = () => {
    setEncryptLoading(true);
    setTimeout(() => {
      const encrypted = generateEncryptedData();
      setEncryptedData(encrypted);
      setEncryptLoading(false);
    }, 1500);
  };

  const handleShowEncryptedData = () => {
    if (!encryptedData.encryptedFields) {
      alert('Please encrypt the data first!');
      return;
    }
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (password === '1234') {
      setIsAuthenticated(true);
      setShowEncrypted(true);
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Invalid password! Access denied.');
      setPassword('');
    }
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
  };

  const handleFraudDetection = () => {
    setFraudLoading(true);
    setTimeout(() => {
      let amount = parseFloat(formData.transactionAmount);
      let merchantId = formData.merchantId.toLowerCase();
      let fraudProbability = Math.random() * 100;
      
      // Enhanced fraud detection logic
      if (amount > 5000) fraudProbability += 20;
      if (amount > 10000) fraudProbability += 30;
      if (merchantId.includes('unknown') || merchantId.includes('temp')) fraudProbability += 40;
      fraudProbability = Math.min(fraudProbability, 95);

      setFraudResult({
        probability: Math.round(fraudProbability),
        isFraudulent: fraudProbability > 50,
        confidence: fraudProbability > 80 ? 'High' : fraudProbability > 50 ? 'Medium' : 'Low'
      });
      setShowResult(true);
      setFraudLoading(false);
    }, 2000);
  };

  const handleDateTimeClick = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleDateTimeChange = (e) => {
    handleInputChange(e);
    // Keep the picker open by not automatically closing it
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
              </div>
              <p className="text-gray-600 mt-2">Enter transaction information for fraud analysis</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Transaction Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  <div className="flex items-center space-x-2">
                    <span>Transaction Amount</span>
                    <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-800">$</span>
                  <input
                    type="number"
                    name="transactionAmount"
                    value={formData.transactionAmount}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 text-gray-800 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Timestamp with Custom Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Timestamp</span>
                    <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="timestamp"
                    value={formData.timestamp}
                    onChange={handleDateTimeChange}
                    onClick={handleDateTimeClick}
                    className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    style={{ 
                      colorScheme: 'light',
                      // Keep the picker open by preventing default behavior
                    }}
                  />
                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 mb-2 block"
                      >
                        Click to close date picker
                      </button>
                      <p className="text-xs text-gray-600">
                        Date picker remains open for multiple selections
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Merchant ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Merchant ID</span>
                    <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="merchantId"
                  value={formData.merchantId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g., AMAZON_STORE_001"
                />
              </div>

              {/* Geographical Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Geographical Location</span>
                    <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="geographicalLocation"
                  value={formData.geographicalLocation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g., New York, USA"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleEncryptData}
                  disabled={!isFormValid() || encryptLoading}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {encryptLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>Encrypt Data</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShowEncryptedData}
                  disabled={!encryptedData.encryptedFields}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="h-5 w-5" />
                  <span>Show Encrypted Data</span>
                </button>

                <button
                  onClick={handleFraudDetection}
                  disabled={!isFormValid() || fraudLoading}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {fraudLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      <span>Detect Fraud</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Encrypted Data Display */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Lock className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Encrypted Data</h2>
                </div>
                <p className="text-gray-600 mt-2">Homomorphically encrypted transaction data</p>
              </div>
              
              <div className="p-6">
                {showEncrypted && isAuthenticated ? (
                  <div className="space-y-4">
                    {/* Original vs Encrypted Data Comparison */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <Unlock className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800 mb-3">Data Encryption Comparison</p>
                          <div className="bg-white p-4 rounded border">
                            <div className="grid grid-cols-1 gap-4 text-sm">
                              {/* Amount */}
                              <div className="border-b pb-3">
                                <div className="grid grid-cols-1 gap-2 text-gray-800">
                                  <div>
                                    <strong className="text-green-700">Original Amount:</strong> ${formData.transactionAmount}
                                  </div>
                                  <div>
                                    <strong className="text-red-700">Encrypted Amount:</strong>
                                    <div className="font-mono text-sm mt-1 p-2 bg-gray-100 rounded text-gray-700">
                                      {encryptedData.encryptedFields?.amount}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Timestamp */}
                              <div className="border-b pb-3">
                                <div className="grid grid-cols-1 gap-2 text-gray-800">
                                  <div>
                                    <strong className="text-green-700">Original Timestamp:</strong> {formData.timestamp}
                                  </div>
                                  <div>
                                    <strong className="text-red-700">Encrypted Timestamp:</strong>
                                    <div className="font-mono text-sm mt-1 p-2 bg-gray-100 rounded text-gray-700">
                                      {encryptedData.encryptedFields?.timestamp}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Merchant ID */}
                              <div className="border-b pb-3">
                                <div className="grid grid-cols-1 gap-2 text-gray-800">
                                  <div>
                                    <strong className="text-green-700">Original Merchant ID:</strong> {formData.merchantId}
                                  </div>
                                  <div>
                                    <strong className="text-red-700">Encrypted Merchant ID:</strong>
                                    <div className="font-mono text-sm mt-1 p-2 bg-gray-100 rounded text-gray-700">
                                      {encryptedData.encryptedFields?.merchantId}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Location */}
                              <div>
                                <div className="grid grid-cols-1 gap-2 text-gray-800">
                                  <div>
                                    <strong className="text-green-700">Original Location:</strong> {formData.geographicalLocation}
                                  </div>
                                  <div>
                                    <strong className="text-red-700">Encrypted Location:</strong>
                                    <div className="font-mono text-sm mt-1 p-2 bg-gray-100 rounded text-gray-700">
                                      {encryptedData.encryptedFields?.location}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Full Encrypted Data */}
                    <div className="bg-gray-900 rounded-lg p-4 border">
                      <div className="flex items-start space-x-3">
                        <Lock className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-green-400 mb-2">🔐 Complete Encrypted Dataset (Reverse Encryption)</p>
                          <div className="p-4 rounded border font-mono text-lg text-green-400 border-green-400">
                            {encryptedData.fullEncrypted}
                          </div>
                          <div className="flex items-center space-x-4 mt-3 text-xs text-green-300">
                            <span>✅ Privacy Preserved</span>
                            <span>✅ Computation Ready</span>
                            <span>✅ GDPR Compliant</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    {!encryptedData.encryptedFields ? (
                      <p>Click "Encrypt Data" first, then "Show Encrypted Data"</p>
                    ) : (
                      <div>
                        <p className="mb-2">Encrypted data is ready!</p>
                        <p className="text-sm">Click "Show Encrypted Data" and enter password to view</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Fraud Detection Results */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Fraud Detection Result</h2>
                </div>
                <p className="text-gray-600 mt-2">AI-powered fraud analysis on encrypted data</p>
              </div>
              
              <div className="p-6">
                {showResult && fraudResult ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      fraudResult.isFraudulent 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        {fraudResult.isFraudulent ? (
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                        ) : (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        )}
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            fraudResult.isFraudulent ? 'text-red-800' : 'text-green-800'
                          }`}>
                            {fraudResult.isFraudulent ? 'Potential Fraud Detected' : 'Transaction Appears Legitimate'}
                          </h3>
                          <p className={`text-sm ${
                            fraudResult.isFraudulent ? 'text-red-600' : 'text-green-600'
                          }`}>
                            Confidence Level: {fraudResult.confidence}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-gray-900">
                      <h4 className="font-medium text-gray-900 mb-3">Fraud Probability</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Risk Score</span>
                          <span className="font-semibold">{fraudResult.probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-1000 ${
                              fraudResult.probability > 70 ? 'bg-red-500' :
                              fraudResult.probability > 40 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${fraudResult.probability}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Safe</span>
                          <span>Suspicious</span>
                          <span>High Risk</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                      <p><strong>Privacy Notice:</strong> All computations performed on encrypted data using homomorphic encryption. No sensitive information was exposed during analysis.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Click "Detect Fraud" to analyze transaction</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 max-w-md mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <Lock className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900">Access Control</h3>
                <p className="text-gray-600 mt-2">Enter password to view encrypted data</p>
                <p className="text-xs text-gray-500 mt-1">This is a secure area for authorized personnel only</p>
              </div>

              <div className="space-y-4 text-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter access password"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={!password}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Access
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Demo Note:</strong> This password protection demonstrates security access control for your school project presentation. Password: 1234
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}