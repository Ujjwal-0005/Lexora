import React from 'react'

const StyledInput = ({ label, type = 'text', placeholder, value, onChange, required, minLength, min, rightElement }) => (
    <div className="mb-6">
        <label className="block text-[0.65rem] font-bold text-gray-500 tracking-widest uppercase mb-1">
            {label}
        </label>
        <div className="relative">
            <input
                type={type}
                required={required}
                minLength={minLength}
                min={min}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-transparent border-0 border-b border-gray-300 dark:border-dark-600 px-0 py-2 text-sm text-[#111827] dark:text-white focus:ring-0 focus:border-[#a1804a] transition-colors placeholder-gray-300 dark:placeholder-gray-500 outline-none ${type === 'date' ? 'dark-date-picker' : ''}`}
                style={{ boxShadow: 'none' }}
            />
            {rightElement && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                    {rightElement}
                </div>
            )}
        </div>
    </div>
)

export default StyledInput
