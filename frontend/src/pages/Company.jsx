import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowRight,
    Briefcase,
    Building2,
    CalendarDays,
    FileText,
    Landmark,
    Megaphone,
    ShieldCheck,
    Sparkles,
    Users
} from 'lucide-react'

const Company = () => {
    const stats = [
        { value: '10K+', label: 'Clients served' },
        { value: '500+', label: 'Verified lawyers' },
        { value: '98%', label: 'Client satisfaction' },
        { value: '24/7', label: 'Support availability' },
    ]

    const values = [
        {
            icon: ShieldCheck,
            title: 'Trust first',
            description: 'We build every product decision around confidentiality, compliance, and user trust.',
        },
        {
            icon: Sparkles,
            title: 'Premium experience',
            description: 'Our platform is designed to feel polished, fast, and reliable across every touchpoint.',
        },
        {
            icon: Users,
            title: 'Human support',
            description: 'Behind the product is a team that helps clients move through complex legal work with clarity.',
        },
    ]

    const careers = [
        {
            title: 'Product Designer',
            type: 'Remote / Full-time',
            description: 'Shape the client and lawyer experience across dashboards, booking, and document flows.',
        },
        {
            title: 'Frontend Engineer',
            type: 'Hybrid / Full-time',
            description: 'Build responsive, accessible interfaces for our legal services platform.',
        },
        {
            title: 'Customer Success Associate',
            type: 'On-site / Full-time',
            description: 'Guide users through onboarding, consultations, and platform support.',
        },
    ]

    const pressItems = [
        {
            outlet: 'Legal Tech Review',
            title: 'How Lexora Law is simplifying premium legal access',
            date: 'May 2026',
        },
        {
            outlet: 'Business Ledger',
            title: 'A closer look at the company behind the digital legal experience',
            date: 'April 2026',
        },
        {
            outlet: 'Startup Weekly',
            title: ' Lexora expands its legal marketplace with new service layers',
            date: 'March 2026',
        },
    ]

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#050816] text-[#0f172a] dark:text-white transition-colors duration-300">
            <section className="relative overflow-hidden border-b border-gray-200 dark:border-[#22314d]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#10192b] to-[#050816]" />
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,rgba(161,128,74,0.35),transparent_36%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_22%)]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/10 text-[#d7b77a] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
                            <Landmark className="w-4 h-4" /> Company
                        </span>
                        <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                            About Lexora, our careers, and what the press is saying.
                        </h1>
                        <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl">
                            Lexora combines premium legal access with a modern digital experience. This page brings together who we are, how we hire, and the latest media coverage in one place.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <Link to="#about" className="inline-flex items-center gap-2 px-5 py-3 rounded-sm bg-[#a1804a] text-white text-sm font-semibold hover:bg-[#8f703d] transition-colors">
                                About Us
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="#careers" className="inline-flex items-center gap-2 px-5 py-3 rounded-sm border border-white/15 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                                View Careers
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-14 md:py-16 border-b border-gray-200 dark:border-[#22314d] bg-white dark:bg-[#070b14]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-sm border border-gray-200 dark:border-[#22314d] bg-[#f8f9fa] dark:bg-[#0b1220] p-6 text-center">
                            <div className="font-serif text-3xl md:text-4xl font-bold text-[#a1804a] mb-2">{stat.value}</div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="about" className="py-24 md:py-28 bg-[#f8f9fa] dark:bg-[#050816]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="text-[0.65rem] font-bold text-[#a1804a] tracking-[0.3em] uppercase mb-4 block">About Us</span>
                        <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0f172a] dark:text-white mb-6 leading-tight">
                            We are building a more accessible legal experience.
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                            Our mission is to make it easier for individuals and businesses to find the right legal support quickly, securely, and with confidence. We connect clients to verified professionals, simplify consultations, and streamline document workflows.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            Everything we build is guided by privacy, clarity, and a premium service standard.
                        </p>
                    </motion.div>

                    <div className="grid gap-5">
                        {values.map((value, index) => {
                            const Icon = value.icon
                            return (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, delay: index * 0.1 }}
                                    className="rounded-sm border border-gray-200 dark:border-[#22314d] bg-white dark:bg-gradient-to-b dark:from-[#10192b] dark:to-[#0b1220] p-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-sm bg-[#a1804a]/10 border border-[#a1804a]/20 flex items-center justify-center shrink-0">
                                            <Icon className="w-5 h-5 text-[#a1804a]" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white mb-2">{value.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <section id="careers" className="py-24 md:py-28 bg-white dark:bg-[#070b14] border-y border-gray-200 dark:border-[#22314d]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="max-w-3xl mb-10"
                    >
                        <span className="text-[0.65rem] font-bold text-[#a1804a] tracking-[0.3em] uppercase mb-4 block">Careers</span>
                        <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0f172a] dark:text-white mb-5">
                            Join a team that cares about product quality and client trust.
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            We hire people who care about thoughtful execution, strong systems, and service that feels genuinely premium.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {careers.map((role, index) => (
                            <motion.article
                                key={role.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: index * 0.12 }}
                                className="rounded-sm border border-gray-200 dark:border-[#22314d] bg-[#f8f9fa] dark:bg-gradient-to-b dark:from-[#10192b] dark:to-[#0b1220] p-7"
                            >
                                <Briefcase className="w-6 h-6 text-[#a1804a] mb-5" />
                                <h3 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white mb-2">{role.title}</h3>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a1804a] mb-4">{role.type}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{role.description}</p>
                                <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f172a] dark:text-white hover:text-[#a1804a] transition-colors">
                                    Apply soon
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="press" className="py-24 md:py-28 bg-[#f8f9fa] dark:bg-[#050816]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="max-w-3xl mb-10"
                    >
                        <span className="text-[0.65rem] font-bold text-[#a1804a] tracking-[0.3em] uppercase mb-4 block">Press & Media</span>
                        <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0f172a] dark:text-white mb-5">
                            Latest coverage and public updates.
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            If you are a journalist or media partner, this is the place to find the latest public mentions and company story.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {pressItems.map((item, index) => (
                            <motion.article
                                key={item.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: index * 0.12 }}
                                className="rounded-sm border border-gray-200 dark:border-[#22314d] bg-white dark:bg-gradient-to-b dark:from-[#10192b] dark:to-[#0b1220] p-7"
                            >
                                <div className="w-12 h-12 rounded-sm bg-[#a1804a]/10 border border-[#a1804a]/20 flex items-center justify-center mb-5">
                                    <Megaphone className="w-5 h-5 text-[#a1804a]" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a1804a] mb-3">{item.outlet}</p>
                                <h3 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white mb-3 leading-snug">{item.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-[#0f172a] border-t border-[#a1804a]/20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                            Want to talk to our team?
                        </h2>
                        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                            Whether you are exploring careers, press opportunities, or company information, we are here to help.
                        </p>
                        <Link to="/help" className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-[#a1804a] text-white text-sm font-semibold hover:bg-[#8f703d] transition-colors">
                            Contact Support
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default Company
