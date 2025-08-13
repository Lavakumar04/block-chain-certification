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
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playVerifySound = async (valid) => {
    try {
      const ctx = initAudio();
      
      if (valid) {
        // Success sound - beautiful chord progression
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        frequencies.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.05 + (index * 0.1));
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8 + (index * 0.1));
          
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.8 + (index * 0.1));
        });
      } else {
        // Error sound - low frequency warning
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.setValueAtTime(55, ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {}
  };

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
      // Call actual backend API
      const response = await fetch(`http://localhost:5000/api/verification/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificateId: certificateId.trim() })
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setVerificationResult(result.verification);
        playVerifySound(result.verification.isValid);
      } else {
        throw new Error(result.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify certificate. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const openBlockchainExplorer = (hash) => {
    window.open(`https://etherscan.io/tx/${hash}`, '_blank');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // For now, we'll use mock QR data since QR parsing requires additional libraries
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
    setTimeout(() => {
      // Simulate QR scan - in real implementation, this would use a camera
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
    }, 1500);
  };

  const resetForm = () => {
    setCertificateId('');
    setVerificationResult(null);
    setError('');
    setScannedData(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-400 mb-2">Certificate Verification</h1>
          <p className="text-gray-400">
            Verify the authenticity of academic certificates using blockchain technology
          </p>
        </div>

        <div className="card mb-8">
          {/* Verification Method Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Choose Verification Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setVerificationMethod('manual')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  verificationMethod === 'manual'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <span className="block font-medium">Manual Entry</span>
                <span className="text-sm opacity-75">Enter Certificate ID</span>
              </button>

              <button
                onClick={handleQRScan}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  verificationMethod === 'qr'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                <QrCode className="h-8 w-8 mx-auto mb-2" />
                <span className="block font-medium">QR Scanner</span>
                <span className="text-sm opacity-75">Scan QR Code</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  verificationMethod === 'file'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <span className="block font-medium">File Upload</span>
                <span className="text-sm opacity-75">Upload QR Image</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Manual Verification Form */}
          {verificationMethod === 'manual' && (
            <form onSubmit={handleManualVerification} className="space-y-6">
              <div>
                <label htmlFor="certificateId" className="block text-sm font-medium text-gray-300 mb-2">
                  Certificate ID
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="certificateId"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    placeholder="Enter certificate ID (e.g., CERT-12345)"
                    className="input-field flex-1"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="btn-primary flex items-center space-x-2 min-w-[140px]"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5" />
                        <span>Verify</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* QR Scanner Overlay */}
          {showQRScanner && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
              <div className="bg-gray-900 p-8 rounded-lg text-center">
                <Camera className="h-16 w-16 text-primary-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-white mb-2">QR Scanner Active</h3>
                <p className="text-gray-300 mb-4">Point camera at QR code...</p>
                <div className="w-64 h-64 border-2 border-primary-500/50 rounded-lg flex items-center justify-center">
                  <div className="text-primary-400 text-sm">Camera Feed</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-error-900/40 border border-error-700/40 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-error-400" />
                <span className="text-error-200">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`card ${verificationResult.isValid ? 'verification-success-glow' : 'verification-fail-glow'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {verificationResult.isValid ? (
                  <CheckCircle className="h-8 w-8 text-success-400" />
                ) : (
                  <XCircle className="h-8 w-8 text-error-400" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {verificationResult.isValid ? 'Certificate Verified!' : 'Verification Failed'}
                  </h2>
                  <p className="text-gray-300">
                    {verificationResult.isValid ? 'This certificate is authentic and valid' : verificationResult.message}
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="btn-outline"
              >
                Verify Another
              </button>
            </div>

            {verificationResult.isValid && verificationResult.certificate && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Certificate Details */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Certificate Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-400">Student/Recipient:</span>
                      <p className="text-white text-lg font-medium">{verificationResult.certificate.studentName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Course/Program:</span>
                      <p className="text-white text-lg font-medium">{verificationResult.certificate.courseName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Completion Date:</span>
                      <p className="text-white">{new Date(verificationResult.certificate.completionDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Issuer Name:</span>
                      <p className="text-white">{verificationResult.certificate.issuerName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Organization:</span>
                      <p className="text-white">{verificationResult.certificate.issuerOrganization}</p>
                    </div>
                    {verificationResult.certificate.grade && (
                      <div>
                        <span className="text-sm font-medium text-gray-400">Grade:</span>
                        <p className="text-white">{verificationResult.certificate.grade}</p>
                      </div>
                    )}
                    {verificationResult.certificate.duration && (
                      <div>
                        <span className="text-sm font-medium text-gray-400">Duration:</span>
                        <p className="text-white">{verificationResult.certificate.duration}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Blockchain Information */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Blockchain Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-400">Certificate ID:</span>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-mono text-primary-300 break-all">{verificationResult.certificate.certificateId}</p>
                        <button onClick={() => copyToClipboard(verificationResult.certificate.certificateId)} className="text-primary-400 hover:text-primary-300">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Hash:</span>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-mono text-primary-300 break-all">{verificationResult.certificate.certificateHash}</p>
                        <button onClick={() => copyToClipboard(verificationResult.certificate.certificateHash)} className="text-primary-400 hover:text-primary-300">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Transaction Hash:</span>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-mono text-primary-300 break-all neon-text">{verificationResult.certificate.blockchainTxHash}</p>
                        <button onClick={() => copyToClipboard(verificationResult.certificate.blockchainTxHash)} className="text-primary-400 hover:text-primary-300">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button onClick={() => openBlockchainExplorer(verificationResult.certificate.blockchainTxHash)} className="text-primary-400 hover:text-primary-300">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Block Number:</span>
                      <p className="text-white">{verificationResult.certificate.blockNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        verificationResult.certificate.status === 'active' 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-error-100 text-error-800'
                      }`}>
                        {verificationResult.certificate.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain Verification Status */}
            {verificationResult.blockchainVerification && (
              <div className="border-t border-gray-800 mt-8 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Blockchain Verification Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${verificationResult.blockchainVerification.hashExists ? 'bg-success-400' : 'bg-error-400'}`}></div>
                      <span className="text-sm font-medium text-gray-300">Hash Exists</span>
                    </div>
                    <p className="text-white">{verificationResult.blockchainVerification.hashExists ? 'Verified' : 'Not Found'}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${!verificationResult.blockchainVerification.isRevoked ? 'bg-success-400' : 'bg-error-400'}`}></div>
                      <span className="text-sm font-medium text-gray-300">Revocation Status</span>
                    </div>
                    <p className="text-white">{verificationResult.blockchainVerification.isRevoked ? 'Revoked' : 'Active'}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-primary-400"></div>
                      <span className="text-sm font-medium text-gray-300">Last Verified</span>
                    </div>
                    <p className="text-white">{new Date(verificationResult.blockchainVerification.lastVerified).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
