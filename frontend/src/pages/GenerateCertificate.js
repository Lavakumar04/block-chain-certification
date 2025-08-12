import React, { useState, useRef } from 'react';
import { FileText, Download, CheckCircle, AlertCircle, Loader2, Copy } from 'lucide-react';

const GenerateCertificate = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    courseName: '',
    completionDate: '',
    issuerName: '',
    issuerOrganization: '',
    description: '',
    grade: '',
    duration: '',
    certificateType: 'course'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [showMinting, setShowMinting] = useState(false);
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playMintSound = async () => {
    try {
      const ctx = initAudio();
      
      // Create multiple oscillators for rich sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      
      // First oscillator - main tone
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.8);
      
      // Second oscillator - harmony
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(330, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.8);
      
      // Gain envelopes
      gain1.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.1);
      gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
      
      gain2.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
      
      // Connect and start
      osc1.connect(gain1).connect(ctx.destination);
      osc2.connect(gain2).connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.0);
      osc2.stop(ctx.currentTime + 1.0);
    } catch {}
  };

  const playSuccessChime = async () => {
    try {
      const ctx = initAudio();
      
      // Create a chord progression
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      const oscillators = [];
      const gains = [];
      
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.05 + (index * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8 + (index * 0.1));
        
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8 + (index * 0.1));
        
        oscillators.push(osc);
        gains.push(gain);
      });
    } catch {}
  };

  const playProgressSound = async () => {
    try {
      const ctx = initAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copy = (text) => navigator.clipboard.writeText(text);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowMinting(true);
    setError('');
    setIsSuccess(false);
    
    // Play minting sound
    playMintSound();
    
    // Play progress sounds during minting
    const progressInterval = setInterval(playProgressSound, 800);

    try {
      // Call actual backend API for certificate generation
      const response = await fetch('http://localhost:5000/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('instituteToken')}` // Get token from localStorage
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Certificate generation failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        clearInterval(progressInterval);
        setCertificateData(result.certificate);
        setIsSuccess(true);
        playSuccessChime();
      } else {
        throw new Error(result.message || 'Certificate generation failed');
      }
    } catch (err) {
      console.error('Certificate generation error:', err);
      clearInterval(progressInterval);
      setError(err.message || 'Failed to generate certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowMinting(false);
    }
  };

  const downloadCertificate = async () => {
    try {
      if (!certificateData || !certificateData.certificateId) {
        setError('No certificate data available for download');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/certificates/${certificateData.certificateId}/pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateData.studentName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download certificate. Please try again.');
    }
  };

  const downloadQRCode = async () => {
    try {
      if (!certificateData || !certificateData.certificateId) {
        setError('No certificate data available for download');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/certificates/${certificateData.certificateId}/qr`);
      
      if (!response.ok) {
        throw new Error('Failed to download QR code');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${certificateData.studentName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download QR code. Please try again.');
    }
  };

  const downloadImage = async () => {
    try {
      if (!certificateData || !certificateData.certificateId) {
        setError('No certificate data available for download');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/certificates/${certificateData.certificateId}/image`);
      
      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateData.studentName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download image. Please try again.');
    }
  };

  if (isSuccess && certificateData) {
    return (
      <div className="min-h-screen bg-gray-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-success-400 mx-auto mb-4 pulse-glow" />
            <h1 className="text-3xl font-bold text-white mb-2 neon-text">Certificate Minted Successfully!</h1>
            <p className="text-lg text-gray-300">Your digital certificate has been created and stored on the blockchain.</p>
          </div>

          <div className="card-blockchain mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Certificate Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-400">Student Name:</span>
                    <p className="text-white">{certificateData.studentName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-400">Course:</span>
                    <p className="text-white">{certificateData.courseName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-400">Completion Date:</span>
                    <p className="text-white">{certificateData.completionDate}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-400">Issuer:</span>
                    <p className="text-white">{certificateData.issuerName}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Blockchain Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-400">Certificate ID:</span>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono text-primary-300 break-all">{certificateData.certificateId}</p>
                      <button onClick={() => copy(certificateData.certificateId)} className="text-primary-400 hover:text-primary-300"><Copy className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-400">Hash:</span>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono text-primary-300 break-all">{certificateData.certificateHash}</p>
                      <button onClick={() => copy(certificateData.certificateHash)} className="text-primary-400 hover:text-primary-300"><Copy className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-400">Transaction Hash:</span>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono text-primary-300 break-all neon-text">{certificateData.blockchainTxHash}</p>
                      <button onClick={() => copy(certificateData.blockchainTxHash)} className="text-primary-400 hover:text-primary-300"><Copy className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-400">Block Number:</span>
                    <p className="text-white">{certificateData.blockNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={downloadCertificate} className="btn-primary flex items-center justify-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Download Certificate (PDF)</span>
                </button>
                <button onClick={downloadImage} className="btn-secondary flex items-center justify-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Download Certificate (Image)</span>
                </button>
                <button onClick={downloadQRCode} className="btn-outline flex items-center justify-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Download QR Code</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setIsSuccess(false);
                setCertificateData(null);
                setFormData({
                  studentName: '', courseName: '', completionDate: '', issuerName: '', issuerOrganization: '', description: '', grade: '', duration: '', certificateType: 'course'
                });
              }}
              className="btn-outline"
            >
              Generate Another Certificate
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 relative">
      {/* Enhanced minting overlay */}
      {showMinting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="relative w-80 h-80 rounded-full border-2 border-primary-500/50 flex items-center justify-center minting-grid">
            {/* Multiple animated rings */}
            <div className="absolute inset-0 rounded-full border border-primary-400/30 animate-ping"></div>
            <div className="absolute inset-8 rounded-full border border-primary-500/40 animate-pulse" style={{animationDelay:'0.2s'}}></div>
            <div className="absolute inset-16 rounded-full border border-primary-600/50 animate-ping" style={{animationDelay:'0.4s'}}></div>
            <div className="absolute inset-24 rounded-full border border-primary-700/60 animate-pulse" style={{animationDelay:'0.6s'}}></div>
            
            {/* Rotating elements */}
            <div className="absolute w-32 h-32 rounded-full border-2 border-primary-400 animate-spin"></div>
            <div className="absolute w-24 h-24 rounded-full border-2 border-primary-500 animate-spin" style={{animationDirection:'reverse', animationDuration:'3s'}}></div>
            
            <div className="text-center z-20">
              <div className="text-primary-300 font-semibold mb-2 text-lg">Minting on Blockchain...</div>
              <div className="text-xs text-gray-400 mb-4">Generating hash and transaction</div>
              
              {/* Progress indicators */}
              <div className="flex space-x-2 justify-center">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{animationDelay:'0.2s'}}></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{animationDelay:'0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <FileText className="h-16 w-16 text-primary-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Generate Digital Certificate</h1>
          <p className="text-lg text-gray-300">Create secure, blockchain-verified digital certificates</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-300 mb-2">Student/Recipient Name *</label>
                <input type="text" id="studentName" name="studentName" value={formData.studentName} onChange={handleInputChange} required className="input-field" placeholder="Enter full name" />
              </div>
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-300 mb-2">Course/Program Name *</label>
                <input type="text" id="courseName" name="courseName" value={formData.courseName} onChange={handleInputChange} required className="input-field" placeholder="Enter course name" />
              </div>
              <div>
                <label htmlFor="completionDate" className="block text-sm font-medium text-gray-300 mb-2">Completion Date *</label>
                <input type="date" id="completionDate" name="completionDate" value={formData.completionDate} onChange={handleInputChange} required className="input-field" />
              </div>
              <div>
                <label htmlFor="issuerName" className="block text-sm font-medium text-gray-300 mb-2">Issuer Name *</label>
                <input type="text" id="issuerName" name="issuerName" value={formData.issuerName} onChange={handleInputChange} required className="input-field" placeholder="Enter issuer name" />
              </div>
              <div>
                <label htmlFor="issuerOrganization" className="block text-sm font-medium text-gray-300 mb-2">Organization *</label>
                <input type="text" id="issuerOrganization" name="issuerOrganization" value={formData.issuerOrganization} onChange={handleInputChange} required className="input-field" placeholder="Enter organization name" />
              </div>
              <div>
                <label htmlFor="certificateType" className="block text-sm font-medium text-gray-300 mb-2">Certificate Type</label>
                <select id="certificateType" name="certificateType" value={formData.certificateType} onChange={handleInputChange} className="input-field">
                  <option value="course">Course Completion</option>
                  <option value="training">Training Program</option>
                  <option value="achievement">Achievement</option>
                  <option value="participation">Participation</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="input-field" placeholder="Enter certificate description or additional details" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-300 mb-2">Grade/Score</label>
                <input type="text" id="grade" name="grade" value={formData.grade} onChange={handleInputChange} className="input-field" placeholder="e.g., A+, 95%, Pass" />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleInputChange} className="input-field" placeholder="e.g., 6 months, 120 hours" />
              </div>
            </div>

            {error && (
              <div className="bg-error-900/40 border border-error-700/40 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-error-400" />
                  <span className="text-error-200">{error}</span>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center space-x-2 min-w-[200px]">
                {isSubmitting ? (<><Loader2 className="h-5 w-5 animate-spin" /><span>Minting...</span></>) : (<><FileText className="h-5 w-5" /><span>Generate & Mint</span></>)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenerateCertificate;









