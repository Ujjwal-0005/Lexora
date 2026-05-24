import { useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DatePicker from 'react-datepicker'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  CreditCard,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from 'lucide-react'
import { useLawyer, useLawyerAvailability } from '../hooks/useLawyers'
import { useCreateConsultation } from '../hooks/useConsultations'
import { formatPrice, formatDateTime } from '../utils/formatDate'

import Loader from '../components/Loader'
import 'react-datepicker/dist/react-datepicker.css'

const BookConsultation = () => {
  const { lawyerId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [duration, setDuration] = useState(location.state?.selectedDuration || 30)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')

  const { data: lawyer, isLoading: lawyerLoading } = useLawyer(lawyerId)
  const { data: availability, isLoading: availabilityLoading } = useLawyerAvailability(lawyerId, duration)
  const createConsultation = useCreateConsultation()
  const isBookingOpen = lawyer?.is_available !== false

  const consultationFee = duration === 60
    ? (Number(lawyer?.consultation_fee_60) || Number(lawyer?.consultation_fee) * 1.5 || 0)
    : duration === 90
      ? (Number(lawyer?.consultation_fee_90) || Number(lawyer?.consultation_fee) * 2 || 0)
      : (Number(lawyer?.consultation_fee) || 0)

  const handleBooking = async () => {
    if (!isBookingOpen || !selectedSlot) return

    const result = await createConsultation.mutateAsync({
      lawyer_profile_id: parseInt(lawyerId),
      scheduled_at: selectedSlot.datetime,
      duration: duration,
      notes: notes,
    })

    if (result.consultation) {
      setStep(3)
    }
  }

  if (lawyerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Select Time' },
    { number: 2, title: 'Payment' },
    { number: 3, title: 'Confirmation' },
  ]

  return (
    <div className="portal-shell min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link
          to={`/lawyer/${lawyerId}`}
          className="inline-flex items-center gap-3 text-sm font-semibold tracking-wider uppercase text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <div className="portal-card-elevated p-8 md:p-12 relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[color:var(--portal-gold)] via-[#f2d8a0] to-[color:var(--portal-gold)]"></div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg font-bold transition-all duration-500 ${step >= s.number
                    ? 'bg-[linear-gradient(150deg,#13213d,#2a3f67)] dark:bg-[linear-gradient(150deg,#d9ba79,#c99e4f)] text-[color:var(--portal-gold)] dark:text-[#15243b] shadow-md border-2 border-[color:var(--portal-gold)]'
                    : 'bg-white/70 dark:bg-black/35 border-2 border-[color:var(--portal-border)] text-[color:var(--portal-muted)]'
                    }`}
                >
                  {step > s.number ? <CheckCircle2 className="w-6 h-6" /> : s.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 md:w-24 h-0.5 mx-2 transition-all duration-500 ${step > s.number ? 'bg-[#D4AF37]' : 'bg-gray-200 dark:bg-dark-600'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Lawyer Info */}
          <div className="flex items-center gap-6 p-6 bg-white/50 dark:bg-black/20 border border-[color:var(--portal-border)] rounded-2xl mb-10 shadow-sm">
            <div className="w-20 h-20 rounded-xl bg-[linear-gradient(150deg,#13203b,#2a4069)] border border-[color:var(--portal-border-strong)] flex items-center justify-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="font-serif text-3xl font-bold text-[color:var(--portal-gold)]">
                {lawyer?.user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-serif font-bold text-2xl text-[color:var(--portal-text)] mb-1">{lawyer?.user?.name}</h2>
              <p className="text-sm tracking-wide font-semibold text-[color:var(--portal-muted)] uppercase">
                {lawyer?.specializations?.[0]?.name} <span className="text-[color:var(--portal-gold)] mx-2">•</span> {lawyer?.years_of_experience} years exp.
              </p>
              {!isBookingOpen && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Unavailable for new consultations
                </div>
              )}
            </div>
          </div>

          {!isBookingOpen && (
            <div className="mb-10 rounded-sm border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-5 text-amber-900 dark:text-amber-100 shadow-sm">
              <p className="font-bold uppercase tracking-widest text-xs mb-1">Booking paused</p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This lawyer is not accepting new consultation requests right now. The secure appointment flow is blocked until they turn availability back on.
              </p>
            </div>
          )}

          {/* Step 1: Select Date & Time */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h3 className="font-serif text-2xl font-bold text-[color:var(--portal-text)] border-b border-[color:var(--portal-border)] pb-4">
                Schedule Appointment
              </h3>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-4">
                  <Calendar className="inline w-4 h-4 mr-2 text-[color:var(--portal-gold)]" />
                  Available Time Slots
                </label>

                {!isBookingOpen ? (
                  <div className="rounded-sm border border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-8 text-center">
                    <p className="font-serif text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">Booking currently unavailable</p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      The lawyer has switched off new consultation requests.
                    </p>
                  </div>
                ) : availabilityLoading ? (
                  <div className="py-12"><Loader /></div>
                ) : (
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {availability?.map((day) => (
                      <div key={day.date} className="portal-card p-5">
                        <p className="font-serif text-lg font-bold mb-4 text-[color:var(--portal-text)]">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {day.slots.map((slot) => (
                            <button
                              key={slot.time}
                              disabled={!slot.available}
                              onClick={() => slot.available && setSelectedSlot(slot)}
                              className={`py-3 px-2 rounded-sm text-sm font-semibold transition-all border ${!slot.available
                                ? 'bg-gray-50 dark:bg-dark-900 border-gray-100 dark:border-dark-700 text-gray-400 cursor-not-allowed opacity-60'
                                : selectedSlot?.datetime === slot.datetime
                                  ? 'bg-[linear-gradient(145deg,#13213e,#2b4169)] dark:bg-[linear-gradient(145deg,#d9ba79,#c79a4b)] text-white dark:text-[#17253e] border-[color:var(--portal-gold)] shadow-md'
                                  : 'bg-white/70 dark:bg-black/30 border-[color:var(--portal-border)] hover:border-[color:var(--portal-gold)] text-[color:var(--portal-muted)]'
                                }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-3">
                  Additional Notes <span className="text-[color:var(--portal-muted)] font-normal normal-case">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="portal-input resize-none px-5 py-4"
                  placeholder="Briefly describe your legal issue to help the lawyer prepare..."
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => selectedSlot && setStep(2)}
                  disabled={!selectedSlot || !isBookingOpen}
                  className="portal-btn-primary w-full py-4 font-bold tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  Continue to Payment
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h3 className="font-serif text-2xl font-bold text-[color:var(--portal-text)] border-b border-[color:var(--portal-border)] pb-4">
                Secure Payment
              </h3>

              {/* Summary */}
              <div className="portal-card-elevated p-6 text-[color:var(--portal-text)] rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-[color:var(--portal-muted)] font-semibold tracking-wide">Consultation ({duration} min)</span>
                  <span className="text-lg font-serif">{formatPrice(duration === 60 ? (Number(lawyer?.consultation_fee_60) || Number(lawyer?.consultation_fee) * 1.5 || 0) : duration === 90 ? (Number(lawyer?.consultation_fee_90) || Number(lawyer?.consultation_fee) * 2 || 0) : (Number(lawyer?.consultation_fee) || 0))}</span>
                </div>
                <div className="border-t border-[color:var(--portal-border)] pt-4 flex justify-between items-center relative z-10">
                  <span className="uppercase tracking-widest text-sm font-bold text-[color:var(--portal-muted)]">Total Amount</span>
                  <span className="text-3xl font-serif font-bold text-[color:var(--portal-gold)]">{formatPrice(consultationFee)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-4">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                    { id: 'upi', label: 'UPI Payment', icon: CheckCircle2 },
                    { id: 'netbanking', label: 'Net Banking', icon: CheckCircle2 },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-sm border-2 transition-all ${paymentMethod === method.id
                        ? 'border-[color:var(--portal-gold)] bg-white/70 dark:bg-black/30 shadow-md'
                        : 'border-[color:var(--portal-border)] bg-white/45 dark:bg-black/20 hover:border-[color:var(--portal-border-strong)]'
                        }`}
                    >
                      <method.icon className={`w-8 h-8 ${paymentMethod === method.id ? 'text-[color:var(--portal-gold)]' : 'text-[color:var(--portal-muted)]'}`} />
                      <span className={`font-bold text-sm ${paymentMethod === method.id ? 'text-[color:var(--portal-text)]' : 'text-[color:var(--portal-muted)]'}`}>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="portal-btn-ghost sm:w-1/3 py-4 font-bold tracking-widest uppercase text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={createConsultation.isPending || !isBookingOpen}
                  className="portal-btn-primary sm:w-2/3 py-4 font-bold tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {!isBookingOpen ? (
                    'Booking unavailable'
                  ) : createConsultation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing securely...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay {formatPrice(consultationFee)}
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs tracking-wider uppercase text-[color:var(--portal-muted)] font-semibold flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Secure Demo Payment Gateway
              </p>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 px-4"
            >
              <div className="w-24 h-24 rounded-xl bg-[linear-gradient(150deg,#13213b,#2a3f67)] border-2 border-[color:var(--portal-gold)] flex items-center justify-center mx-auto mb-8 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5"></div>
                <CheckCircle2 className="w-12 h-12 text-[color:var(--portal-gold)]" />
              </div>

              <h3 className="font-serif text-3xl font-bold text-[color:var(--portal-text)] mb-3">Session Confirmed</h3>
              <p className="text-[color:var(--portal-muted)] font-semibold tracking-wide text-sm mb-10 max-w-md mx-auto">
                Your consultation has been securely scheduled. An email confirmation has been sent to your registered address.
              </p>

              <div className="portal-card max-w-md mx-auto p-8 mb-10 text-left">
                <h4 className="font-serif font-bold text-lg border-b border-[color:var(--portal-border)] pb-3 mb-4 text-[color:var(--portal-text)]">Booking Details</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[color:var(--portal-muted)] text-sm font-semibold tracking-wide uppercase">Lawyer</span>
                    <span className="font-bold text-[color:var(--portal-text)]">{lawyer?.user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[color:var(--portal-muted)] text-sm font-semibold tracking-wide uppercase">Date & Time</span>
                    <span className="font-bold text-[color:var(--portal-text)] text-right">{formatDateTime(selectedSlot?.datetime)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[color:var(--portal-muted)] text-sm font-semibold tracking-wide uppercase">Duration</span>
                    <span className="font-bold text-[color:var(--portal-text)]">{duration} min Session</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-[color:var(--portal-border)]">
                    <span className="text-[color:var(--portal-muted)] text-sm font-semibold tracking-wide uppercase">Amount Paid</span>
                    <span className="font-serif font-bold text-xl text-[color:var(--portal-gold)]">{formatPrice(consultationFee)}</span>
                  </div>
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <Link to="/client/consultations" className="portal-btn-primary block w-full py-4 font-bold tracking-widest uppercase text-sm text-center">
                  Access Secure Sessions
                </Link>
                <Link to="/" className="portal-btn-ghost block w-full py-4 font-bold tracking-widest uppercase text-sm text-center">
                  Return to Home
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookConsultation
