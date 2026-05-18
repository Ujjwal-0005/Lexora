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
  Loader2
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

  const consultationFee = duration === 60
    ? (Number(lawyer?.consultation_fee_60) || Number(lawyer?.consultation_fee) * 1.5 || 0)
    : duration === 90
      ? (Number(lawyer?.consultation_fee_90) || Number(lawyer?.consultation_fee) * 2 || 0)
      : (Number(lawyer?.consultation_fee) || 0)

  const handleBooking = async () => {
    if (!selectedSlot) return

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
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link
          to={`/lawyer/${lawyerId}`}
          className="inline-flex items-center gap-3 text-sm font-semibold tracking-wider uppercase text-gray-500 hover:text-[#0f172a] dark:hover:text-[#D4AF37] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-sm shadow-xl p-8 md:p-12 relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#fcd34d] to-[#D4AF37]"></div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg font-bold transition-all duration-500 ${step >= s.number
                    ? 'bg-[#0f172a] dark:bg-white text-[#D4AF37] dark:text-[#0f172a] shadow-md border-2 border-[#D4AF37]'
                    : 'bg-white dark:bg-dark-900 border-2 border-gray-200 dark:border-dark-600 text-gray-400'
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
          <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 rounded-sm mb-10 shadow-sm">
            <div className="w-20 h-20 rounded-sm bg-[#0f172a] border border-[#D4AF37]/30 flex items-center justify-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="font-serif text-3xl font-bold text-[#D4AF37]">
                {lawyer?.user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#0f172a] dark:text-white mb-1">{lawyer?.user?.name}</h2>
              <p className="text-sm tracking-wide font-semibold text-gray-500 dark:text-gray-400 uppercase">
                {lawyer?.specializations?.[0]?.name} <span className="text-[#D4AF37] mx-2">•</span> {lawyer?.years_of_experience} years exp.
              </p>
            </div>
          </div>

          {/* Step 1: Select Date & Time */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h3 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white border-b border-gray-200 dark:border-dark-700 pb-4">
                Schedule Appointment
              </h3>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-4">
                  <Calendar className="inline w-4 h-4 mr-2 text-[#D4AF37]" />
                  Available Time Slots
                </label>

                {availabilityLoading ? (
                  <div className="py-12"><Loader /></div>
                ) : (
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {availability?.map((day) => (
                      <div key={day.date} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-sm p-5 shadow-sm">
                        <p className="font-serif text-lg font-bold mb-4 text-[#0f172a] dark:text-[#D4AF37]">
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
                                  ? 'bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] border-[#0f172a] dark:border-white shadow-md'
                                  : 'bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-500 hover:border-[#0f172a] dark:hover:border-white text-gray-700 dark:text-gray-300'
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
                <label className="block text-sm font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-3">
                  Additional Notes <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 text-[#0f172a] dark:text-white px-5 py-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all resize-none shadow-inner"
                  placeholder="Briefly describe your legal issue to help the lawyer prepare..."
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => selectedSlot && setStep(2)}
                  disabled={!selectedSlot}
                  className="w-full py-4 bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] font-bold tracking-widest uppercase text-sm rounded-sm hover:bg-black dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
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
              <h3 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white border-b border-gray-200 dark:border-dark-700 pb-4">
                Secure Payment
              </h3>

              {/* Summary */}
              <div className="p-6 bg-[#0f172a] text-white rounded-sm shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-gray-300 font-semibold tracking-wide">Consultation ({duration} min)</span>
                  <span className="text-lg font-serif">{formatPrice(duration === 60 ? (Number(lawyer?.consultation_fee_60) || Number(lawyer?.consultation_fee) * 1.5 || 0) : duration === 90 ? (Number(lawyer?.consultation_fee_90) || Number(lawyer?.consultation_fee) * 2 || 0) : (Number(lawyer?.consultation_fee) || 0))}</span>
                </div>
                <div className="border-t border-[#1e293b] pt-4 flex justify-between items-center relative z-10">
                  <span className="uppercase tracking-widest text-sm font-bold text-gray-400">Total Amount</span>
                  <span className="text-3xl font-serif font-bold text-[#D4AF37]">{formatPrice(consultationFee)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-4">
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
                        ? 'border-[#0f172a] dark:border-[#D4AF37] bg-slate-50 dark:bg-dark-900 shadow-md'
                        : 'border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:border-gray-300'
                        }`}
                    >
                      <method.icon className={`w-8 h-8 ${paymentMethod === method.id ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                      <span className={`font-bold text-sm ${paymentMethod === method.id ? 'text-[#0f172a] dark:text-white' : 'text-gray-500'}`}>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="sm:w-1/3 py-4 border-2 border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 font-bold tracking-widest uppercase text-sm rounded-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={createConsultation.isPending}
                  className="sm:w-2/3 py-4 bg-[#D4AF37] text-[#0f172a] font-bold tracking-widest uppercase text-sm rounded-sm hover:bg-[#b8941d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                >
                  {createConsultation.isPending ? (
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

              <p className="text-center text-xs tracking-wider uppercase text-gray-400 font-semibold flex items-center justify-center gap-2">
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
              <div className="w-24 h-24 rounded-sm bg-[#0f172a] border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-8 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5"></div>
                <CheckCircle2 className="w-12 h-12 text-[#D4AF37]" />
              </div>

              <h3 className="font-serif text-3xl font-bold text-[#0f172a] dark:text-white mb-3">Session Confirmed</h3>
              <p className="text-gray-500 dark:text-gray-400 font-semibold tracking-wide text-sm mb-10 max-w-md mx-auto">
                Your consultation has been securely scheduled. An email confirmation has been sent to your registered address.
              </p>

              <div className="max-w-md mx-auto bg-slate-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-sm p-8 mb-10 shadow-sm text-left">
                <h4 className="font-serif font-bold text-lg border-b border-gray-200 dark:border-dark-700 pb-3 mb-4 text-[#0f172a] dark:text-white">Booking Details</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold tracking-wide uppercase">Lawyer</span>
                    <span className="font-bold text-[#0f172a] dark:text-white">{lawyer?.user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold tracking-wide uppercase">Date & Time</span>
                    <span className="font-bold text-[#0f172a] dark:text-white text-right">{formatDateTime(selectedSlot?.datetime)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold tracking-wide uppercase">Duration</span>
                    <span className="font-bold text-[#0f172a] dark:text-white">{duration} min Session</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-dark-700">
                    <span className="text-gray-500 text-sm font-semibold tracking-wide uppercase">Amount Paid</span>
                    <span className="font-serif font-bold text-xl text-[#D4AF37]">{formatPrice(consultationFee)}</span>
                  </div>
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <Link to="/client/consultations" className="block w-full py-4 bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] font-bold tracking-widest uppercase text-sm rounded-sm hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-lg">
                  Access Secure Sessions
                </Link>
                <Link to="/" className="block w-full py-4 border-2 border-gray-200 dark:border-dark-700 text-gray-600 dark:text-gray-300 font-bold tracking-widest uppercase text-sm rounded-sm hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
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
