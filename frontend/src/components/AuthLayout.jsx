import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Sparkles } from 'lucide-react'
import { useFilterStore } from '../store/filterStore'

const AuthLayout = ({ children }) => {
    const { darkMode } = useFilterStore()
    const heroPanelStyle = darkMode
        ? {
            background: 'linear-gradient(155deg, #10263c 0%, #1a3f5e 42%, #164b57 100%)',
        }
        : {
            background: 'linear-gradient(150deg, #154b79 0%, #2b7da8 46%, #3ca89b 100%)',
        }

    return (
        <div
            className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden font-sans transition-colors duration-300"
            style={
                darkMode
                    ? {
                        background: 'linear-gradient(135deg, #0b1220 0%, #111827 45%, #030712 100%)',
                    }
                    : {
                        background: 'linear-gradient(135deg, #f7f4ee 0%, #ede3d2 45%, #fffaf5 100%)',
                    }
            }
        >
            <div
                className="absolute inset-0 pointer-events-none transition-colors duration-300"
                style={
                    darkMode
                        ? {
                            backgroundImage:
                                'radial-gradient(circle at 20% 20%, rgba(161, 128, 74, 0.10) 0%, transparent 35%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 30%)',
                        }
                        : {
                            backgroundImage:
                                'radial-gradient(circle at 20% 20%, rgba(161, 128, 74, 0.16) 0%, transparent 35%), radial-gradient(circle at 80% 80%, rgba(11, 18, 32, 0.06) 0%, transparent 30%)',
                        }
                }
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[950px] flex flex-col md:flex-row bg-white dark:bg-dark-800 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-none relative z-10 overflow-hidden min-h-[520px] border border-transparent dark:border-dark-600/60"
            >
                <div className="hidden md:flex md:w-[45%] relative overflow-hidden flex-col justify-between p-12 lg:p-14" style={heroPanelStyle}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,214,129,0.35),transparent_30%),radial-gradient(circle_at_86%_22%,rgba(130,235,255,0.34),transparent_32%),radial-gradient(circle_at_74%_84%,rgba(255,255,255,0.16),transparent_38%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(8,36,64,0.24)_0%,rgba(17,68,92,0.40)_52%,rgba(13,63,72,0.52)_100%)] pointer-events-none" />
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#ffd781]/35 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-24 w-80 h-80 rounded-full bg-[#7fe5ff]/30 blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.10] pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:34px_34px]" />

                    <div className="relative z-10 mt-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-white/30 bg-white/20 flex items-center justify-center text-white shadow-[0_0_35px_rgba(255,214,129,0.35)]">
                            <Sparkles size={18} strokeWidth={2} />
                        </div>
                        <h1 className="text-[0.72rem] font-bold tracking-[0.24em] text-white/90 uppercase">
                            Royal Secure Access
                        </h1>
                    </div>

                    <div className="relative z-10 max-w-[300px]">
                        <h2 className="font-display text-4xl lg:text-[2.35rem] font-bold text-white mb-4 tracking-tight leading-tight">
                            Welcome back.
                        </h2>
                        <p className="text-white/85 text-[0.95rem] leading-relaxed max-w-[280px]">
                            Secure verification and account recovery in seconds.
                        </p>
                    </div>

                    <div className="relative z-10 rounded-2xl border border-white/30 bg-white/15 backdrop-blur-md px-5 py-5 shadow-[0_18px_34px_rgba(0,0,0,0.16)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/35 flex items-center justify-center text-white shrink-0">
                                <Shield size={18} strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Protected verification</p>
                                <p className="text-white/80 text-xs mt-1">OTP and password reset are encrypted end-to-end.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-[55%] flex flex-col justify-center items-center p-8 lg:p-12 xl:p-16 bg-[#fbfcfd] dark:bg-dark-800">
                    <div className="w-full max-w-[420px]">{children}</div>
                </div>
            </motion.div>
        </div>
    )
}

export default AuthLayout
