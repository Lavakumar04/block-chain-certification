import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, QrCode, FileText, Calendar, User, Building } from 'lucide-react';

const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch certificates
    const fetchCertificates = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockCertificates = [
        {
          id: 'CERT-001',
          studentName: 'John Doe',
          courseName: 'Blockchain Development',
          completionDate: '2024-01-15',
          issuerName: 'Dr. Jane Smith',
          issuerOrganization: 'Tech University',
          status: 'active',
          type: 'course',
          hash: '0x1234567890abcdef...',
          issuedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'CERT-002',
          studentName: 'Alice Johnson',
          courseName: 'Web Development',
          completionDate: '2024-01-10',
          issuerName: 'Prof. Mike Brown',
          issuerOrganization: 'Code Academy',
          status: 'active',
          type: 'course',
          hash: '0xabcdef1234567890...',
          issuedAt: '2024-01-10T14:20:00Z'
        },
        {
          id: 'CERT-003',
          studentName: 'Bob Wilson',
          courseName: 'Data Science',
          completionDate: '2024-01-05',
          issuerName: 'Dr. Sarah Davis',
          issuerOrganization: 'Data Institute',
          status: 'revoked',
          type: 'training',
          hash: '0x9876543210fedcba...',
          issuedAt: '2024-01-05T09:15:00Z'
        },
        {
          id: 'CERT-004',
          studentName: 'Carol Martinez',
          courseName: 'AI Fundamentals',
          completionDate: '2024-01-20',
          issuerName: 'Prof. James Wilson',
          issuerOrganization: 'AI University',
          status: 'active',
          type: 'course',
          hash: '0xfedcba0987654321...',
          issuedAt: '2024-01-20T16:45:00Z'
        }
      ];
      
      setCertificates(mockCertificates);
      setFilteredCertificates(mockCertificates);
      setIsLoading(false);
    };

    fetchCertificates();
  }, []);

  useEffect(() => {
    // Filter certificates based on search and filters
    let filtered = certificates;

    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(cert => cert.type === typeFilter);
    }

    setFilteredCertificates(filtered);
  }, [searchTerm, statusFilter, typeFilter, certificates]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-success-100', text: 'text-success-800', label: 'Active' },
      revoked: { bg: 'bg-error-100', text: 'text-error-800', label: 'Revoked' },
      expired: { bg: 'bg-warning-100', text: 'text-warning-800', label: 'Expired' }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      course: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Course' },
      training: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Training' },
      achievement: { bg: 'bg-green-100', text: 'text-green-800', label: 'Achievement' }
    };

    const config = typeConfig[type] || typeConfig.course;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading certificates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <FileText className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Registry</h1>
          <p className="text-lg text-gray-600">View and manage all issued digital certificates</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, course, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="course">Course</option>
                <option value="training">Training</option>
                <option value="achievement">Achievement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificates List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Certificates ({filteredCertificates.length})
            </h2>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No certificates found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCertificates.map((certificate) => (
                    <tr key={certificate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{certificate.id}</div>
                          <div className="text-sm text-gray-500">{getTypeBadge(certificate.type)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{certificate.studentName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{certificate.courseName}</div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Building className="h-3 w-3 mr-1" />
                          {certificate.issuerOrganization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{certificate.completionDate}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(certificate.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-primary-600 hover:text-primary-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-success-600 hover:text-success-900">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            <QrCode className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateList;





