import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GenerateCertificate from './pages/GenerateCertificate';
import VerifyCertificate from './pages/VerifyCertificate';
import CertificateList from './pages/CertificateList';
import CertificateDetail from './pages/CertificateDetail';
import Dashboard from './pages/Dashboard';
import InstituteDashboard from './pages/InstituteDashboard';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<GenerateCertificate />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
          <Route path="/certificates" element={<CertificateList />} />
          <Route path="/certificates/:certificateId" element={<CertificateDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/institute" element={<InstituteDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

