import React, { useState } from 'react';
import { FileText, Upload, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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

    try {
      // Simulate API call - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock certificate data
      const mockCertificate = {
        id: `CERT-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1000000),
        ...formData
      };

      setCertificateData(mockCertificate);
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to generate certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCertificate = () => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `certificate-${formData.studentName}.pdf`;
    link.click();
  };

  const downloadQRCode = () => {
    // Simulate QR code download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `qr-${formData.studentName}.png`;
    link.click();
  };

  if (isSuccess && certificateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Generated Successfully!</h1>
            <p className="text-lg text-gray-600">Your digital certificate has been created and stored on the blockchain.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Certificate Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Student Name:</span>
                    <p className="text-gray-900">{certificateData.studentName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Course:</span>
                    <p className="text-gray-900">{certificateData.courseName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Completion Date:</span>
                    <p className="text-gray-900">{certificateData.completionDate}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Issuer:</span>
                    <p className="text-gray-900">{certificateData.issuerName}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Certificate ID:</span>
                    <p className="text-sm font-mono text-gray-900 break-all">{certificateData.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Hash:</span>
                    <p className="text-sm font-mono text-gray-900 break-all">{certificateData.hash}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Transaction Hash:</span>
                    <p className="text-sm font-mono text-gray-900 break-all">{certificateData.transactionHash}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Block Number:</span>
                    <p className="text-gray-900">{certificateData.blockNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-8 pt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={downloadCertificate}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Certificate (PDF)</span>
                </button>
                <button
                  onClick={downloadQRCode}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <FileText className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Digital Certificate</h1>
          <p className="text-lg text-gray-600">Create secure, blockchain-verified digital certificates</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Student/Recipient Name *
                </label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                  Course/Program Name *
                </label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter course name"
                />
              </div>

              <div>
                <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Date *
                </label>
                <input
                  type="date"
                  id="completionDate"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="issuerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Issuer Name *
                </label>
                <input
                  type="text"
                  id="issuerName"
                  name="issuerName"
                  value={formData.issuerName}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter issuer name"
                />
              </div>

              <div>
                <label htmlFor="issuerOrganization" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization *
                </label>
                <input
                  type="text"
                  id="issuerOrganization"
                  name="issuerOrganization"
                  value={formData.issuerOrganization}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <label htmlFor="certificateType" className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Type
                </label>
                <select
                  id="certificateType"
                  name="certificateType"
                  value={formData.certificateType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="course">Course Completion</option>
                  <option value="training">Training Program</option>
                  <option value="achievement">Achievement</option>
                  <option value="participation">Participation</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Enter certificate description or additional details"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                  Grade/Score
                </label>
                <input
                  type="text"
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., A+, 95%, Pass"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., 6 months, 120 hours"
                />
              </div>
            </div>

            {error && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-error-500" />
                  <span className="text-error-700">{error}</span>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    <span>Generate Certificate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenerateCertificate;


