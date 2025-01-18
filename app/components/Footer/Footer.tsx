'use client';

import { FaTwitter, FaDiscord, FaTelegram, FaInstagram } from 'react-icons/fa';
import Logo from '../Logo/Logo';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-t from-black to-gray-900 border-t border-[#7ffdfd]/10">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <div className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
            <Logo />
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="/about" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
              About Us
            </a>
            <span className="text-[#7ffdfd]/30 hidden sm:inline">•</span>
            <a href="/privacy" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
              Privacy Policy
            </a>
            <span className="text-[#7ffdfd]/30 hidden sm:inline">•</span>
            <a href="/terms" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
              Terms & Conditions
            </a>
            <span className="text-[#7ffdfd]/30 hidden sm:inline">•</span>
            <a href="/support" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
              Support
            </a>
            <span className="text-[#7ffdfd]/30 hidden sm:inline">•</span>
            <a href="/contact" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
              Contact
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
              <FaTwitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
              <FaDiscord className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
              <FaTelegram className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
              <FaInstagram className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm text-[#7ffdfd]/40">
              &copy; {new Date().getFullYear()} Your Brand. All rights reserved.
            </p>
            <p className="mt-2 text-xs text-[#7ffdfd]/30">
              This website is operated by Your Company Name Ltd.
              <br className="hidden sm:inline" />
              Licensed and regulated under license number: XXXX-XXXX-XXXX
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
