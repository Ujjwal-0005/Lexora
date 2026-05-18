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
      content: 'LegalConnect helped me find a fantastic corporate lawyer for my startup. The document generator saved me thousands!',
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
      content: 'The property lawyer I found through LegalConnect handled a complex transaction with complete professionalism.',
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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-navy-900">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop')] bg-cover bg-center opacity-10" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                left: `${i * 20}%`,
                top: `${(i % 2) * 30}%`,
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-primary-500 text-sm font-medium">
                  Trusted by 10,000+ clients
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
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

              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                Connect with expert lawyers, book consultations, and generate legal documents
                — all in one secure platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <MagneticButton>
                  <Link to="/lawyers" className="btn-primary hover:bg-transparent dark:text-yellow-100 flex items-center justify-center gap-2">
                    Find a Lawyer
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link to="/register" className="btn-secondary dark:hover:text-white flex items-center justify-center">
                    Get Started Free
                  </Link>
                </MagneticButton>
              </div>

              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
                {['Family Law', 'Corporate', 'Property'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - 3D Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Tilt className="Tilt" options={{ max: 20, scale: 1.05 }}>
                <div className="relative rounded-2xl overflow-hidden glass">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800"
                    alt="Legal Consultation"
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />

                  {/* Floating Cards */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute bottom-4 left-4 right-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                        <Scale className="w-6 h-6 text-dark-900" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Expert Consultation</p>
                        <p className="text-gray-400 text-sm">Available 24/7</p>
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
      <section className="py-20 bg-[#0f172a] border-y border-[#a1804a]/20 relative overflow-hidden">
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

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-[#151f32] transition-colors relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0f172a] p-12 md:p-20 text-center relative overflow-hidden shadow-[0_30px_70px_rgba(10,20,40,0.45)] rounded-md border border-[#a1804a]/30 group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_50px_100px_rgba(161,128,74,0.35)]"
          >
            <div className="absolute inset-0 bg-[url('image2.png')] bg-no-repeat bg-center bg-cover opacity-30 dark:opacity-20 transform transition-transform duration-700 ease-out group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/88 via-[#0f172a]/78 to-[#0b1220]/92"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(161,128,74,0.35),transparent_38%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.12),transparent_35%)]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#a1804a]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transform transition-all duration-500 ease-out group-hover:scale-125 group-hover:opacity-80"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a1804a]/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 transform transition-all duration-500 ease-out group-hover:scale-125"></div>
            <div className="pointer-events-none absolute inset-0 border border-white/10 rounded-md"></div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-[0.65rem] font-bold text-[#a1804a] tracking-[0.3em] uppercase mb-6 block">Initialize Protocol</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
                Ready to Secure Your Heritage?
              </h2>
              <p className="text-gray-300 text-sm mb-10 leading-relaxed max-w-lg mx-auto">
                Join our exclusive network and experience legal services with institutional authority and digital precision.
              </p>
              <MagneticButton>
                <Link to="/register" className="bg-[#a1804a] hover:bg-[#8e703e] text-white px-9 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 inline-flex items-center justify-center gap-3 shadow-[0_10px_24px_rgba(161,128,74,0.35)] hover:shadow-[0_16px_36px_rgba(161,128,74,0.45)] rounded-sm border border-[#d0b07b]/30 hover:-translate-y-0.5">
                  Start Consultation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Landing
