import React from 'react';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Dashboard', href: '/' },
    { label: 'Income', href: '/income' },
    { label: 'Expense', href: '/expense' },
  ];

  const helpLinks = [
    { label: 'FAQ', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-t border-white/10">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl translate-y-1/2"></div>
      </div>

      {/* Main footer content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Top section - Company info and links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2 sm:mb-3">
              ExpenseTracker
            </h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
              Manage your finances with ease. Track expenses, monitor income, and take control of your budget.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 hover:bg-teal-600 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-white mb-4 sm:mb-6 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-teal-400 text-sm sm:text-base transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Resources */}
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-white mb-4 sm:mb-6 uppercase tracking-wider">
              Help & Support
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 text-sm sm:text-base transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-white mb-4 sm:mb-6 uppercase tracking-wider">
              Get in Touch
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <a
                href="mailto:support@expensetracker.com"
                className="flex items-start gap-3 group text-sm sm:text-base"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-teal-400 transition-colors break-words">
                  support@expensetracker.com
                </span>
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-start gap-3 group text-sm sm:text-base"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-cyan-400 transition-colors">
                  +1 (234) 567-890
                </span>
              </a>
              <div className="flex items-start gap-3 text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  San Francisco, CA 94103
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8 sm:mb-12"></div>

        {/* Bottom section - Copyright and additional info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="text-center sm:text-left text-xs sm:text-sm text-gray-500">
            <p className="mb-2 sm:mb-0">
              © {currentYear} ExpenseTracker. All rights reserved.
            </p>
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>by ExpenseTracker Team</span>
          </div>

          {/* Version */}
          <div className="text-xs sm:text-sm text-gray-500">
            v1.0.0
          </div>
        </div>
      </div>

      {/* Animated border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0"></div>
    </footer>
  );
};

export default Footer;
