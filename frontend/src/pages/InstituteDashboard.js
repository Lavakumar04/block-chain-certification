import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Users, 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Download,
  QrCode,
  Eye,
  Search,
  Copy
} from 'lucide-react';
import QRCode from 'qrcode.react';

const InstituteDashboard = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    studentEmail: '',
    courseName: '',
    courseCode: '',
    completionDate: '',
    issueDate: '',
    grade: '',
    percentage: '',
    duration: '',
    certificateType: 'course',
    description: '',
    issuerName: '',
    issuerTitle: '',
    instituteName: '',
    instituteAddress: '',
    instituteWebsite: '',
    certificateNumber: '',
    validityPeriod: '',
    additionalNotes: ''
  });
  
  const audioCtxRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showMinting, setShowMinting] = useState(false);
  
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

  // Mock data for demonstration
  const [certificates, setCertificates] = useState([
    {
      id: 'CERT-001',
      studentName: 'John Doe',
      courseName: 'Web Development',
      completionDate: '2024-06-15',
      grade: 'A+',
      status: 'verified',
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 1234567
    },
    {
      id: 'CERT-002',
      studentName: 'Jane Smith',
      courseName: 'Data Science',
      completionDate: '2024-05-20',
      grade: 'A',
      status: 'pending',
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: 1234568
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setIsSuccess(false);
    setShowMinting(true);
    
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
        
        // Generate mock certificate data if API doesn't return full data
        const newCertificate = result.certificate || {
          id: `CERT-${Date.now()}`,
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 1000000),
          status: 'pending',
          ...formData
        };
        
        playSuccessChime();

      setCertificateData(newCertificate);
      setCertificates(prev => [newCertificate, ...prev]);
      setIsSuccess(true);
      
      // Reset form
      setFormData({
        studentName: '',
        studentId: '',
        studentEmail: '',
        courseName: '',
        courseCode: '',
        completionDate: '',
        issueDate: '',
        grade: '',
        percentage: '',
        duration: '',
        certificateType: 'course',
        description: '',
        issuerName: '',
        issuerTitle: '',
        instituteName: '',
        instituteAddress: '',
        instituteWebsite: '',
        certificateNumber: '',
        validityPeriod: '',
        additionalNotes: ''
      });
      } else {
        clearInterval(progressInterval);
        throw new Error(result.message || 'Certificate generation failed');
      }
    } catch (err) {
      console.error('Error generating certificate:', err);
      clearInterval(progressInterval);
      setError(err.message || 'Failed to generate certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowMinting(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificateData) return;
    
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `certificate-${certificateData.studentName}-${certificateData.courseName}.pdf`;
    link.click();
  };

  const downloadQRCode = () => {
    if (!certificateData) return;
    
    // Simulate QR code download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `qr-${certificateData.studentName}-${certificateData.courseName}.png`;
    link.click();
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || cert.status === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-900/50 text-green-400 border-green-700';
      case 'pending': return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
      case 'rejected': return 'bg-red-900/50 text-red-400 border-red-700';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Building2 className="h-8 w-8 text-primary-400" />
            <h1 className="text-3xl font-bold text-primary-400">Institute Dashboard</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Manage student certificates, track verification status, and maintain academic records
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Generation Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-primary-400 mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-400" />
                Generate New Certificate
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter student's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter student ID"
                  />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Email
                    </label>
                    <input
                      type="email"
                      name="studentEmail"
                      value={formData.studentEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="student@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Number
                    </label>
                    <input
                      type="text"
                      name="certificateNumber"
                      value={formData.certificateNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>

                {/* Course Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter course name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Course Code
                    </label>
                    <input
                      type="text"
                      name="courseCode"
                      value={formData.courseCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter course code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Completion Date *
                    </label>
                    <input
                      type="date"
                      name="completionDate"
                      value={formData.completionDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 6 months"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Grade *
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Grade</option>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="B-">B-</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                      <option value="C-">C-</option>
                      <option value="D+">D+</option>
                      <option value="D">D</option>
                      <option value="D-">D-</option>
                      <option value="F">F</option>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Percentage
                    </label>
                    <input
                      type="number"
                      name="percentage"
                      value={formData.percentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 85"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Certificate Type
                    </label>
                    <select
                      name="certificateType"
                      value={formData.certificateType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="course">Course Completion</option>
                      <option value="degree">Degree</option>
                      <option value="diploma">Diploma</option>
                      <option value="certification">Professional Certification</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </div>
                </div>

                {/* Institute Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Institute Name *
                    </label>
                    <input
                      type="text"
                      name="instituteName"
                      value={formData.instituteName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter institute name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Institute Website
                    </label>
                    <input
                      type="url"
                      name="instituteWebsite"
                      value={formData.instituteWebsite}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://institute.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Institute Address
                  </label>
                  <textarea
                    name="instituteAddress"
                    value={formData.instituteAddress}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter institute address"
                  />
                </div>

                {/* Issuer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Issuer Name *
                    </label>
                    <input
                      type="text"
                      name="issuerName"
                      value={formData.issuerName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter issuer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Issuer Title
                    </label>
                    <input
                      type="text"
                      name="issuerTitle"
                      value={formData.issuerTitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Director, Principal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter course description or additional details"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Validity Period
                    </label>
                    <input
                      type="text"
                      name="validityPeriod"
                      value={formData.validityPeriod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Lifetime, 5 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Additional Notes
                    </label>
                    <input
                      type="text"
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any additional information"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        studentName: '',
                        studentId: '',
                        studentEmail: '',
                        courseName: '',
                        courseCode: '',
                        completionDate: '',
                        issueDate: '',
                        grade: '',
                        percentage: '',
                        duration: '',
                        certificateType: 'course',
                        description: '',
                        issuerName: '',
                        issuerTitle: '',
                        instituteName: '',
                        instituteAddress: '',
                        instituteWebsite: '',
                        certificateNumber: '',
                        validityPeriod: '',
                        additionalNotes: ''
                      });
                    }}
                    className="px-6 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-primary-600 border border-transparent text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Certificate
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Success Message */}
              {isSuccess && certificateData && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-md">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <h3 className="text-lg font-medium text-green-400">
                      Certificate Generated Successfully!
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                      <h4 className="font-medium text-primary-400 mb-2">Certificate Details</h4>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><span className="font-medium text-gray-200">ID:</span> {certificateData.id}</p>
                        <p><span className="font-medium text-gray-200">Student:</span> {certificateData.studentName}</p>
                        <p><span className="font-medium text-gray-200">Course:</span> {certificateData.courseName}</p>
                        <p><span className="font-medium text-gray-200">Grade:</span> {certificateData.grade}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                      <h4 className="font-medium text-primary-400 mb-2">Blockchain Details</h4>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><span className="font-medium text-gray-200">Hash:</span> {certificateData.hash.substring(0, 20)}...</p>
                        <p><span className="font-medium text-gray-200">Transaction:</span> {certificateData.transactionHash.substring(0, 20)}...</p>
                        <p><span className="font-medium text-gray-200">Block:</span> {certificateData.blockNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={downloadCertificate}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </button>
                    <button
                      onClick={downloadQRCode}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Download QR Code
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-400">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Certificate Management */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-primary-400 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-400" />
                Quick Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                  <span className="text-blue-800 font-medium">Total Certificates</span>
                  <span className="text-blue-600 font-bold text-xl">{certificates.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                  <span className="text-green-800 font-medium">Verified</span>
                  <span className="text-green-600 font-bold text-xl">
                    {certificates.filter(c => c.status === 'verified').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-md">
                  <span className="text-yellow-800 font-medium">Pending</span>
                  <span className="text-yellow-600 font-bold text-xl">
                    {certificates.filter(c => c.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-primary-400 mb-4 flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-primary-400" />
                QR Code Preview
              </h3>
              
              {certificateData ? (
                <div className="text-center">
                  <div className="bg-gray-700 p-4 rounded-lg border-2 border-gray-600 inline-block mb-4">
                    <QRCode 
                      value={JSON.stringify({
                        id: certificateData.id,
                        hash: certificateData.hash,
                        studentName: certificateData.studentName,
                        courseName: certificateData.courseName,
                        verificationUrl: `https://blockcert.com/verify/${certificateData.id}`
                      })}
                      size={120}
                      level="H"
                      includeMargin={true}
                      bgColor="#374151"
                      fgColor="#ffffff"
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Scan to verify certificate authenticity
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Generate a certificate to see QR code</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certificate List */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mt-8 border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-primary-400 mb-4 sm:mb-0">
              Certificate Management
            </h2>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Certificate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-300">{cert.id}</div>
                      <div className="text-sm text-gray-400">{cert.completionDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-300">{cert.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{cert.courseName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-primary-400 border border-primary-500">
                        {cert.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(cert.status)}`}>
                        {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-400 hover:text-primary-300">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-400 hover:text-green-300">
                          <QrCode className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCertificates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No certificates found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;