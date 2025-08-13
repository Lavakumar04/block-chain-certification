import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, QrCode, Copy, ExternalLink, Calendar, User, Building, Shield, Hash, FileText } from 'lucide-react';

const CertificateDetail = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockCertificate = {
          id: certificateId,
          studentName: 'John Doe',
          courseName: 'Blockchain Development',
          completionDate: '2024-01-15',
          issuerName: 'Dr. Jane Smith',
          issuerOrganization: 'Tech University',
          description: 'Comprehensive course covering blockchain fundamentals, smart contracts, and decentralized applications.',
          grade: 'A+',
          duration: '6 months',
          type: 'course',
          status: 'active',
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          blockNumber: 1234567,
          issuedAt: '2024-01-15T10:30:00Z',
          metadata: {
            totalHours: 120,
            modules: ['Blockchain Basics', 'Smart Contracts', 'DApps', 'Security'],
            prerequisites: ['Basic Programming', 'Cryptography Fundamentals']
          }
        };
        
        setCertificate(mockCertificate);
      } catch (err) {
        setError('Failed to load certificate details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const openBlockchainExplorer = (hash) => {
    window.open(`https://etherscan.io/tx/${hash}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading certificate details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The requested certificate could not be found.'}</p>
            <Link to="/certificates" className="btn-primary">
              Back to Certificates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/certificates" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Certificates
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{certificate.courseName}</h1>
              <p className="text-lg text-gray-600">Certificate ID: {certificate.id}</p>
            </div>
            
            <div className="flex space-x-3">
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
              <button className="btn-outline flex items-center space-x-2">
                <QrCode className="h-4 w-4" />
                <span>QR Code</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Certificate Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                Certificate Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student Name</label>
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900 font-medium">{certificate.studentName}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Course Name</label>
                    <p className="text-gray-900 font-medium mt-1">{certificate.courseName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Completion Date</label>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{certificate.completionDate}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Grade</label>
                    <p className="text-gray-900 font-medium mt-1">{certificate.grade}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Issuer</label>
                    <div className="flex items-center mt-1">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900 font-medium">{certificate.issuerName}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Organization</label>
                    <p className="text-gray-900 mt-1">{certificate.issuerOrganization}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-gray-900 mt-1">{certificate.duration}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {certificate.type}
                    </span>
                  </div>
                </div>
              </div>
              
              {certificate.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-700 mt-1">{certificate.description}</p>
                </div>
              )}
            </div>

            {/* Blockchain Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary-600" />
                Blockchain Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Certificate Hash</label>
                  <div className="flex items-center mt-1">
                    <Hash className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm font-mono text-gray-900 break-all flex-1">{certificate.hash}</p>
                    <button
                      onClick={() => copyToClipboard(certificate.hash)}
                      className="text-primary-600 hover:text-primary-700 ml-2"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction Hash</label>
                  <div className="flex items-center mt-1">
                    <Hash className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm font-mono text-gray-900 break-all flex-1">{certificate.transactionHash}</p>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => copyToClipboard(certificate.transactionHash)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openBlockchainExplorer(certificate.transactionHash)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Block Number</label>
                    <p className="text-gray-900 mt-1">{certificate.blockNumber.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 mt-1">
                      {certificate.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {certificate.metadata && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Hours</label>
                    <p className="text-gray-900 mt-1">{certificate.metadata.totalHours} hours</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Modules</label>
                    <div className="mt-1 space-y-1">
                      {certificate.metadata.modules.map((module, index) => (
                        <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm mr-2 mb-1">
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {certificate.metadata.prerequisites && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-500">Prerequisites</label>
                    <div className="mt-1 space-y-1">
                      {certificate.metadata.prerequisites.map((prereq, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm mr-2 mb-1">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificate Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    {certificate.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Issued Date</span>
                  <span className="text-gray-900">{new Date(certificate.issuedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="text-gray-900 capitalize">{certificate.type}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Certificate</span>
                </button>
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <QrCode className="h-4 w-4" />
                  <span>Generate QR Code</span>
                </button>
                <button className="w-full btn-outline flex items-center justify-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>View on Blockchain</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetail;















