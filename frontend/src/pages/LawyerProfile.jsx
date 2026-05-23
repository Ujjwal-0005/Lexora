import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Star,
  MapPin,
  Briefcase,
  ShieldCheck,
  Globe,
  Award,
  CheckCircle2,
  GraduationCap,
  FileText
} from 'lucide-react'
import { useLawyer, useLawyerReviews } from '../hooks/useLawyers'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/formatDate'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const LawyerProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const isLawyer = useAuthStore((state) => state.user?.role === 'lawyer')
  const [selectedDuration, setSelectedDuration] = useState(30)

  const { data: lawyer, isLoading: lawyerLoading } = useLawyer(id)
  const { data: reviewsData, isLoading: reviewsLoading } = useLawyerReviews(id)
  const isBookingOpen = lawyer?.is_available !== false

  const reviews = reviewsData?.reviews?.data || []
  const totalReviews = reviewsData?.total_reviews ?? reviews.length
  const averageRating = reviewsData?.average_rating || 0

  if (lawyerLoading) {
    return (
      <div className="lp-page">
        <div className="max-w-4xl mx-auto px-4 pt-12">
          <Skeleton height={300} className="mb-6" />
          <Skeleton count={5} />
        </div>
      </div>
    )
  }

  if (!lawyer) {
    return (
      <div className="lp-page flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lawyer not found</h2>
          <Link to="/lawyers" className="text-primary-500 hover:underline">
            Back to Discovery
          </Link>
        </div>
      </div>
    )
  }

  const user = lawyer.user

  // Prefer real profile data for newly registered lawyers, keep fallback for legacy profiles.
  const qualifications = lawyer.educational_qualifications?.length > 0
    ? lawyer.educational_qualifications
    : [
      { degree: 'Master of Laws (LL.M.)', university: 'Harvard Law School' },
      { degree: 'B.A. in Jurisprudence', university: 'Oxford University' },
    ]

  const awards = lawyer.admissions_awards?.length > 0
    ? lawyer.admissions_awards
    : [
      'High Court of Justice (UK)',
      'Chambers & Partners Global Rank #1',
      'New York State Bar Association',
    ]

  const competencies = lawyer.core_competencies?.length > 0
    ? lawyer.core_competencies
    : lawyer.specializations?.length > 0
      ? lawyer.specializations.map((spec) => spec.name)
      : ['M&A Strategy', 'IP Litigation', 'Equity Structuring', 'Privacy Law']

  const profileCities = lawyer.cities?.length > 0
    ? lawyer.cities
    : lawyer.regions?.length > 0
      ? lawyer.regions.map((r) => r.city)
      : ['LONDON', 'GENEVA']

  const documentExpertise = lawyer.document_expertise?.length > 0
    ? lawyer.document_expertise
    : lawyer.document_types?.map((doc) => ({
      name: doc.name,
      fee: doc.pivot?.custom_price || doc.base_price,
    })) || []

  const designation = lawyer.designation || null
  const designationLabel = designation
    ? designation.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : null

  const consultationPlans = [
    {
      duration: 30,
      label: 'Quick Review',
      description: 'Perfect for focused legal guidance and urgent questions.',
      fee: Number(lawyer?.consultation_fee) || 0,
      badge: 'Most Popular',
    },
    {
      duration: 60,
      label: 'Deep Consultation',
      description: 'Best for complex matters, document review, and next steps.',
      fee: Number(lawyer?.consultation_fee_60) || (Number(lawyer?.consultation_fee) || 0) * 1.5,
      badge: 'Best Value',
    },
    {
      duration: 90,
      label: 'Extended Strategy',
      description: 'Ideal for multi-issue planning and detailed advice.',
      fee: Number(lawyer?.consultation_fee_90) || (Number(lawyer?.consultation_fee) || 0) * 2,
      badge: 'Premium Session',
    },
  ]

  const subtitle = competencies.slice(0, 2).join(' • ') || 'Senior Partner • International Corporate & Intellectual Property Law'
  const docAuditPrice = documentExpertise.length > 0 ? documentExpertise[0].fee : 1200

  const photoUrl = user?.photo_url || (user?.profile_photo ? `/storage/${user.profile_photo}` : null)

  const mockReviews = reviews.length > 0 ? reviews : [
    { id: 1, client: { name: "Marcus Thorne" }, rating: 5, comment: "Julian provided exceptional clarity during our multi-jurisdictional acquisition. His attention to fine-print detail is unparalleled in the industry." },
    { id: 2, client: { name: "Elena Rodriguez" }, rating: 5, comment: "Absolute professionalism. The scheduling was seamless and the advice saved our firm significant IP liability." }
  ]

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div className="lp-page">
      {/* ── Hero / Top Section ── */}
      <section className="lp-hero-wrap">
        <div className="lp-hero-content">

          {/* Photo Block */}
          <div className="lp-photo-block">
            {photoUrl ? (
              <img src={photoUrl} alt={user?.name} className="lp-photo-img" />
            ) : (
              <span className="lp-photo-initials">{getInitials(user?.name)}</span>
            )}
            <div className="lp-verified-badge">
              <ShieldCheck size={14} fill="#22c55e" color="#fff" />
              Verified Expert
            </div>
            {!isBookingOpen && (
              <div className="lp-verified-badge" style={{ top: '3.2rem', background: 'rgba(180, 83, 9, 0.92)' }}>
                <ShieldCheck size={14} fill="#fff" color="#fff" />
                Unavailable
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lp-header-info">
            <h1 className="lp-name">{user?.name}</h1>
            <p className="lp-subtitle">{subtitle}</p>

            <div className="lp-badges-row">
              <span className="lp-badge-pill">
                <Award size={13} className="lp-badge-icon" />
                {designationLabel || 'Pending Designation'}
              </span>
              <span className="lp-badge-pill">
                <Briefcase size={13} className="lp-badge-icon" />
                {lawyer.years_of_experience}+ YEARS EXPERIENCE
              </span>
              <span className="lp-badge-pill">
                <Globe size={13} className="lp-badge-icon" />
                {competencies.slice(0, 3).join(', ').toUpperCase()}
              </span>
              <span className="lp-badge-pill">
                <MapPin size={13} className="lp-badge-icon" />
                {profileCities.join(' / ')}
              </span>
            </div>

            <div className="lp-header-actions">
              <button
                className="lp-btn-contact"
                onClick={() => {
                  if (!isBookingOpen) {
                    toast.error('This lawyer is currently unavailable for new consultation requests.')
                    return
                  }

                  if (!isAuthenticated) {
                    navigate('/login')
                    return
                  }

                  const lawyerEmail = user?.email

                  // Validate email
                  if (!lawyerEmail || lawyerEmail.trim() === '') {
                    toast.error('Lawyer email is not available. Please use the messaging feature instead.')
                    navigate(`/client/messages`)
                    return
                  }

                  // Validate email format
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                  if (!emailRegex.test(lawyerEmail)) {
                    toast.error('Invalid email format. Please use the messaging feature instead.')
                    navigate(`/client/messages`)
                    return
                  }

                  try {
                    const subject = encodeURIComponent(`Consultation request for ${user?.name || 'your services'}`)
                    const body = encodeURIComponent('Hello, I would like to schedule a consultation.')
                    const mailtoLink = `mailto:${lawyerEmail}?subject=${subject}&body=${body}`

                    console.log('Opening email client for:', lawyerEmail)
                    window.location.href = mailtoLink

                    toast.success('Opening your email client...')
                  } catch (error) {
                    console.error('Error opening email client:', error)
                    toast.error('Could not open email client. Please use the messaging feature.')
                    navigate(`/client/messages`)
                  }
                }}
              >
                Contact Counsel
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <main className="lp-main">

        {/* Left Column */}
        <div className="lp-col-left">

          {/* Professional Narrative Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="lp-card"
          >
            <h2 className="lp-card-title">Professional Narrative</h2>
            <p className="lp-bio-text">
              {lawyer.bio || `${user?.name?.split(' ')[0]} specializes in navigating the complex intersections of international trade law and digital asset protection. With a career spanning across the major financial hubs of Europe and Asia, he provides institutional-grade counsel to Fortune 500 companies and high-growth technology firms alike. His approach blends traditional legal rigor with a forward-thinking understanding of emerging regulatory landscapes.`}
            </p>

            <div className="lp-cred-grid">
              <div className="lp-cred-col">
                <h4>Academic Credentials</h4>
                {qualifications.map((item, index) => (
                  <div key={`${item.university}-${index}`} className="lp-edu-item">
                    <GraduationCap size={16} className="lp-edu-icon" />
                    <div>
                      <p className="lp-edu-name">{item.university}</p>
                      <p className="lp-edu-deg">{item.degree}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lp-cred-col">
                <h4>Core Competencies</h4>
                <div className="lp-tags">
                  {competencies.map((item, index) => (
                    <span key={`${item}-${index}`} className="lp-tag">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pricing Services Grid */}
          <div className="lp-services-grid">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lp-service-card">
              <div className="lp-svc-top">
                <Briefcase size={22} className="lp-svc-icon" strokeWidth={1.5} />
                <span className="lp-svc-price">{formatPrice(lawyer.consultation_fee)}/30min</span>
              </div>
              <h3 className="lp-svc-title">Strategy Consultation</h3>
              <p className="lp-svc-desc">
                In-depth analysis of legal risks and strategic roadmap development for complex cases.
              </p>

            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lp-service-card">
              <div className="lp-svc-top">
                <FileText size={22} className="lp-svc-icon" strokeWidth={1.5} />
                <span className="lp-svc-price">{formatPrice(docAuditPrice)}+</span>
              </div>
              <h3 className="lp-svc-title">Document Audit</h3>
              <p className="lp-svc-desc">
                {documentExpertise.length > 0
                  ? `Expert in ${documentExpertise.slice(0, 2).map((item) => item.name).join(', ')} and more.`
                  : 'Comprehensive review of contracts, filings, and compliance documentation with risk reports.'}
              </p>

            </motion.div>
          </div>

          {/* Client Testament Card */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lp-card">
            <div className="lp-reviews-header">
              <h2 className="lp-card-title" style={{ margin: 0 }}>Client Testament</h2>
              <div className="lp-rating-summary">
                <Star size={14} className="star" />
                <span className="lp-rating-score">{averageRating || '4.9'}</span>
                <span className="lp-rating-count">({totalReviews || 124} Reviews)</span>
              </div>
            </div>

            {mockReviews.map((review, idx) => (
              <div key={review.id || idx} className="lp-review-item">
                <div className="lp-review-top">
                  <p className="lp-reviewer-name">{review.client?.name}</p>
                  <div className="lp-review-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className={i < review.rating ? 'star' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <p className="lp-review-text">"{review.comment}"</p>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Right Column */}
        <div className="lp-col-right ">

          {/* Scheduler Card */}
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="lp-scheduler">
            <div className="lp-scheduler-head">
              <div className="lp-scheduler-icon">
                <Briefcase size={18} />
              </div>
              <div>
                <h4 className="lp-sched-label">Consultation Duration</h4>
                <p className="lp-scheduler-note">Choose the session length that matches your legal need.</p>
              </div>
            </div>
            <div className="lp-duration-list">
              {consultationPlans.map((plan) => {
                const isActive = selectedDuration === plan.duration

                return (
                  <button
                    key={plan.duration}
                    onClick={() => setSelectedDuration(plan.duration)}
                    aria-pressed={isActive}
                    className={`lp-duration-option ${isActive ? 'lp-duration-option--active' : ''}`}
                  >
                    <div className="lp-duration-main">
                      <span className="lp-duration-badge">{plan.badge}</span>
                      <div className="lp-duration-label-row">
                        <span className="lp-duration-label">{plan.duration} Minutes</span>
                        {isActive && <CheckCircle2 size={18} className="lp-duration-check" />}
                      </div>
                      <p className="lp-duration-desc">{plan.description}</p>
                    </div>
                    <div className="lp-duration-price-wrap">
                      <span className="lp-duration-price">{formatPrice(plan.fee)}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {!isLawyer && (
              <div className="lp-secure-wrap">
                <button
                  className="lp-btn-secure dark:bg-orange-500 dark:hover:bg-orange-700 dark:text-white  light:bg-orange-500 light:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!isBookingOpen}
                  onClick={() => {
                    if (!isBookingOpen) {
                      toast.error('This lawyer is currently unavailable for new consultation requests.')
                      return
                    }

                    if (!isAuthenticated) navigate('/login')
                    else navigate(`/book/${id}`, { state: { selectedDuration } })
                  }}
                >
                  {isBookingOpen ? 'Secure Appointment' : 'Unavailable'}
                </button>
              </div>
            )}

            <p className="lp-sched-footer">
              Institutional priority given to active retained clients.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lp-card" style={{ padding: '24px' }}>
            <h4 className="lp-sched-label" style={{ color: '#c9a84c', marginBottom: '20px' }}>
              Document Expertise
            </h4>
            <div className="lp-awards-list">
              {documentExpertise.length > 0 ? documentExpertise.map((item, i) => (
                <div key={`${item.name}-${i}`} className="lp-award-item">
                  <FileText size={16} className="lp-award-icon" />
                  <span className="lp-award-text">{item.name} - {formatPrice(item.fee)}</span>
                </div>
              )) : (
                <div className="lp-award-item">
                  <FileText size={16} className="lp-award-icon" />
                  <span className="lp-award-text">Document pricing will appear here after setup.</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Awards Card */}
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="lp-card" style={{ padding: '24px' }}>
            <h4 className="lp-sched-label" style={{ color: '#c9a84c', marginBottom: '20px' }}>
              Admissions & Awards
            </h4>
            <div className="lp-awards-list">
              {awards.map((award, i) => (
                <div key={i} className="lp-award-item">
                  <Award size={16} className="lp-award-icon" />
                  <span className="lp-award-text">{award}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </main>
    </div>
  )
}

export default LawyerProfile
