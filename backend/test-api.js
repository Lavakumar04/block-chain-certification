const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  try {
    console.log('🧪 Testing Blockchain Certification System API...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // Test root endpoint
    console.log('2. Testing root endpoint...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Root endpoint:', rootResponse.data);
    console.log('');

    // Test certificate creation
    console.log('3. Testing certificate creation...');
    const certificateData = {
      studentName: 'John Doe',
      courseName: 'Blockchain Development Fundamentals',
      completionDate: '2024-01-15',
      issuerName: 'Dr. Smith',
      issuerOrganization: 'Tech University'
    };

    const createResponse = await axios.post(`${BASE_URL}/api/certificates`, certificateData);
    console.log('✅ Certificate created:', createResponse.data);
    console.log('');

    // Test certificate retrieval
    console.log('4. Testing certificate retrieval...');
    const certificateId = createResponse.data.certificate.certificateId;
    const getResponse = await axios.get(`${BASE_URL}/api/certificates/${certificateId}`);
    console.log('✅ Certificate retrieved:', getResponse.data);
    console.log('');

    // Test certificate verification
    console.log('5. Testing certificate verification...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/verification/${certificateId}`);
    console.log('✅ Certificate verified:', verifyResponse.data);
    console.log('');

    // Test getting all certificates
    console.log('6. Testing get all certificates...');
    const allResponse = await axios.get(`${BASE_URL}/api/certificates`);
    console.log('✅ All certificates:', allResponse.data);
    console.log('');

    console.log('🎉 All API tests passed successfully!');
    console.log('📱 Frontend should now be able to connect to backend');
    console.log('🔗 Backend running on: http://localhost:5000');
    console.log('🔗 Frontend running on: http://localhost:3000');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPI();



