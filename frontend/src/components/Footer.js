import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">BlockCert</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Secure, transparent, and tamper-proof digital certification system built on blockchain technology. 
              Trust the future of credential verification.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/generate" className="text-gray-300 hover:text-primary-400 transition-colors">Generate Certificate</Link></li>
              <li><Link to="/verify" className="text-gray-300 hover:text-primary-400 transition-colors">Verify Certificate</Link></li>
              <li><Link to="/certificates" className="text-gray-300 hover:text-primary-400 transition-colors">View Certificates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-top border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {currentYear} BlockCert. All rights reserved.</p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">Built with ❤️ using React, Node.js, and Ethereum</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;









