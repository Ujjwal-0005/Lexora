import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    services: [
      { label: 'Find Professionals', path: '/lawyers' },
      { label: 'Book Consultation', path: '/lawyers' },
      { label: 'Document Archive', path: '/client/documents' },
      { label: 'Legal Advice', path: '/lawyers' },
    ],
    company: [
      { label: 'About Us', path: '/company#about' },
      { label: 'Careers', path: '/company#careers' },
      { label: 'Press & Media', path: '/company#press' },
      { label: 'Contact Support', path: '/help' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/privacy' },
      { label: 'Regulatory Disclosure', path: '/privacy' },
      { label: 'Trust & Security', path: '/privacy' },
    ],
  }

  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
    { icon: Instagram, href: '#' },
  ]

  return (
    <footer className="bg-[linear-gradient(180deg,#132a4d_0%,#102447_55%,#0d1f3d_100%)] border-t border-[#5d7ea8]/35 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.08] mix-blend-overlay"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#6ea8ff]/12 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="w-10 h-10 bg-[#a1804a]/10 border border-[#a1804a]/20 flex items-center justify-center rounded-sm group-hover:bg-[#a1804a]/20 transition-colors">
                <Scale className="w-5 h-5 text-[#a1804a]" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-wide">
                Lexora
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
              Connecting clients with trusted legal experts for consultations, document management, and reliable legal support.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-[#a1804a]" />
                <a href="mailto:lexora.no.reply@gmail.com" className="hover:text-white transition-colors cursor-pointer">lexora.no.reply@gmail.com</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-[#a1804a]" />
                <span className="hover:text-white transition-colors cursor-pointer">+91 1800-123-721</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#a1804a]" />
                <span>Financial District, New Delhi</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-6">Services</h4>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-[#a1804a] transition-colors flex items-center group w-fit"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 group-hover:mr-2 transition-all duration-300 text-[#a1804a]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-[#a1804a] transition-colors flex items-center group w-fit"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 group-hover:mr-2 transition-all duration-300 text-[#a1804a]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-[#a1804a] transition-colors flex items-center group w-fit"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 group-hover:mr-2 transition-all duration-300 text-[#a1804a]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-[#3c557a] flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[0.7rem] text-gray-500 font-medium tracking-wide">
            &copy; {currentYear} Lexora. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social, index) => {
              const Icon = social.icon
              return (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#a1804a]/10 hover:text-[#a1804a] hover:border-[#a1804a]/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
