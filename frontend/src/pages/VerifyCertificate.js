import React, { useState, useRef } from 'react';
import { Search, QrCode, FileText, CheckCircle, XCircle, AlertTriangle, Loader2, Copy, ExternalLink, Camera, Upload } from 'lucide-react';

const VerifyCertificate = () => {
  const [verificationMethod, setVerificationMethod] = useState('manual');
  const [certificateId, setCertificateId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const fileInputRef = useRef(null);

  const handleManualVerification = async (e) => {
    e.preventDefault();
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    try {
      // Simulate API call - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      const mockResult = {
        isValid: Math.random() > 0.3, // 70% chance of being valid
        certificate: {
          id: certificateId,
          studentName: 'John Doe',
          courseName: 'Blockchain Development',
          completionDate: '2024-01-15',
          issuerName: 'Dr. Jane Smith',
          issuerOrganization: 'Tech University',
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 1000000),
          status: 'active',
          issuedAt: '2024-01-15T10:30:00Z'
        },
        blockchainVerification: {
          hashExists: true,
          isRevoked: false,
          lastVerified: new Date().toISOString()
        }
      };

      setVerificationResult(mockResult);
    } catch (err) {
      setError('Failed to verify certificate. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const openBlockchainExplorer = (hash) => {
    // This would open the actual blockchain explorer
    window.open(`https://etherscan.io/tx/${hash}`, '_blank');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate QR code reading from image
      // In a real app, you'd use a QR code reading library
      const reader = new FileReader();
      reader.onload = () => {
        // Mock QR code data
        const mockQRData = {
          id: 'CERT-' + Math.floor(Math.random() * 10000),
          hash: '0x' + Math.random().toString(16).substr(2, 64),
          studentName: 'Sample Student',
          courseName: 'Sample Course'
        };
        setScannedData(mockQRData);
        setCertificateId(mockQRData.id);
        setVerificationMethod('qr');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
    // In a real app, you'd implement camera access and QR scanning
    // For now, we'll simulate it
    setTimeout(() => {
      const mockQRData = {
        id: 'CERT-' + Math.floor(Math.random() * 10000),
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        studentName: 'Scanned Student',
        courseName: 'Scanned Course'
      };
      setScannedData(mockQRData);
      setCertificateId(mockQRData.id);
      setShowQRScanner(false);
      setVerificationMethod('qr');
    }, 2000);
  };

  const resetForm = () => {
    setCertificateId('');
    setVerificationResult(null);
    setError('');
    setScannedData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Search className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Digital Certificate</h1>
          <p className="text-lg text-gray-600">Verify the authenticity of blockchain-based digital certificates</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Verification Method Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Verification Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setVerificationMethod('manual')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  verificationMethod === 'manual'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <span className="font-medium">Manual Entry</span>
                <p className="text-sm text-gray-600 mt-1">Enter certificate ID manually</p>
              </button>
              
              <button
                onClick={handleQRScan}
                className={`p-4 rounded-lg border-2 transition-all ${
                  verificationMethod === 'qr'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Camera className="h-8 w-8 mx-auto mb-2" />
                <span className="font-medium">Scan QR Code</span>
                <p className="text-sm text-gray-600 mt-1">Use camera to scan QR code</p>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-lg border-2 transition-all ${
                  verificationMethod === 'upload'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <span className="font-medium">Upload QR Image</span>
                <p className="text-sm text-gray-600 mt-1">Upload QR code image file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </button>
            </div>
          </div>

          {/* Manual Verification Form */}
          {verificationMethod === 'manual' && (
            <form onSubmit={handleManualVerification} className="space-y-6">
              <div>
                <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID *
                </label>
                <input
                  type="text"
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="input-field"
                  placeholder="Enter certificate ID (e.g., CERT-123456789)"
                  required
                />
              </div>

              {error && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-error-500" />
                    <span className="text-error-700">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="btn-primary flex items-center space-x-2 min-w-[200px]"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>Verify Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* QR Code Scanner */}
          {verificationMethod === 'qr' && (
            <div className="text-center space-y-6">
              <div className="bg-gray-100 rounded-lg p-8">
                <QrCode className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">QR Code Scanner</p>
                <p className="text-sm text-gray-500 mt-2">
                  This feature will be implemented with camera access for QR code scanning
                </p>
              </div>
              <button
                onClick={() => setVerificationMethod('manual')}
                className="btn-outline"
              >
                Use Manual Entry Instead
              </button>
            </div>
          )}
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              {verificationResult.isValid ? (
                <div className="flex items-center justify-center space-x-2 text-success-600 mb-2">
                  <CheckCircle className="h-8 w-8" />
                  <span className="text-2xl font-bold">Certificate Verified!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-error-600 mb-2">
                  <XCircle className="h-8 w-8" />
                  <span className="text-2xl font-bold">Certificate Invalid!</span>
                </div>
              )}
              <p className="text-gray-600">
                {verificationResult.isValid 
                  ? 'This certificate is authentic and verified on the blockchain'
                  : 'This certificate could not be verified or may be invalid'
                }
              </p>
            </div>

            {verificationResult.isValid && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Certificate Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Student Name:</span>
                        <p className="text-gray-900">{verificationResult.certificate.studentName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Course:</span>
                        <p className="text-gray-900">{verificationResult.certificate.courseName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Completion Date:</span>
                        <p className="text-gray-900">{verificationResult.certificate.completionDate}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Issuer:</span>
                        <p className="text-gray-900">{verificationResult.certificate.issuerName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Organization:</span>
                        <p className="text-gray-900">{verificationResult.certificate.issuerOrganization}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Certificate ID:</span>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-mono text-gray-900 break-all">{verificationResult.certificate.id}</p>
                          <button
                            onClick={() => copyToClipboard(verificationResult.certificate.id)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Hash:</span>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-mono text-gray-900 break-all">{verificationResult.certificate.hash}</p>
                          <button
                            onClick={() => copyToClipboard(verificationResult.certificate.hash)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Transaction Hash:</span>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-mono text-gray-900 break-all">{verificationResult.certificate.transactionHash}</p>
                          <button
                            onClick={() => copyToClipboard(verificationResult.certificate.transactionHash)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Block Number:</span>
                        <p className="text-gray-900">{verificationResult.certificate.blockNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          {verificationResult.certificate.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => openBlockchainExplorer(verificationResult.certificate.transactionHash)}
                      className="btn-secondary flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>View on Blockchain Explorer</span>
                    </button>
                    <button
                      onClick={resetForm}
                      className="btn-outline"
                    >
                      Verify Another Certificate
                    </button>
                  </div>
                </div>
              </>
            )}

            {!verificationResult.isValid && (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  The certificate with ID "{verificationResult.certificate.id}" could not be verified.
                </p>
                <button
                  onClick={resetForm}
                  className="btn-primary"
                >
                  Try Another Certificate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
