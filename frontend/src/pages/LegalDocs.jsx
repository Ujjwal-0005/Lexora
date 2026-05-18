import { useNavigate } from 'react-router-dom'
import { X, Shield, Scale, FileText, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

const LegalDocs = () => {
    const navigate = useNavigate()

    const sections = [
        {
            icon: Shield,
            title: 'Privacy Policy',
            content: 'Lexora Law (“we”, “us”, or “our”) values your privacy. This Privacy Policy describes how we collect, use, disclose, and protect personal information when you use our platform and services. We collect information you provide directly (registration, consultations, documents), information from your interactions (usage metadata, logs), and information from third-party services when you choose to connect them. We use data to provide and improve services, deliver communications, manage consultations, and comply with legal obligations. We retain personal information only as long as necessary and implement administrative, technical, and physical safeguards to protect your data. Where required, you may request access, correction, or deletion of your personal data. For more details on data transfers, legal bases, and cookie usage, please contact our Data Privacy Officer at lexora.no.reply@gmail.com or see the full policy linked below.'
        },
        {
            icon: Scale,
            title: 'Terms of Service',
            content: 'These Terms govern your use of the Lexora platform. By accessing or using our services you agree to be bound by these terms. You must be of legal age to form a binding contract in your jurisdiction. Users are responsible for providing accurate information and for maintaining the confidentiality of account credentials. The platform provides legal matching, consultation scheduling, and document services; it does not substitute for direct legal advice unless explicitly provided through a retained lawyer-client relationship. Fees, payment terms, cancellation policies, dispute resolution, and limitation of liability are described in full in the Terms document. We reserve the right to suspend or terminate accounts for abuse, fraud, or violation of these Terms.'
        },
        {
            icon: FileText,
            title: 'Regulatory Disclosure',
            content: 'Lexora operates in accordance with applicable professional and regulatory obligations. Our platform connects clients with independent legal professionals who remain responsible for the legal services they deliver. We do not practice law as a firm on behalf of clients unless an express written engagement is entered into. Lawyers advertising on our platform hold the credentials and licenses they represent; however, clients should verify credentials and jurisdictional authority for matters of legal practice. Where required by local rules, lawyer profiles display licensing details and regulatory disclosures. If you believe a listing is inaccurate, contact lexora.no.reply@gmail.com.'
        },
        {
            icon: Lock,
            title: 'Trust Badge & Security Information',
            content: 'Lexora maintains industry-standard security controls including HTTPS/TLS for network traffic, encrypted storage for sensitive fields, role-based access controls, and regular security assessments. Our trust badge represents these controls and our commitment to secure legal communications. Badges reflect verification steps completed by lawyers (identity & license verification) and platform security reviews. Badges do not guarantee outcomes but provide an extra layer of assurance regarding identity and process. For questions on our security posture or to request evidence supporting a badge, contact lexora.no.reply@gmail.com.'
        }
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0f172a]/80 dark:bg-black/80 backdrop-blur-sm"
                onClick={() => navigate(-1)}
            />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-4xl mx-4 bg-white dark:bg-[#0f172a] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800 rounded-sm"
            >
                <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#151f32]">
                    <div>
                        <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Protocol Documentation</span>
                        <h2 className="text-3xl font-serif font-bold text-[#0f172a] dark:text-white">Legal & Policy Center</h2>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 hover:border-[#a1804a] dark:hover:border-[#a1804a] text-gray-500 hover:text-[#a1804a] transition-all rounded-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-10 scrollbar-hide">
                    {sections.map((section, idx) => {
                        const Icon = section.icon
                        return (
                            <section key={idx} className="relative pl-14">
                                <div className="absolute left-0 top-0.5 p-2.5 bg-[#0f172a]/5 dark:bg-white/5 text-[#0f172a] dark:text-gray-300 rounded-sm">
                                    <Icon size={18} />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-[#0f172a] dark:text-white mb-3">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                                    {section.content}
                                </p>
                            </section>
                        )
                    })}

                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-xs text-gray-500 dark:text-gray-500 font-medium tracking-wide">
                            Last updated: <span className="font-bold text-gray-700 dark:text-gray-300">May 15, 2026</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 sm:text-right max-w-sm leading-relaxed">
                            For full, legally binding policy text and jurisdictional clauses, please contact our legal team at <br /> <a href="mailto:lexora.no.reply@gmail.com" className="text-[#a1804a] hover:underline font-bold">lexora.no.reply@gmail.com</a>.
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default LegalDocs
