import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Users, TrendingUp, TrendingDown, Calendar, Shield, Activity, Download, QrCode, Eye } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock dashboard data
        const mockStats = {
          totalCertificates: 1247,
          activeCertificates: 1189,
          revokedCertificates: 58,
          totalStudents: 892,
          totalIssuers: 45,
          monthlyGrowth: 12.5,
          verificationRate: 98.7,
          blockchainTransactions: 1247,
          averageProcessingTime: '2.3 minutes'
        };

        const mockRecentCertificates = [
          {
            id: 'CERT-1247',
            studentName: 'Emma Thompson',
            courseName: 'Machine Learning',
            status: 'active',
            issuedAt: '2024-01-25T14:30:00Z',
            issuer: 'AI Institute'
          },
          {
            id: 'CERT-1246',
            studentName: 'Michael Chen',
            courseName: 'Cybersecurity',
            status: 'active',
            issuedAt: '2024-01-25T13:15:00Z',
            issuer: 'Security Academy'
          },
          {
            id: 'CERT-1245',
            studentName: 'Sarah Williams',
            courseName: 'Data Analytics',
            status: 'active',
            issuedAt: '2024-01-25T11:45:00Z',
            issuer: 'Data University'
          },
          {
            id: 'CERT-1244',
            studentName: 'David Rodriguez',
            courseName: 'Cloud Computing',
            status: 'active',
            issuedAt: '2024-01-25T10:20:00Z',
            issuer: 'Cloud Institute'
          },
          {
            id: 'CERT-1243',
            studentName: 'Lisa Anderson',
            courseName: 'Blockchain Development',
            status: 'active',
            issuedAt: '2024-01-25T09:10:00Z',
            issuer: 'Blockchain Academy'
          }
        ];

        setStats(mockStats);
        setRecentCertificates(mockRecentCertificates);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <BarChart3 className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Overview of your blockchain certification system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Certificates */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
              <span className="text-success-600">+{stats.monthlyGrowth}%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </div>

          {/* Active Certificates */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-success-100">
                <Shield className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCertificates.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">
                {((stats.activeCertificates / stats.totalCertificates) * 100).toFixed(1)}% of total
              </span>
            </div>
          </div>

          {/* Total Students */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">
                {stats.totalIssuers} issuing organizations
              </span>
            </div>
          </div>

          {/* Verification Rate */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verification Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verificationRate}%</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">
                {stats.blockchainTransactions} blockchain transactions
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Certificates</h2>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentCertificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-primary-100">
                        <FileText className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cert.studentName}</p>
                        <p className="text-sm text-gray-600">{cert.courseName}</p>
                        <p className="text-xs text-gray-500">{cert.issuer}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500">
                        {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        {cert.status}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <QrCode className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Blockchain Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API Response</span>
                  <span className="text-gray-900">{stats.averageProcessingTime}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary flex items-center justify-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Generate Certificate</span>
                </button>
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Verify Certificate</span>
                </button>
                <button className="w-full btn-outline flex items-center justify-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Today</span>
                  <span className="font-medium text-gray-900">24 certificates</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-medium text-gray-900">156 certificates</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-medium text-gray-900">1,247 certificates</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Verifications</span>
                  <span className="font-medium text-gray-900">2,891</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Types Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Course Completion</span>
                <span className="font-medium text-gray-900">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Training Programs</span>
                <span className="font-medium text-gray-900">22%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-success-600 h-2 rounded-full" style={{ width: '22%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Achievements</span>
                <span className="font-medium text-gray-900">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-warning-600 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">January 2024</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">1,247</span>
                  <TrendingUp className="h-4 w-4 text-success-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">December 2023</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">1,108</span>
                  <TrendingUp className="h-4 w-4 text-success-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">November 2023</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">987</span>
                  <TrendingUp className="h-4 w-4 text-success-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


