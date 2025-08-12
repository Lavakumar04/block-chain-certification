const axios = require('axios');
const baseURL = 'http://localhost:5000/api';

// Test data
const testInstitute = {
  name: 'Tech University',
  organization: 'Technology Education Institute',
  email: 'admin@techuniversity.edu',
  password: 'securepass123',
  website: 'https://techuniversity.edu',
  address: '123 Tech Street, Innovation City, IC 12345',
  phone: '+1-555-0123',
  description: 'Leading technology education institution'
};

const testCertificate = {
  studentName: 'Alice Johnson',
  courseName: 'Advanced Blockchain Development',
  completionDate: '2024-01-25',
  description: 'Comprehensive course covering smart contracts, DApps, and DeFi protocols',
  grade: 'A+',
  duration: '6 months',
  certificateType: 'course',
  template: 'modern'
};

async function testEnhancedFeatures() {
  console.log('🚀 Testing Enhanced Blockchain Certification System\n');
  
  try {
    // 1. Test Health Endpoints
    console.log('1️⃣ Testing Health Endpoints...');
    
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Main API Health:', healthResponse.data);
    
    const certHealthResponse = await axios.get(`${baseURL}/certificates/health`);
    console.log('✅ Certificate Service Health:', certHealthResponse.data);
    
    const verifyHealthResponse = await axios.get(`${baseURL}/verification/health`);
    console.log('✅ Verification Service Health:', verifyHealthResponse.data);
    
    // 2. Test Institute Registration
    console.log('\n2️⃣ Testing Institute Registration...');
    
    const registerResponse = await axios.post(`${baseURL}/institutes/register`, testInstitute);
    console.log('✅ Institute Registered:', registerResponse.data);
    
    // 3. Test Institute Login
    console.log('\n3️⃣ Testing Institute Login...');
    
    const loginResponse = await axios.post(`${baseURL}/institutes/login`, {
      email: testInstitute.email,
      password: testInstitute.password
    });
    console.log('✅ Institute Logged In');
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // 4. Test Certificate Generation
    console.log('\n4️⃣ Testing Dynamic Certificate Generation...');
    
    const certResponse = await axios.post(`${baseURL}/certificates`, testCertificate, { headers });
    console.log('✅ Certificate Generated:', certResponse.data);
    
    const certificateId = certResponse.data.certificate.certificateId;
    const transactionHash = certResponse.data.certificate.blockchainTxHash;
    
    console.log(`📜 Certificate ID: ${certificateId}`);
    console.log(`⛓️  Transaction Hash: ${transactionHash}`);
    console.log(`🔗 PDF Download: ${certResponse.data.files.pdf}`);
    console.log(`🖼️  Image Download: ${certResponse.data.files.image}`);
    console.log(`📱 QR Code Download: ${certResponse.data.files.qr}`);
    
    // 5. Test Certificate Verification
    console.log('\n5️⃣ Testing Certificate Verification...');
    
    const verifyResponse = await axios.post(`${baseURL}/verification/verify`, {
      certificateId: certificateId
    });
    console.log('✅ Certificate Verified:', verifyResponse.data);
    
    // 6. Test Deep Verification
    console.log('\n6️⃣ Testing Deep Verification...');
    
    const deepVerifyResponse = await axios.post(`${baseURL}/verification/deep-verify`, {
      certificateId: certificateId
    });
    console.log('✅ Deep Verification Complete:', deepVerifyResponse.data);
    
    // 7. Test Blockchain Status
    console.log('\n7️⃣ Testing Blockchain Status...');
    
    const blockchainResponse = await axios.get(`${baseURL}/verification/${certificateId}/blockchain-status`);
    console.log('✅ Blockchain Status:', blockchainResponse.data);
    
    // 8. Test Certificate Details
    console.log('\n8️⃣ Testing Certificate Details...');
    
    const certDetailsResponse = await axios.get(`${baseURL}/verification/${certificateId}`);
    console.log('✅ Certificate Details Retrieved');
    
    const cert = certDetailsResponse.data.certificate;
    console.log(`📋 Student: ${cert.studentName}`);
    console.log(`🎓 Course: ${cert.courseName}`);
    console.log(`📅 Completion: ${cert.completionDate}`);
    console.log(`🏢 Institute: ${cert.instituteName}`);
    console.log(`🔐 Hash: ${cert.certificateHash.substring(0, 20)}...`);
    
    // 9. Test Institute Dashboard
    console.log('\n9️⃣ Testing Institute Dashboard...');
    
    const dashboardResponse = await axios.get(`${baseURL}/certificates`, { headers });
    console.log('✅ Institute Certificates Retrieved:', dashboardResponse.data.count, 'certificates');
    
    const statsResponse = await axios.get(`${baseURL}/certificates/stats/summary`, { headers });
    console.log('✅ Institute Statistics:', statsResponse.data.stats);
    
    // 10. Test Search Functionality
    console.log('\n🔟 Testing Search Functionality...');
    
    const searchResponse = await axios.get(`${baseURL}/certificates/search/${cert.studentName}`, { headers });
    console.log('✅ Search Results:', searchResponse.data.count, 'certificates found');
    
    console.log('\n🎉 All Enhanced Features Tested Successfully!');
    console.log('\n✨ Features Demonstrated:');
    console.log('   • Dynamic Certificate Generation with Institute Details');
    console.log('   • Blockchain-based Secure Storage');
    console.log('   • Advanced Verification System');
    console.log('   • Multi-format Download Options');
    console.log('   • Institute Dashboard Access');
    console.log('   • Customizable Certificate Templates');
    console.log('   • Real-time Blockchain Integration');
    console.log('   • Comprehensive Security Checks');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure the institute is verified before testing certificate generation');
    }
    
    if (error.response?.status === 500) {
      console.log('\n💡 Tip: Check if MongoDB and blockchain services are running');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEnhancedFeatures();
}

module.exports = { testEnhancedFeatures };
