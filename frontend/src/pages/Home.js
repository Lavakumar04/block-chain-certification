import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, CheckCircle, BarChart3, ArrowRight, Users, FileText, Globe } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary-300" />,
      title: 'Blockchain Security',
      description: 'Immutable certificate storage on Ethereum blockchain ensures authenticity and prevents tampering.'
    },
    {
      icon: <Award className="w-8 h-8 text-primary-300" />,
      title: 'Instant Verification',
      description: 'Verify any certificate instantly by scanning QR codes or entering certificate IDs.'
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary-300" />,
      title: 'Digital Signatures',
      description: 'Cryptographically signed certificates with issuer verification for maximum trust.'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary-300" />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into certificate issuance, verification, and system statistics.'
    }
  ];

  const stats = [
    { label: 'Certificates Issued', value: '10,000+', icon: <FileText className="w-5 h-5" /> },
    { label: 'Active Users', value: '5,000+', icon: <Users className="w-5 h-5" /> },
    { label: 'Verifications', value: '25,000+', icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Global Reach', value: '50+ Countries', icon: <Globe className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-black py-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Blockchain-Powered
              <span className="text-gradient neon-text block">Digital Certificates</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Generate, issue, and verify tamper-proof digital certificates using Ethereum blockchain technology. 
              Ensure authenticity and build trust in the digital age.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/generate" 
                className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2"
              >
                Generate Certificate
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/verify" 
                className="btn-secondary text-lg px-8 py-3 inline-flex items-center gap-2"
              >
                Verify Certificate
                <CheckCircle className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        {/* Animated grid */}
        <div className="absolute inset-0 minting-grid opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built with cutting-edge blockchain technology to provide the most secure and reliable 
              digital certification system available.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Simple three-step process from certificate generation to verification
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 ring-pulse">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Generate</h3>
              <p className="text-gray-300">
                Create certificates with student details, course information, and completion dates. 
                Our system generates a unique cryptographic hash.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 ring-pulse" style={{animationDelay:'0.2s'}}>
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Store</h3>
              <p className="text-gray-300">
                Certificate hash is stored on the Ethereum blockchain for immutability, 
                while full data is saved in our secure database.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 ring-pulse" style={{animationDelay:'0.4s'}}>
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Verify</h3>
              <p className="text-gray-300">
                Anyone can verify certificates by scanning QR codes or entering IDs. 
                Instant blockchain verification ensures authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Our platform has become the go-to solution for digital certification needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3 text-primary-200">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of organizations already using our blockchain certification platform. 
              Start issuing tamper-proof digital certificates today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/generate" 
                className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2"
              >
                Start Generating Certificates
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/dashboard" 
                className="btn-secondary text-lg px-8 py-3"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;










