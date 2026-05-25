import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Star, ChevronDown, ChevronLeft, ChevronRight,
  SlidersHorizontal, X, ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLawyers } from '../hooks/useLawyers'
import { useFilterStore } from '../store/filterStore'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

/* ─────────────────────────────────────────
   AVATAR BLOCK  (square with initials + gradient)
   matches the rectangular lawyer photo from the reference
───────────────────────────────────────── */
const GRADIENTS = [
  ['#2c3e6b', '#1a2540'],   // deep navy
  ['#3a506b', '#1f3044'],   // steel blue
  ['#4a3728', '#2d1f14'],   // warm brown
  ['#2d4a3e', '#1a2e26'],   // forest
  ['#4a2d4a', '#2e1a2e'],   // plum
  ['#1e4d6b', '#0f2d44'],   // ocean
]

const AvatarBlock = ({ name, photoUrl }) => {
  const idx = name ? name.charCodeAt(0) % GRADIENTS.length : 0
  const [g1, g2] = GRADIENTS[idx]
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="dd-avatar-img"
      />
    )
  }

  return (
    <div
      className="dd-avatar-block"
      style={{ background: `linear-gradient(145deg, ${g1}, ${g2})` }}
    >
      <span className="dd-avatar-initials">{initials}</span>
      {/* subtle suit/briefcase silhouette watermark */}
      <svg className="dd-avatar-silhouette" viewBox="0 0 60 80" fill="none">
        <ellipse cx="30" cy="26" rx="13" ry="14" fill="rgba(255,255,255,0.08)" />
        <path d="M5 80 Q5 50 30 50 Q55 50 55 80Z" fill="rgba(255,255,255,0.06)" />
        <rect x="22" y="12" width="16" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────
   ROLE BADGE  (coloured uppercase badge under name)
───────────────────────────────────────── */
const ROLE_MAP = {
  'senior partner': { label: 'SENIOR PARTNER', cls: 'dd-badge-senior' },
  'managing associate': { label: 'MANAGING ASSOCIATE', cls: 'dd-badge-associate' },
  'special counsel': { label: 'SPECIAL COUNSEL', cls: 'dd-badge-counsel' },
  'equity partner': { label: 'EQUITY PARTNER', cls: 'dd-badge-equity' },
  'partner': { label: 'PARTNER', cls: 'dd-badge-partner' },
}

const getRoleBadge = (designation, years) => {
  const normalizedDesignation = (designation || '').toLowerCase().trim()

  if (normalizedDesignation && ROLE_MAP[normalizedDesignation]) {
    return ROLE_MAP[normalizedDesignation]
  }

  if (years >= 20) return ROLE_MAP['senior partner']
  if (years >= 15) return ROLE_MAP['equity partner']
  if (years >= 10) return ROLE_MAP['managing associate']
  if (years >= 7) return ROLE_MAP['special counsel']
  return ROLE_MAP['partner']
}

const getPracticeAreas = (profile) => {
  if (!Array.isArray(profile.core_competencies) || profile.core_competencies.length === 0) {
    return []
  }

  const unique = []

  profile.core_competencies.forEach((name, index) => {
    const value = String(name || '').trim()
    if (!value) return
    if (unique.some((item) => item.name.toLowerCase() === value.toLowerCase())) return
    unique.push({ id: `cc-${index}`, name: value })
  })

  return unique.slice(0, 3)
}

/* ─────────────────────────────────────────
   STAR ROW
───────────────────────────────────────── */
const Stars = ({ rating, count }) => {
  const r = parseFloat(rating) || 0
  return (
    <div className="dd-stars-wrap">
      <div className="dd-stars">
        {[1, 2, 3, 4, 5].map(s => (
          <Star
            key={s}
            size={11}
            className={s <= Math.round(r) ? 'dd-star-on' : 'dd-star-off'}
          />
        ))}
      </div>
      {r > 0 && <span className="dd-rating-num">{r.toFixed(1)}</span>}
      {count > 0 && <span className="dd-review-ct">({count} Reviews)</span>}
    </div>
  )
}

/* ─────────────────────────────────────────
   LAWYER CARD  — exact match of reference screenshot
───────────────────────────────────────── */
const LawyerCard = ({ lawyer, index = 0 }) => {
  const user = lawyer.user
  const profile = lawyer
  const badge = getRoleBadge(profile.designation, profile.years_of_experience || 0)
  const isAvailable = profile.is_available !== false
  const specs = getPracticeAreas(profile)

  const bio = profile.bio || profile.description || ''
  const rating = profile.average_rating
  const reviews = profile.reviews_count ?? profile.total_reviews ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.055 }}
    >
      <Link to={`/lawyer/${lawyer.id}`} className="dd-card-link">
        <article className={`dd-card ${!isAvailable ? 'dd-card--unavailable' : ''}`}>

          {/* ── TOP: avatar + identity ── */}
          <div className="dd-card-head">
            <AvatarBlock name={user?.name} photoUrl={user?.photo_url} />

            <div className="dd-card-identity">
              <h3 className="dd-lawyer-name">{user?.name}</h3>
              <span className={`dd-badge ${badge.cls}`}>{badge.label}</span>
              <span className={`dd-status-pill ${isAvailable ? 'dd-status-pill--available' : 'dd-status-pill--unavailable'}`}>
                {isAvailable ? 'Accepting Consultations' : 'Unavailable'}
              </span>
              <Stars rating={rating} count={reviews} />
            </div>
          </div>

          {/* ── TAGS: specializations ── */}
          {specs.length > 0 && (
            <div className="dd-tags">
              {specs.map(s => (
                <span key={s.id} className="dd-tag">{s.name}</span>
              ))}
            </div>
          )}

          {/* ── BIO ── */}
          {bio && (
            <p className="dd-bio">
              {bio.length > 120 ? bio.slice(0, 117) + '…' : bio}
            </p>
          )}

          {/* ── BUTTON ── */}
          <div className="dd-card-footer">
            <span className="dd-view-btn">
              {isAvailable ? 'View Profile' : 'Currently unavailable'} <ArrowRight size={13} className="dd-arrow" />
            </span>
          </div>

        </article>
      </Link>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────── */
