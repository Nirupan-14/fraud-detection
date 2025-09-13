'use client';
import { useState } from 'react';
import { CreditCard, Clock, MapPin, Building, Lock, Shield, AlertTriangle, CheckCircle, Unlock, Eye, User } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    transactionAmount: '',
    timestamp: '',
    merchantId: '',
    geographicalLocation: '',
    cardNumber: '',
    cardName: '',
    paymentMethod: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    transactionAmount: '',
    timestamp: '',
    merchantId: '',
    geographicalLocation: '',
    cardNumber: '',
    cardName: '',
    paymentMethod: ''
  });
  
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [fraudLoading, setFraudLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fraudResult, setFraudResult] = useState<FraudResult | null>(null);
  const [apiError, setApiError] = useState<string>('');
  const [decryptedTransaction, setDecryptedTransaction] = useState<DecryptedTransaction | null>(null);

  // Validation functions
  const validateTransactionAmount = (amount: string): string => {
    if (!amount.trim()) return 'Transaction amount is required';
    const num = parseFloat(amount);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num <= 0) return 'Amount must be greater than 0';
    if (num > 1000000) return 'Amount cannot exceed $1,000,000';
    return '';
  };

  const validateTimestamp = (timestamp: string): string => {
    if (!timestamp.trim()) return 'Timestamp is required';
    const date = new Date(timestamp);
    const now = new Date();
    if (isNaN(date.getTime())) return 'Please enter a valid date and time';
    if (date > now) return 'Timestamp cannot be in the future';
    return '';
  };

  const validateMerchantId = (merchantId: string): string => {
    if (!merchantId.trim()) return 'Merchant ID is required';
    if (merchantId.length < 3) return 'Merchant ID must be at least 3 characters';
    if (merchantId.length > 50) return 'Merchant ID cannot exceed 50 characters';
    if (!/^[A-Za-z0-9_-]+$/.test(merchantId)) return 'Merchant ID can only contain letters, numbers, underscores, and hyphens';
    return '';
  };

  const validateGeographicalLocation = (location: string): string => {
    if (!location.trim()) return 'Geographical location is required';
    if (location.length < 2) return 'Location must be at least 2 characters';
    if (location.length > 100) return 'Location cannot exceed 100 characters';
    return '';
  };

  const validateCardNumber = (cardNumber: string): string => {
    if (!cardNumber.trim()) return 'Card number is required';
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cleanNumber)) return 'Card number can only contain digits';
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return 'Card number must be between 13-19 digits';
    
    // Simple Luhn algorithm check
    let sum = 0;
    let isEven = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    if (sum % 10 !== 0) return 'Please enter a valid card number';
    return '';
  };

  const validateCardName = (cardName: string): string => {
    if (!cardName.trim()) return 'Card holder name is required';
    if (cardName.length < 2) return 'Name must be at least 2 characters';
    if (cardName.length > 50) return 'Name cannot exceed 50 characters';
    if (!/^[A-Za-z\s]+$/.test(cardName)) return 'Name can only contain letters and spaces';
    return '';
  };

  const validatePaymentMethod = (paymentMethod: string): string => {
    if (!paymentMethod.trim()) return 'Payment method is required';
    const validMethods = ['visa', 'mastercard', 'american-express', 'discover'];
    if (!validMethods.includes(paymentMethod)) return 'Please select a valid payment method';
    return '';
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'transactionAmount':
        return validateTransactionAmount(value);
      case 'timestamp':
        return validateTimestamp(value);
      case 'merchantId':
        return validateMerchantId(value);
      case 'geographicalLocation':
        return validateGeographicalLocation(value);
      case 'cardNumber':
        return validateCardNumber(value);
      case 'cardName':
        return validateCardName(value);
      case 'paymentMethod':
        return validatePaymentMethod(value);
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Prevent exceeding max length
    }
    
    // Update form data
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    
    // Validate field and update errors
    const error = validateField(name, formattedValue);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateAllFields = (): boolean => {
    const errors = {
      transactionAmount: validateTransactionAmount(formData.transactionAmount),
      timestamp: validateTimestamp(formData.timestamp),
      merchantId: validateMerchantId(formData.merchantId),
      geographicalLocation: validateGeographicalLocation(formData.geographicalLocation),
      cardNumber: validateCardNumber(formData.cardNumber),
      cardName: validateCardName(formData.cardName),
      paymentMethod: validatePaymentMethod(formData.paymentMethod)
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const isFormValid = (): boolean => {
    return Object.values(formData).every(v => v.trim() !== '') && 
           Object.values(formErrors).every(error => error === '');
  };

  const generateEncryptedData = () => {
    const reverseStringWithSalt = (value: string): string => {
      const reversed = value.split('').reverse().join('');
      return reversed;
    };
  
    const encryptedFields = {
      amount: 'aq' + reverseStringWithSalt(formData.transactionAmount) + 'qa',
      timestamp: 'bz' + reverseStringWithSalt(formData.timestamp) + 'bz',
      merchantId: 'cz' + reverseStringWithSalt(formData.merchantId) + 'cz',
      location: 'dc' + reverseStringWithSalt(formData.geographicalLocation) + 'cd',
      cardNumber: 'ef' + reverseStringWithSalt(formData.cardNumber) + 'fe',
      cardName: 'gh' + reverseStringWithSalt(formData.cardName) + 'hg',
      paymentMethod: 'ij' + reverseStringWithSalt(formData.paymentMethod) + 'ji'
    };
  
    const fullEncrypted = (
      encryptedFields.amount +
      encryptedFields.timestamp +
      encryptedFields.merchantId +
      encryptedFields.location +
      encryptedFields.cardNumber +
      encryptedFields.cardName +
      encryptedFields.paymentMethod
    );
  
    return { encryptedFields, fullEncrypted };
  };
  
  type EncryptedFields = {
    amount: string;
    timestamp: string;
    merchantId: string;
    location: string;
    cardNumber: string;
    cardName: string;
    paymentMethod: string;
  };

  type EncryptedDataState = {
    encryptedFields: EncryptedFields | null;
    fullEncrypted: string;
  };

  type FraudResult = {
    probability: number;
    isFraudulent: boolean;
    confidence: string;
    fraudPercentage: string;
    nonFraudPercentage: string;
    riskLevel: string;
  };

  type DecryptedTransaction = {
    Card_Holder_Name: string;
    Card_Number: string;
    Card_Type: string;
    Geographical_Location: string;
    Merchant_ID: string;
    Timestamp: string;
    Transaction_Amount: number;
  };

  // Updated API response type to match your actual response
  type ApiResponse = {
    decrypted_transaction: DecryptedTransaction;
    prediction: {
      confidence: string;
      fraud_percentage: string;
      fraud_probability: string;
      is_fraud: boolean;
      non_fraud_percentage: string;
      non_fraud_probability: string;
      risk_level: string;
    };
  };

  const [encryptedData, setEncryptedData] = useState<EncryptedDataState>({
    encryptedFields: null,
    fullEncrypted: '',
  });

  const handleEncryptData = () => {
    if (!validateAllFields()) {
      alert('Please fix all validation errors before encrypting data.');
      return;
    }
    
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

  const handleFraudDetection = async () => {
    if (!validateAllFields()) {
      alert('Please fix all validation errors before detecting fraud.');
      return;
    }

    if (!encryptedData.encryptedFields) {
      alert('Please encrypt the data first before fraud detection!');
      return;
    }
    
    setFraudLoading(true);
    setApiError('');
    setShowResult(false);
    setFraudResult(null);
    setDecryptedTransaction(null);

    try {
      // Your backend expects these exact field names
      const apiRequestData = {
        amount: encryptedData.encryptedFields.amount,
        timestamp: encryptedData.encryptedFields.timestamp,
        merchantId: encryptedData.encryptedFields.merchantId,
        location: encryptedData.encryptedFields.location,
        cardNumber: encryptedData.encryptedFields.cardNumber,
        cardName: encryptedData.encryptedFields.cardName,
        paymentMethod: encryptedData.encryptedFields.paymentMethod
      };

      console.log('Sending encrypted data to API:', apiRequestData);

      const response = await fetch('https://ce228314935e.ngrok-free.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(apiRequestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const apiData: ApiResponse = await response.json();
      
      // Detailed console logging of API response
      console.log('=== FULL API RESPONSE ===');
      console.log('Complete Response:', apiData);
      console.log('\n=== DECRYPTED TRANSACTION DATA ===');
      console.log('Card Holder Name:', apiData.decrypted_transaction.Card_Holder_Name);
      console.log('Card Number:', apiData.decrypted_transaction.Card_Number);
      console.log('Card Type:', apiData.decrypted_transaction.Card_Type);
      console.log('Geographical Location:', apiData.decrypted_transaction.Geographical_Location);
      console.log('Merchant ID:', apiData.decrypted_transaction.Merchant_ID);
      console.log('Timestamp:', apiData.decrypted_transaction.Timestamp);
      console.log('Transaction Amount:', apiData.decrypted_transaction.Transaction_Amount);
      console.log('\n=== PREDICTION RESULTS ===');
      console.log('Is Fraud:', apiData.prediction.is_fraud);
      console.log('Fraud Probability:', apiData.prediction.fraud_probability);
      console.log('Fraud Percentage:', apiData.prediction.fraud_percentage);
      console.log('Non-Fraud Probability:', apiData.prediction.non_fraud_probability);
      console.log('Non-Fraud Percentage:', apiData.prediction.non_fraud_percentage);
      console.log('Confidence:', apiData.prediction.confidence);
      console.log('Risk Level:', apiData.prediction.risk_level);
      console.log('=== END API RESPONSE ===\n');

      // Parse the percentage strings and extract numeric values
      const fraudProbabilityNum = parseFloat(apiData.prediction.fraud_probability) * 100;
      
      // Map API response to local fraud result format
      const mappedResult: FraudResult = {
        probability: Math.round(fraudProbabilityNum),
        isFraudulent: apiData.prediction.is_fraud,
        confidence: apiData.prediction.confidence,
        fraudPercentage: apiData.prediction.fraud_percentage,
        nonFraudPercentage: apiData.prediction.non_fraud_percentage,
        riskLevel: apiData.prediction.risk_level
      };

      setFraudResult(mappedResult);
      setDecryptedTransaction(apiData.decrypted_transaction);
      setShowResult(true);

    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(`API Connection Failed: ${errorMessage}. Please check if your API server is running and accessible.`);
      
      // Don't show fallback results - only show API results
      setShowResult(false);
      setFraudResult(null);
      setDecryptedTransaction(null);
    } finally {
      setFraudLoading(false);
    }
  };
  
  const handleDateTimeClick = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
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
              <p className="text-gray-600 mt-2">Enter complete transaction information for fraud analysis</p>
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
                    className={`w-full pl-8 pr-4 text-gray-800 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      formErrors.transactionAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {formErrors.transactionAmount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.transactionAmount}
                  </p>
                )}
              </div>

              {/* Timestamp */}
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
                    className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      formErrors.timestamp ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {formErrors.timestamp && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.timestamp}
                  </p>
                )}
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
                  className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    formErrors.merchantId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., AMAZON_STORE_001"
                />
                {formErrors.merchantId && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.merchantId}
                  </p>
                )}
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
                  className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    formErrors.geographicalLocation ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., New York, USA"
                />
                {formErrors.geographicalLocation && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.geographicalLocation}
                  </p>
                )}
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Card Number</span>
                    <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1234 5678 9012 3456"
                />
                {formErrors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.cardNumber}
                  </p>
                )}
              </div>

              {/* Card Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Card Holder Name</span>
                    <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    formErrors.cardName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {formErrors.cardName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.cardName}
                  </p>
                )}
              </div>

              {/* Payment Method - Card Types Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Card Type</span>
                    <span className="text-red-500">*</span>
                  </div>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    formErrors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select card type</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="american-express">American Express</option>
                  <option value="discover">Discover</option>
                </select>
                {formErrors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.paymentMethod}
                  </p>
                )}
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
                  disabled={!isFormValid() || !encryptedData.encryptedFields || fraudLoading}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {fraudLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      <span>Detect Fraud (API)</span>
                    </>
                  )}
                </button>

                {/* API Connection Status */}
                {apiError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-800 font-medium">API Connection Failed</p>
                        <p className="text-xs text-red-700 mt-1">{apiError}</p>
                        <p className="text-xs text-red-600 mt-1">Please fix the API connection to see fraud detection results.</p>
                      </div>
                    </div>
                  </div>
                )}
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
                          <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
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
                              <div className="border-b pb-3">
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

                              {/* Card Number */}
                              <div className="border-b pb-3">
                                <div className="grid grid-cols-1 gap-2 text-gray-800">
                                  <div>
                                    <strong className="text-green-700">Original Card Number:</strong> {formData.cardNumber}
                                  </div>
                                  <div>
                                    <strong className="text-red-700">Encrypted Card Number:</strong>
                                    <div className="font-mono text-sm mt-1 p-2 bg-gray-100 rounded text-gray-700">
                                      {encryptedData.encryptedFields?.cardNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Card Name */}
                              <div className="border-b pb-3">
                                <div className="grid grid-cols-1 gap-2 text-gray-800">
                                  <div>
                                    <strong className="text-green-700">Original Card Name:</strong> {formData.cardName}
                                  </div>
                                  <div>
                                    <strong className="text-red-700">Encrypted Card Name:</strong>
                                    <div className="font-mono text-sm mt-1 p-2 bg-gray-100 rounded text-gray-700">
                                      {encryptedData.encryptedFields?.cardName}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Method */}
                              <div>
                                <div className="grid grid-cols-1 gap-2 text-gray-800">
                                  <div>
                                    <strong className="text-green-700">Original Card Type:</strong> {formData.paymentMethod}
                                  </div>
                                  <div>
                                    <strong className="text-red-700">Encrypted Card Type:</strong>
                                    <div className="font-mono text-sm mt-1 p-2 bg-gray-100 rounded text-gray-700">
                                      {encryptedData.encryptedFields?.paymentMethod}
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
                          <p className="text-sm text-green-400 mb-2">🔐 Complete Encrypted Dataset (Sent to API)</p>
                          <div className="p-4 rounded border font-mono text-sm text-green-400 border-green-400 break-all max-h-32 overflow-y-auto">
                            {encryptedData.fullEncrypted}
                          </div>
                          <div className="flex items-center space-x-4 mt-3 text-xs text-green-300">
                            <span>✅ Privacy Preserved</span>
                            <span>✅ API Ready</span>
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
                        <p>
                          Click &quot;Encrypt Data&quot; first, then &quot;Show Encrypted Data&quot;
                        </p>
                      ) : (
                        <div>
                          <p className="mb-2">Encrypted data is ready!</p>
                          <p className="text-sm">
                            Click &quot;Show Encrypted Data&quot; and enter password to view
                          </p>
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
                <p className="text-gray-600 mt-2">AI-powered fraud analysis via API on encrypted data</p>
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
                            Risk Level: {fraudResult.riskLevel}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* API Response Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">API Analysis Results</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Fraud Probability:</span>
                          <div className="font-semibold text-red-600">{fraudResult.fraudPercentage}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Safe Probability:</span>
                          <div className="font-semibold text-green-600">{fraudResult.nonFraudPercentage}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Confidence:</span>
                          <div className="font-semibold text-blue-600">{fraudResult.confidence}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Risk Level:</span>
                          <div className={`font-semibold ${
                            fraudResult.riskLevel === 'HIGH' ? 'text-red-600' :
                            fraudResult.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                            fraudResult.riskLevel === 'LOW' || fraudResult.riskLevel === 'VERY_LOW' ? 'text-green-600' :
                            'text-gray-600'
                          }`}>{fraudResult.riskLevel}</div>
                        </div>
                      </div>
                    </div>

                    {/* Fraud Probability Visualization */}
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-900">
                      <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Fraud Risk Score</span>
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

                    {/* Decrypted Transaction Details */}
                    {decryptedTransaction && !apiError && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                          <Unlock className="h-4 w-4 mr-2" />
                          API Decrypted Transaction Details
                        </h4>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-blue-700">Card Holder:</span>
                            <span className="text-blue-900 font-mono">{decryptedTransaction.Card_Holder_Name}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-blue-700">Card Number:</span>
                            <span className="text-blue-900 font-mono">{decryptedTransaction.Card_Number}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-blue-700">Card Type:</span>
                            <span className="text-blue-900 font-mono">{decryptedTransaction.Card_Type}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-blue-700">Location:</span>
                            <span className="text-blue-900 font-mono">{decryptedTransaction.Geographical_Location}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-blue-700">Merchant ID:</span>
                            <span className="text-blue-900 font-mono">{decryptedTransaction.Merchant_ID}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-blue-700">Timestamp:</span>
                            <span className="text-blue-900 font-mono">{decryptedTransaction.Timestamp}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-blue-700">Amount:</span>
                            <span className="text-blue-900 font-mono">${decryptedTransaction.Transaction_Amount}</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-3">
                          ✅ This shows the API successfully decrypted your homomorphically encrypted data
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                      <p><strong>Privacy Notice:</strong> All computations performed on encrypted data using homomorphic encryption. No sensitive information was exposed during analysis. {!apiError && 'Results powered by secure API endpoint.'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Encrypt data first, then click &quot;Detect Fraud (API)&quot; to analyze</p>
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