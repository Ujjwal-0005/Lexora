import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { Tilt } from 'react-tilt'
import CountUp from 'react-countup'
import {
  Scale,
  Shield,
  FileText,
  Users,
  Clock,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Quote,
  Star
} from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import MagneticButton from '../components/MagneticButton'

const Landing = () => {
  const testimonialsRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const features = [
    {
      icon: Users,
      title: 'Expert Lawyers',
      description: 'Connect with verified lawyers across 10+ specializations',
      path: '/lawyers',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Book consultations at your convenience, anytime',
      path: '/client/consultations',
    },
    {
      icon: FileText,
      title: 'Document Generator',
      description: 'Generate legal documents with professional templates',
      path: '/client/documents',
    },
    {
      icon: Shield,
      title: 'Secure & Confidential',
      description: 'Your data is protected with enterprise-grade security',
      path: '/privacy',
    },
  ]

  const steps = [
    { number: '01', title: 'Find a Lawyer', description: 'Search by specialization, location, or rating' },
    { number: '02', title: 'Book Consultation', description: 'Choose a convenient time slot' },
    { number: '03', title: 'Get Legal Help', description: 'Connect via video call and chat' },
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Business Owner',
      content: 'Lexora helped me find a fantastic corporate lawyer for my startup. The document generator saved me thousands!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Property Investor',
      content: 'Found an excellent property lawyer within minutes. The consultation process was smooth and professional.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Family Law Client',
      content: 'The platform made a difficult time much easier. My lawyer was compassionate and highly skilled.',
      rating: 5,
    },
    {
      name: 'Aarav Mehta',
      role: 'Founder, Fintech Startup',
      content: 'I booked a consultation the same day and got practical advice that saved our launch timeline. Fast, precise, and reliable.',
      rating: 5,
    },
    {
      name: 'Nadia Khan',
      role: 'Real Estate Developer',
      content: 'The property lawyer I found through Lexora handled a complex transaction with complete professionalism.',
      rating: 5,
    },
    {
      name: 'Daniel Reed',
      role: 'General Counsel',
      content: 'The quality of legal professionals here is exceptional. The booking and follow-up flow felt premium end to end.',
      rating: 5,
    },
    {
      name: 'Meera Iyer',
      role: 'Private Client',
      content: 'The consultation process was seamless, and the lawyer gave clear guidance that immediately reduced my stress.',
      rating: 5,
    },
    {
      name: 'Omar Siddiqui',
      role: 'SME Owner',
      content: 'I needed a contract review quickly and the platform matched me with the right specialist without any friction.',
      rating: 5,
    },
  ]

  useEffect(() => {
    const container = testimonialsRef.current
    if (!container) return

    const updateScrollButtons = () => {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 1)
    }

    updateScrollButtons()
    container.addEventListener('scroll', updateScrollButtons, { passive: true })
    window.addEventListener('resize', updateScrollButtons)

    return () => {
      container.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [])

  const scrollTestimonials = (direction) => {
    const container = testimonialsRef.current
    if (!container) return

    const card = container.querySelector('[data-testimonial-card]')
    const gap = 32
    const step = card ? card.getBoundingClientRect().width + gap : container.clientWidth * 0.9

    container.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    })
  }

  const stats = [
    { value: 500, suffix: '+', label: 'Verified Lawyers' },
    { value: 10000, suffix: '+', label: 'Consultations' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate' },
    { value: 15, suffix: '+', label: 'Legal Specializations' },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Premium Royal Extraordinary */}
      <section className="relative min-h-screen flex items-center pt-[112px] overflow-hidden">
        {/* Premium Background - Clean Luxury */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#151f35] to-[#0d1525]" />

        {/* Extraordinary Legal/Courtroom Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/image1.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            opacity: 0.75,
            filter: 'brightness(0.9) contrast(1.1)'
          }}
        />

        {/* Sophisticated overlay for contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/30 via-[#0f172a]/20 to-[#0f172a]/40" />

        {/* Premium top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a1804a]/50 to-transparent" />

        {/* Layered premium gradients for depth */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(161,128,74,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(161,128,74,0.12),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_70%)]" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 rounded-full blur-3xl"
              style={{
                background: i % 2 === 0
                  ? 'radial-gradient(circle, rgba(161,128,74,0.12) 0%, rgba(161,128,74,0.04) 40%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)'
                ,
                left: `${i * 20}%`,
                top: `${(i % 2) * 30}%`,
              }}
              animate={{
                x: [0, 120, -50, 0],
                y: [0, -80, 40, 0],
              }}
              transition={{
                duration: 14 + i * 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#a1804a]/15 to-[#a1804a]/8 border border-[#a1804a]/40 mb-6 shadow-[0_8px_24px_rgba(161,128,74,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]">
                <span className="w-2 h-2 rounded-full bg-[#a1804a] animate-pulse shadow-[0_0_8px_rgba(161,128,74,0.6)]" />
                <span className="text-[#f3d59b] text-sm font-semibold tracking-wide">
                  Trusted by 10,000+ clients
                </span>
              </motion.div>

              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-[#f0e8ff] to-white bg-clip-text text-transparent mb-8 leading-[1.15] drop-shadow-lg">
                Your Legal Solution{' '}
                <span className="gradient-text">
                  <TypeAnimation
                    sequence={[
                      'Simplified',
                      2000,
                      'Streamlined',
                      2000,
                      'Secured',
                      2000,
                    ]}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                  />
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                Connect with expert lawyers, book consultations, and generate legal documents
                — all in one secure platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start mb-10">
                <MagneticButton>
                  <Link to="/lawyers" className="relative inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] rounded-xl border border-[#f3d59b]/70 bg-gradient-to-r from-[#7b5a2b] via-[#b88b46] to-[#f3d59b] text-[#fffaf0] shadow-[0_22px_70px_rgba(161,128,74,0.5),inset_0_1px_0_rgba(255,255,255,0.38),inset_0_-10px_18px_rgba(87,54,12,0.28)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_34px_95px_rgba(161,128,74,0.6),0_0_34px_rgba(227,194,118,0.3),inset_0_1px_0_rgba(255,255,255,0.48)] dark:text-[#fff8e7] overflow-hidden group hover:text-white">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/35 to-white/0 opacity-0 transition-all duration-500 -translate-x-full group-hover:translate-x-full group-hover:opacity-100" />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
                    <div className="absolute inset-0 rounded-xl bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_35%,rgba(255,255,255,0.06)_65%,transparent)] opacity-80" />
                    Find a Lawyer
                    <ArrowRight className="relative w-5 h-5 text-[#fff3cf] group-hover:translate-x-0.5 transition-transform duration-300" />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link to="/register" className="relative inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] rounded-xl border-2 border-[#d8c5e8]/60 bg-gradient-to-r from-white/95 via-[#faf6f0]/92 to-white/95 text-[#0f172a] shadow-[0_12px_40px_rgba(161,128,74,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:from-white hover:to-[#faf3e7] hover:shadow-[0_20px_60px_rgba(161,128,74,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] dark:hover:text-yellow-700 overflow-hidden group hover:text-yellow-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#a1804a]/0 via-[#a1804a]/8 to-[#a1804a]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Get Started Free
                  </Link>
                </MagneticButton>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
                {['Family Law', 'Corporate', 'Property'].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-2 text-slate-300 hover:text-[#f3d59b] transition-colors duration-300">
                    <CheckCircle2 className="w-5 h-5 text-[#a1804a]" />
                    <span className="text-sm font-medium">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - 3D Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Premium frame decoration */}
              <div className="absolute -inset-8 rounded-[3rem] border border-[#a1804a]/25 pointer-events-none hidden lg:block" />
              <div className="absolute -inset-6 rounded-[2.5rem] border border-[#a1804a]/15 pointer-events-none hidden lg:block" />
              <div className="absolute -inset-10 rounded-[3.5rem] border border-[#a1804a]/8 pointer-events-none hidden lg:block" />

              <Tilt className="Tilt" options={{ max: 20, scale: 1.05 }}>
                <div className="relative rounded-3xl overflow-hidden glass shadow-[0_40px_120px_rgba(161,128,74,0.3),0_0_80px_rgba(161,128,74,0.18),inset_0_0_0_1px_rgba(255,255,255,0.12)] border border-[#e7d7be]/60">
                  {/* Premium gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none z-10" />

                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800"
                    alt="Legal Consultation"
                    className="w-full h-auto rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-[#0f172a]/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                  {/* Floating Cards */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-6 left-6 right-6 p-5 bg-gradient-to-br from-white/12 via-white/8 to-white/6 backdrop-blur-xl rounded-2xl border border-white/30 shadow-[0_16px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#a1804a] to-[#8a6a3d] flex items-center justify-center shadow-[0_8px_24px_rgba(161,128,74,0.3)]">
                        <Scale className="w-7 h-7 text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-white font-bold tracking-wide">Expert Consultation</p>
                        <p className="text-slate-300 text-xs font-medium">Available 24/7</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Tilt>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20  dark:bg-[#0f172a] border-y border-[#a1804a]/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 divide-x-0 md:divide-x divide-[#a1804a]/20">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-center px-4"
              >
                <div className="font-serif text-5xl md:text-6xl font-bold text-[#a1804a] mb-3">
                  <CountUp end={stat.value} duration={2.5} separator="," suffix={stat.suffix} />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-[#f0f1f3] dark:bg-[#0a0e17] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className="text-[0.65rem] font-bold text-[#a1804a] tracking-[0.2em] uppercase mb-4 block">Platform Architecture</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0f172a] dark:text-white mb-6">
              Institutional Authority & Digital Speed
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">
              We provide comprehensive legal solutions tailored to your needs, combining traditional legal excellence with state-of-the-art technological infrastructure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="bg-white dark:bg-[#0f172a] p-10 h-full border border-gray-200 dark:border-gray-800 hover:border-[#a1804a] dark:hover:border-[#a1804a] transition-all duration-500 group relative overflow-hidden rounded-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#a1804a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full"></div>
                    <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 rounded-sm">
                      <Icon className="w-5 h-5 text-[#a1804a]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white mb-4 group-hover:text-[#a1804a] transition-colors">{feature.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                    <Link to={feature.path} className="mt-8 flex items-center text-[0.65rem] font-bold text-[#0f172a] dark:text-white tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-4 group-hover:translate-x-0 transform cursor-pointer hover:text-[#a1804a]">
                      Explore <ArrowRight className="w-3 h-3 ml-2 text-[#a1804a]" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white dark:bg-[#151f32] transition-colors border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[0.65rem] font-bold text-[#a1804a] tracking-[0.2em] uppercase mb-4 block">The Process</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0f172a] dark:text-white mb-8 leading-tight">
                Engage with Legal Excellence in Three Steps
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-10">
                Our protocol is designed for maximum efficiency and security, ensuring you connect with the right professional without unnecessary friction.
              </p>
              <div className="space-y-12">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                    className="flex gap-6 relative"
                  >
                    {index !== steps.length - 1 && (
                      <div className="absolute left-[1.15rem] top-12 bottom-[-3rem] w-[1px] bg-gray-200 dark:bg-gray-700"></div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                      <span className="font-serif text-sm font-bold text-[#a1804a]">{step.number}</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#0f172a] dark:text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-sm overflow-hidden relative shadow-2xl transition-all duration-500 hover:shadow-[0_0_60px_rgba(161,128,74,0.5)] hover:scale-105 group">
                <div className="absolute inset-0 -m-6 bg-[#a1804a]/30 rounded-sm blur-3xl opacity-60 -z-10 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-[#0f172a]/20 mix-blend-multiply z-10 "></div>
                <img
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800"
                  alt="Legal Documents"
                  className="w-full h-full object-cover "
                />
                <div className="absolute inset-0 rounded-sm border border-[#a1804a]/30 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0f172a] to-transparent z-20">
                  <div className="inline-block p-3 bg-[#a1804a] text-white rounded-sm mb-4">
                    <Shield className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-2">Secure Protocol</h3>
                  <p className="text-gray-300 text-sm">End-to-end encrypted consultations</p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 border border-[#a1804a]/30 rounded-sm -z-10"></div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 border border-gray-200 dark:border-gray-800 rounded-sm -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white dark:bg-[#0a0e17] transition-colors relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0f172a] dark:text-white mb-4">
                Voices of Authority
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Trusted by high-net-worth individuals and corporate entities worldwide.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-3"
            >
              <button
                type="button"
                onClick={() => scrollTestimonials('left')}
                disabled={!canScrollLeft}
                className="w-12 h-12 rounded-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-900 dark:text-white hover:border-[#a1804a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollTestimonials('right')}
                disabled={!canScrollRight}
                className="w-12 h-12 rounded-sm bg-[#0f172a] dark:bg-white flex items-center justify-center text-white dark:text-[#0f172a] hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>

          <div
            ref={testimonialsRef}
            className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
                data-testimonial-card
                className="bg-white dark:bg-[#151f32] p-8 border-l-[3px] border-[#a1804a] shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col h-full snap-start flex-none w-[calc(100%-1rem)] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)]"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#a1804a] text-[#a1804a]" />
                  ))}
                </div>
                <p className="text-[#0f172a] dark:text-gray-300 text-[15px] leading-relaxed mb-8 italic flex-1">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-[#0f172a] dark:text-white font-serif font-bold rounded-xl">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0f172a] dark:text-white text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Extraordinary */}
      <section className="py-32 md:py-40 bg-gradient-to-br from-white via-[#faf8f3] to-[#f3ede2] dark:bg-gradient-to-br dark:from-[#131d33] dark:via-[#131d33] dark:to-[#172440] transition-colors relative overflow-hidden">
        {/* Clean background layers */}
        <div className="absolute inset-0 opacity-100 dark:opacity-100">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.18)_45%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.35)_0%,rgba(15,23,42,0.18)_45%,rgba(15,23,42,0)_100%)]" />
        </div>
        <div className="absolute inset-0 opacity-40 dark:opacity-30 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:80px_80px]" />
        {/* Decorative border line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a1804a]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a1804a]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden border-l-[3px]   border-[#94773d] bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(253,250,244,0.97)_42%,rgba(248,243,234,0.98)_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.86)] dark:border-[#b1925f] dark:bg-[linear-gradient(145deg,rgba(17,24,39,0.97)_0%,rgba(15,23,42,0.95)_42%,rgba(8,12,23,0.99)_100%)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] group"
          >
            <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-0">
              <div className="p-10 sm:p-12 md:p-16 lg:p-18 xl:p-20 relative">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#e1d2b4] bg-gradient-to-r from-white via-[#fdf9f1] to-[#f6efe2] text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#a1804a] mb-8 shadow-[0_8px_24px_rgba(161,128,74,0.08)] dark:border-[#6b5230] dark:bg-gradient-to-r dark:from-[#111827] dark:via-[#0f172a] dark:to-[#1f2937] dark:text-[#f3d59b] dark:shadow-[0_8px_32px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <Scale className="w-4 h-4" /> Private Counsel Interface
                </span>

                <h2 className="font-serif text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] dark:from-white dark:via-[#f0e8ff] dark:to-white bg-clip-text text-transparent leading-[1.1] mb-6 max-w-2xl drop-shadow-sm">
                  Ready to Secure Your Heritage?
                </h2>

                <p className="text-sm md:text-base text-slate-700 leading-relaxed max-w-2xl mb-12 dark:text-slate-200 font-normal">
                  Convert high-stakes legal complexity into a disciplined, premium workflow. Verified experts, encrypted collaboration, and concierge-grade execution in one secure environment.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 mb-12 max-w-2xl">
                  {[
                    'Private intake in minutes',
                    'Verified specialists only',
                    'Built for high-stakes matters',
                  ].map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className=" border  bg-gradient-to-br from-white via-white to-[#f3f1ef] px-5 py-5 backdrop-blur-md shadow-[0_12px_32px_rgba(161,128,74,0.08),inset_0_1px_0_rgba(255,255,255,0.84)] hover:shadow-[0_16px_40px_rgba(161,128,74,0.12)] dark:border-[#1c1914] dark:bg-gradient-to-br dark:from-[#192748] dark:via-[#192748] dark:to-[#111827] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_12px_rgba(255,255,255,0.03)] dark:hover:shadow-[0_16px_50px_rgba(0,0,0,0.36)] transition-all duration-300">
                      <CheckCircle2 className="w-5 h-5 text-[#a1804a] mb-3" />
                      <p className="text-sm font-medium text-slate-700 leading-snug dark:text-slate-50">{item}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <MagneticButton>
                    <Link to="/register" className="relative inline-flex items-center gap-3 rounded-xl border-2 border-[#a1804a] bg-gradient-to-r from-[#a1804a] via-[#c7a56f] to-[#e7d7be] px-9 py-4 text-sm font-semibold tracking-wide text-white shadow-[0_20px_50px_rgba(161,128,74,0.3),inset_0_-2px_6px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(161,128,74,0.4),inset_0_1px_20px_rgba(255,255,255,0.15),0_0_30px_rgba(161,128,74,0.18)] group/btn overflow-hidden dark:border-[#d7b98a]  dark:from-[#8a6a3d] dark:via-[#a9834f] dark:to-[#c7a56f] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24),0_0_30px_rgba(161,128,74,0.2),inset_0_1px_0_rgba(255,255,255,0.14)] dark:hover:shadow-[0_28px_70px_rgba(0,0,0,0.34),0_0_36px_rgba(215,185,138,0.22),inset_0_1px_20px_rgba(255,255,255,0.12)] hover:text-yellow-900">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 -translate-x-full group-hover/btn:translate-x-full" style={{ animation: 'none' }} />
                      <span className="relative">Start Consultation</span>
                      <ArrowRight className="w-4 h-4 relative" />
                    </Link>
                  </MagneticButton>

                  <Link to="/lawyers" className="relative inline-flex items-center gap-2 rounded-xl border-2 border-[#e1d2b4] bg-gradient-to-r from-white via-[#fdf9f1] to-[#f6efe2] px-8 py-4 text-sm font-semibold tracking-wide text-[#0f172a] transition-all duration-300 hover:from-white hover:to-[#faf3e7] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(161,128,74,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-[#5b4a2f] dark:bg-gradient-to-r dark:from-[#111827] dark:via-[#0f172a] dark:to-[#111827] dark:text-[#f8fafc] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_15px_rgba(255,255,255,0.04)] dark:hover:-translate-y-1 dark:hover:from-[#161d2d] dark:hover:to-[#111827] dark:hover:border-[#7b6745] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.36),0_0_28px_rgba(161,128,74,0.12),inset_0_1px_20px_rgba(255,255,255,0.05)] overflow-hidden group/btn2">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#a1804a]/0 via-[#a1804a]/8 to-[#a1804a]/0 opacity-0 group-hover/btn2:opacity-100 transition-opacity duration-300 dark:via-[#d7b98a]/10" />
                    <span className="relative">Explore Experts</span>
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[520px] p-8 sm:p-10 lg:p-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.08),transparent_38%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.14),transparent_38%)]" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full max-w-[28rem] aspect-square"
                >
                  <div className="absolute inset-6 rounded-full border border-[#eadfca] bg-[radial-gradient(circle_at_center,rgba(255,252,246,0.92),rgba(251,246,237,0.9)_45%,transparent_70%)] backdrop-blur-sm dark:border-[#6b5230] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),rgba(15,23,42,0.12)_45%,transparent_70%)]" />
                  <div className="absolute inset-14 rounded-full border border-[#e7d7be] bg-white/65 shadow-[inset_0_0_60px_rgba(255,255,255,0.55)] dark:border-[#5b4a2f] dark:bg-white/5 dark:shadow-[inset_0_0_60px_rgba(255,255,255,0.04)]" />
                  <div className="absolute inset-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,252,246,0.98),rgba(249,243,233,0.95)_55%,rgba(231,215,190,0.9)_100%)] flex items-center justify-center text-center p-8 shadow-[0_0_80px_rgba(161,128,74,0.14)] dark:bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.94),rgba(10,14,23,0.96)_55%,rgba(8,12,23,0.99)_100%)] dark:shadow-[0_0_90px_rgba(0,0,0,0.34),0_0_30px_rgba(161,128,74,0.08)]">
                    <div>
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#a1804a] text-white mb-5 shadow-[0_0_30px_rgba(161,128,74,0.28)] dark:shadow-[0_0_36px_rgba(215,185,138,0.18)]">
                        <Shield className="w-8 h-8" strokeWidth={1.8} />
                      </div>
                      <p className="text-sm font-semibold tracking-wide text-[#a1804a] mb-3 dark:text-[#f3d59b] dark:drop-shadow-[0_1px_0_rgba(0,0,0,0.45)]">Heritage Vault</p>
                      <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#0f172a] leading-tight max-w-[12ch] mx-auto dark:text-white">
                        Trusted. Precise. Discreet.
                      </h3>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                      animate={{
                        x: [0, 6, 0, -4, 0],
                        y: [0, -8, 0, 6, 0],
                        rotate: [0, 1.25, 0, -1.25, 0],
                      }}
                      transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-[-4%] top-[8%] w-44 rounded-2xl border border-[#e6dccb] bg-white/84 p-4 shadow-[0_14px_26px_rgba(161,128,74,0.08)] backdrop-blur-md dark:border-[#5b4a2f] dark:bg-gradient-to-br dark:from-[#111827]/96 dark:via-[#0f172a]/94 dark:to-[#111827]/98 dark:shadow-[0_18px_40px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.04)]"
                    >
                      <div className="absolute -inset-1 rounded-3xl bg-[radial-gradient(circle,rgba(161,128,74,0.14),transparent_68%)] blur-xl dark:bg-[radial-gradient(circle,rgba(161,128,74,0.2),transparent_68%)]" />
                      <div className="relative flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#a1804a]/15 flex items-center justify-center text-[#a1804a] shadow-[inset_0_0_0_1px_rgba(161,128,74,0.18)] dark:bg-[#a1804a]/20 dark:text-[#f3d59b] dark:shadow-[inset_0_0_0_1px_rgba(243,213,155,0.18)]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Case Workflow</p>
                          <p className="text-sm font-semibold text-[#0f172a] dark:text-white">Priority review</p>
                        </div>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-[#efe4cf] overflow-hidden dark:bg-white/10">
                        <motion.div
                          animate={{ x: ['-18%', '120%', '-18%'] }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-[#a1804a] via-[#c7a56f] to-[#e7d7be] dark:from-[#a1804a] dark:via-[#d7b98a] dark:to-[#f3d59b]"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{
                        x: [0, -8, 0, 5, 0],
                        y: [0, 7, 0, -6, 0],
                        rotate: [0, -1.5, 0, 1.5, 0],
                      }}
                      transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                      className="absolute right-[-4%] bottom-[2%] w-48 rounded-2xl border border-[#e6dccb] bg-white/86 p-4 shadow-[0_14px_26px_rgba(161,128,74,0.08)] backdrop-blur-md dark:border-[#5b4a2f] dark:bg-gradient-to-br dark:from-[#111827]/96 dark:via-[#0f172a]/94 dark:to-[#111827]/98 dark:shadow-[0_18px_40px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.04)]"
                    >
                      <div className="absolute -inset-1 rounded-3xl bg-[radial-gradient(circle,rgba(161,128,74,0.14),transparent_68%)] blur-xl dark:bg-[radial-gradient(circle,rgba(161,128,74,0.2),transparent_68%)]" />
                      <p className="relative text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 dark:text-slate-400">Advisory Desk</p>
                      <div className="relative flex items-center gap-3 text-[#0f172a] dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-[#a1804a]/15 flex items-center justify-center text-[#a1804a] dark:bg-[#a1804a]/20 dark:text-[#f3d59b] shadow-[inset_0_0_0_1px_rgba(161,128,74,0.16)] dark:shadow-[inset_0_0_0_1px_rgba(243,213,155,0.16)]">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Live concierge</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">Guided every step</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="absolute -left-4 bottom-10 w-24 h-24 rounded-3xl border border-[#e7d7be]/70 bg-[#f6efe2]/90 backdrop-blur-sm dark:border-[#5b4a2f] dark:bg-gradient-to-br dark:from-[#1f2937]/90 dark:to-[#0f172a]/90" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border border-dashed border-[#e1d2b4]/40 dark:border-[#7b6745]/35"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 58, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-10 rounded-full border border-dashed border-white/10"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Landing