const CardSkeleton = () => (
  <div className="dd-card dd-skeleton-card">
    <div className="dd-card-head">
      <Skeleton width={72} height={88} style={{ borderRadius: 6 }} />
      <div style={{ flex: 1 }}>
        <Skeleton width="75%" height={18} style={{ marginBottom: 6 }} />
        <Skeleton width="50%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={12} />
      </div>
    </div>
    <Skeleton count={2} height={12} style={{ marginBottom: 4 }} />
    <Skeleton width={110} height={34} style={{ marginTop: 10, borderRadius: 6 }} />
  </div>
)

/* ─────────────────────────────────────────
   STAR FILTER  (sidebar)
───────────────────────────────────────── */
const StarFilter = ({ value, onChange }) => (
  <div className="dd-star-filter">
    {[1, 2, 3, 4, 5].map(s => (
      <button
        key={s}
        onClick={() => onChange(s === value ? 0 : s)}
        className="dd-star-filter-btn"
      >
        <Star
          size={17}
          className={s <= value ? 'dd-star-on' : 'dd-star-off'}
        />
      </button>
    ))}
    {value > 0 && <span className="dd-star-filter-label">{value}.0+</span>}
  </div>
)

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const LawyerList = () => {
  const {
    specialization, regionId, minRating, searchQuery,
    sortBy, sortOrder,
    setSpecialization, setRegionId, setMinRating,
    setSearchQuery, setSortBy, setSortOrder, resetFilters,
  } = useFilterStore()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [availability, setAvailability] = useState('') // '' | 'available' | 'unavailable'

  const filters = { specialization, regionId, minRating, search: searchQuery, sortBy, sortOrder, page: currentPage, availability }
  const { data, isLoading } = useLawyers(filters)

  const lawyers = data?.lawyers?.data || []
  const total = data?.lawyers?.total ?? lawyers.length
  const lastPage = data?.lawyers?.last_page ?? 1
  const specializations = data?.specializations || []
  const regions = data?.regions || []

  /* sort tabs */
  const SORT_TABS = [
    { label: 'Top Rated', by: 'average_rating', order: 'desc' },
    { label: 'Most Experienced', by: 'years_of_experience', order: 'desc' },
  ]
  const activeTab = SORT_TABS.find(t => t.by === sortBy && t.order === sortOrder)?.label || 'Top Rated'

  const goPage = (p) => {
    if (p < 1 || p > lastPage) return
    setCurrentPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleSpecialization = (slug) => {
    const next = specialization.includes(slug)
      ? specialization.filter((item) => item !== slug)
      : [...specialization, slug]

    setSpecialization(next)
    setCurrentPage(1)
  }

  const displayed = availability
    ? lawyers.filter((lawyer) => availability === 'available' ? lawyer.is_available : !lawyer.is_available)
    : lawyers

  /* lock body scroll when mobile filter open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <div className="dd-page">

      {/* ══ HERO BANNER ══ */}
      <section className="dd-hero">
        <motion.h1
          className="dd-hero-title"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Discovery Directory
        </motion.h1>

        <motion.div
          className="dd-search-box"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <Search className="dd-search-icon" size={16} />
          <input
            id="lawyer-search"
            type="text"
            value={searchQuery}
            onChange={e => {
              const value = e.target.value
              setSearchQuery(value)
              setCurrentPage(1)

              if (value.trim()) {
                setSpecialization([])
                setRegionId('')
                setMinRating(0)
                setAvailability('')
              }
            }}
            placeholder="Search by name, region, or core competency..."
            className="dd-search-input"
          />
        </motion.div>
      </section>

      {/* ══ CONTENT ══ */}
      <div className="dd-content">

        {/* mobile filter trigger */}
        <button className="dd-mobile-filter-trigger" onClick={() => setMobileOpen(true)}>
          <SlidersHorizontal size={15} /> Filters
        </button>

        {/* ── SIDEBAR ── */}
        <AnimatePresence>
          <motion.aside
            className={`dd-sidebar ${mobileOpen ? 'dd-sidebar--open' : ''}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
          >
            {/* mobile close */}
            <div className="dd-sidebar-close-row">
              <span className="dd-section-label">Filters</span>
              <button className="dd-close-btn" onClick={() => setMobileOpen(false)}>
                <X size={17} />
              </button>
            </div>

            {/* PRACTICE AREA */}
            <div className="dd-filter-block">
              <p className="dd-section-label">Practice Area</p>
              <ul className="dd-check-list">
                {(specializations.length > 0
                  ? specializations.slice(0, 7)
                  : ['Corporate Law', 'Criminal Defense', 'Family Matters', 'Intellectual Property'].map((n, i) => ({ id: i, name: n, slug: n.toLowerCase().replace(' ', '-') }))
                ).map(spec => (
                  <li key={spec.id}>
                    <label className="dd-check-row">
                      <span className={`dd-check-box ${specialization.includes(spec.slug) ? 'dd-check-box--on' : ''}`}>
                        {specialization.includes(spec.slug) && (
                          <svg viewBox="0 0 10 10" className="dd-check-tick">
                            <polyline points="1.5,5.5 4,8 8.5,2" strokeWidth="1.8" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={specialization.includes(spec.slug)}
                        onChange={() => toggleSpecialization(spec.slug)}
                        className="dd-check-hidden"
                      />
                      <span className="dd-check-text">{spec.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* REGION */}
            <div className="dd-filter-block">
              <p className="dd-section-label">Region</p>
              <div className="dd-select-wrap">
                <select
                  value={regionId}
                  onChange={e => { setRegionId(e.target.value); setCurrentPage(1) }}
                  className="dd-select"
                >
                  <option value="">All Regions</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.city}, {r.state}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="dd-select-chevron" />
              </div>
            </div>

            {/* AVAILABILITY */}
            <div className="dd-filter-block">
              <p className="dd-section-label">Availability</p>
              <ul className="dd-radio-list">
                {[{ val: 'available', label: 'Available' }, { val: 'unavailable', label: 'Unavailable' }].map(o => (
                  <li key={o.val}>
                    <label className="dd-radio-row">
                      <span className={`dd-radio-ring ${availability === o.val ? 'dd-radio-ring--on' : ''}`}>
                        {availability === o.val && <span className="dd-radio-dot" />}
                      </span>
                      <input
                        type="radio"
                        name="availability"
                        checked={availability === o.val}
                        onChange={() => setAvailability(o.val)}
                        className="dd-check-hidden"
                      />
                      <span className="dd-check-text">{o.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* MIN RATING */}
            <div className="dd-filter-block">
              <p className="dd-section-label">Minimum Rating</p>
              <StarFilter value={minRating} onChange={v => { setMinRating(v); setCurrentPage(1) }} />
            </div>

            {/* RESET */}
            <button
              className="dd-reset-btn"
              onClick={() => { resetFilters(); setAvailability(''); setCurrentPage(1) }}
            >
              Reset Filters
            </button>
          </motion.aside>
        </AnimatePresence>

        {/* ── RESULTS ── */}
        <div className="dd-results">

          {/* toolbar */}
          <div className="dd-toolbar">
            <p className="dd-count-text">
              {isLoading
                ? <Skeleton width={200} height={15} />
                : <>Showing <strong>{total}</strong> Qualified Professionals</>
              }
            </p>
            <div className="dd-sort-tabs">
              {SORT_TABS.map(t => (
                <button
                  key={t.label}
                  onClick={() => { setSortBy(t.by); setSortOrder(t.order); setCurrentPage(1) }}
                  className={`dd-sort-tab ${activeTab === t.label ? 'dd-sort-tab--active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* grid */}
          <div className="dd-grid">
            {isLoading
              ? [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
              : displayed.length > 0
                ? displayed.map((l, i) => <LawyerCard key={l.id} lawyer={l} index={i} />)
                : (
                  <div className="dd-empty">
                    <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
                      <circle cx="32" cy="32" r="30" stroke="#d1d5db" strokeWidth="2" />
                      <path d="M20 44 Q32 28 44 44" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="24" cy="26" r="3" fill="#d1d5db" />
                      <circle cx="40" cy="26" r="3" fill="#d1d5db" />
                    </svg>
                    <p>No lawyers found. Try adjusting your filters.</p>
                  </div>
                )
            }
          </div>

          {/* pagination */}
          {!isLoading && lastPage > 1 && (
            <div className="dd-pagination">
              <button
                className="dd-pg-btn dd-pg-arrow"
                onClick={() => goPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => goPage(p)}
                  className={`dd-pg-btn ${currentPage === p ? 'dd-pg-btn--active' : ''}`}
                >
                  {p}
                </button>
              ))}
              <button
                className="dd-pg-btn dd-pg-arrow"
                onClick={() => goPage(currentPage + 1)}
                disabled={currentPage === lastPage}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* mobile sidebar overlay */}
      {mobileOpen && (
        <div className="dd-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </div>
  )
}

export default LawyerList
