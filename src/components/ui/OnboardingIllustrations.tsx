

export const Slide1Illustration = () => (
    <div className="illustration-svg slide-1-svg">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>

        {/* Logo Ufficiale Polizia Locale */}
        <img
            src="/logo-pl.png"
            alt="Quiz Polizia Locale Logo"
            className="logo-pl"
        />
    </div>
);

export const Slide2Illustration = () => (
    <div className="illustration-svg slide-2-svg">
        <div className="bg-circle stress-circle-1"></div>
        <div className="bg-circle stress-circle-2"></div>

        <svg className="floating-books" viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
            <g className="book book-1" transform="rotate(-15, 50, 80)">
                <rect x="30" y="60" width="40" height="50" rx="3" fill="#1E5631" />
                <rect x="33" y="63" width="34" height="44" rx="2" fill="#E8F5E9" />
                <line x1="40" y1="70" x2="60" y2="70" stroke="#1E5631" strokeWidth="2" />
                <line x1="40" y1="78" x2="55" y2="78" stroke="#1E5631" strokeWidth="2" />
                <line x1="40" y1="86" x2="58" y2="86" stroke="#1E5631" strokeWidth="2" />
            </g>

            <g className="book book-2" transform="rotate(10, 240, 50)">
                <rect x="220" y="30" width="45" height="55" rx="3" fill="#C9A227" />
                <rect x="223" y="33" width="39" height="49" rx="2" fill="#FFF8E1" />
                <line x1="230" y1="42" x2="255" y2="42" stroke="#C9A227" strokeWidth="2" />
                <line x1="230" y1="52" x2="250" y2="52" stroke="#C9A227" strokeWidth="2" />
            </g>

            <g className="book book-3">
                <rect x="130" y="180" width="50" height="60" rx="3" fill="#5B8A9A" />
                <rect x="133" y="183" width="44" height="54" rx="2" fill="#E0F7FA" />
                <line x1="140" y1="195" x2="170" y2="195" stroke="#5B8A9A" strokeWidth="2" />
                <line x1="140" y1="205" x2="165" y2="205" stroke="#5B8A9A" strokeWidth="2" />
                <line x1="140" y1="215" x2="168" y2="215" stroke="#5B8A9A" strokeWidth="2" />
            </g>

            <text className="question-mark q1" x="80" y="45" fontSize="32" fill="#DC2626" fontWeight="bold">?</text>
            <text className="question-mark q2" x="200" y="120" fontSize="28" fill="#DC2626" fontWeight="bold">?</text>
            <text className="question-mark q3" x="260" y="180" fontSize="24" fill="#DC2626" fontWeight="bold">?</text>

            <g className="person" transform="translate(110, 70)">
                <circle cx="40" cy="30" r="25" fill="#FFDAB9" />
                <path d="M20,25 Q15,10 40,8 Q65,10 60,25" fill="#4A3728" />
                <circle cx="32" cy="32" r="4" fill="#2D3436" />
                <circle cx="48" cy="32" r="4" fill="#2D3436" />
                <line x1="26" y1="24" x2="36" y2="27" stroke="#4A3728" strokeWidth="2" />
                <line x1="54" y1="24" x2="44" y2="27" stroke="#4A3728" strokeWidth="2" />
                <path d="M32,45 Q40,42 48,45" stroke="#2D3436" strokeWidth="2" fill="none" />
                <rect x="20" y="55" width="40" height="50" rx="5" fill="#6B7280" />
                <ellipse cx="10" cy="20" rx="8" ry="12" fill="#FFDAB9" />
                <ellipse cx="70" cy="20" rx="8" ry="12" fill="#FFDAB9" />
            </g>

            <g className="paper paper-1" transform="rotate(-20, 40, 150)">
                <rect x="20" y="130" width="30" height="40" rx="2" fill="white" stroke="#E5E7EB" />
                <line x1="25" y1="140" x2="45" y2="140" stroke="#D1D5DB" strokeWidth="2" />
                <line x1="25" y1="148" x2="42" y2="148" stroke="#D1D5DB" strokeWidth="2" />
                <line x1="25" y1="156" x2="40" y2="156" stroke="#D1D5DB" strokeWidth="2" />
            </g>

            <g className="paper paper-2" transform="rotate(15, 270, 100)">
                <rect x="250" y="80" width="35" height="45" rx="2" fill="white" stroke="#E5E7EB" />
                <line x1="255" y1="92" x2="280" y2="92" stroke="#D1D5DB" strokeWidth="2" />
                <line x1="255" y1="102" x2="275" y2="102" stroke="#D1D5DB" strokeWidth="2" />
                <line x1="255" y1="112" x2="278" y2="112" stroke="#D1D5DB" strokeWidth="2" />
            </g>
        </svg>
    </div>
);

export const Slide3Illustration = () => (
    <div className="illustration-svg slide-3-svg">
        <div className="bg-circle solution-circle-1"></div>
        <div className="bg-circle solution-circle-2"></div>

        <svg className="phone-mockup" viewBox="0 0 300 320" xmlns="http://www.w3.org/2000/svg">
            <g className="floating-icon star-icon">
                <polygon points="40,50 44,62 57,62 47,70 51,83 40,74 29,83 33,70 23,62 36,62" fill="#C9A227" />
            </g>

            <g className="floating-icon chart-icon" transform="translate(230, 30)">
                <rect x="0" y="30" width="10" height="20" rx="2" fill="#A4C3A2" />
                <rect x="15" y="20" width="10" height="30" rx="2" fill="#1E5631" />
                <rect x="30" y="5" width="10" height="45" rx="2" fill="#0D2818" />
                <path d="M5,25 L20,15 L35,0" stroke="#C9A227" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="35" cy="0" r="5" fill="#C9A227" />
            </g>

            <g className="floating-icon book-icon" transform="translate(20, 200)">
                <rect x="0" y="0" width="45" height="55" rx="4" fill="#1E5631" />
                <rect x="5" y="5" width="35" height="45" rx="2" fill="#E8F5E9" />
                <line x1="12" y1="15" x2="33" y2="15" stroke="#1E5631" strokeWidth="2" />
                <line x1="12" y1="25" x2="30" y2="25" stroke="#1E5631" strokeWidth="2" />
                <line x1="12" y1="35" x2="28" y2="35" stroke="#1E5631" strokeWidth="2" />
            </g>

            <g className="floating-icon clock-icon" transform="translate(240, 220)">
                <circle cx="25" cy="25" r="25" fill="#E8F5E9" stroke="#1E5631" strokeWidth="3" />
                <line x1="25" y1="25" x2="25" y2="12" stroke="#0D2818" strokeWidth="3" strokeLinecap="round" />
                <line x1="25" y1="25" x2="35" y2="25" stroke="#0D2818" strokeWidth="3" strokeLinecap="round" />
                <circle cx="25" cy="25" r="3" fill="#C9A227" />
            </g>

            <circle className="sparkle s1" cx="70" cy="100" r="4" fill="#C9A227" />
            <circle className="sparkle s2" cx="235" cy="150" r="3" fill="#C9A227" />
            <circle className="sparkle s3" cx="55" cy="270" r="5" fill="#C9A227" />
            <circle className="sparkle s4" cx="260" cy="280" r="4" fill="#C9A227" />

            <g className="phone" transform="translate(85, 40)">
                <rect x="0" y="0" width="130" height="240" rx="20" fill="#0D2818" />
                <rect x="8" y="8" width="114" height="224" rx="14" fill="#FAFBF9" />
                <rect x="45" y="14" width="40" height="12" rx="6" fill="#0D2818" />

                <rect x="15" y="35" width="100" height="25" rx="8" fill="#1E5631" />
                <text x="65" y="52" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">QUIZ P.L.</text>

                <rect x="15" y="70" width="100" height="50" rx="10" fill="white" stroke="#E5E7EB" />
                <circle cx="35" cy="95" r="12" fill="#E8F5E9" />
                <path d="M30,95 L34,100 L42,88" stroke="#22C55E" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="52" y="85" width="55" height="6" rx="3" fill="#E5E7EB" />
                <rect x="52" y="97" width="40" height="6" rx="3" fill="#E5E7EB" />

                <rect x="15" y="130" width="100" height="10" rx="5" fill="#E5E7EB" />
                <rect x="15" y="130" width="70" height="10" rx="5" fill="#1E5631" />

                <rect x="15" y="150" width="45" height="40" rx="8" fill="#E8F5E9" />
                <text x="37" y="172" fontSize="14" fill="#1E5631" textAnchor="middle" fontWeight="bold">78%</text>
                <text x="37" y="183" fontSize="7" fill="#6B7280" textAnchor="middle">Precisione</text>

                <rect x="70" y="150" width="45" height="40" rx="8" fill="#FFF8E1" />
                <text x="92" y="172" fontSize="14" fill="#C9A227" textAnchor="middle" fontWeight="bold">32</text>
                <text x="92" y="183" fontSize="7" fill="#6B7280" textAnchor="middle">Quiz fatti</text>

                <rect x="15" y="200" width="100" height="25" rx="8" fill="#F3F4F6" />
                <circle cx="35" cy="212" r="6" fill="#1E5631" />
                <circle cx="65" cy="212" r="6" fill="#D1D5DB" />
                <circle cx="95" cy="212" r="6" fill="#D1D5DB" />
            </g>
        </svg>
    </div>
);

export const Slide4Illustration = () => (
    <div className="illustration-svg slide-4-svg">
        <div className="light-rays"></div>
        <div className="bg-circle celebration-circle-1"></div>
        <div className="bg-circle celebration-circle-2"></div>

        <svg className="celebration-scene" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
            <rect className="confetti c1" x="30" y="40" width="12" height="12" rx="2" fill="#C9A227" transform="rotate(30, 36, 46)" />
            <rect className="confetti c2" x="80" y="20" width="10" height="10" rx="2" fill="#1E5631" transform="rotate(-20, 85, 25)" />
            <rect className="confetti c3" x="220" y="35" width="14" height="14" rx="2" fill="#C9A227" transform="rotate(45, 227, 42)" />
            <rect className="confetti c4" x="260" y="80" width="10" height="10" rx="2" fill="#22C55E" transform="rotate(-15, 265, 85)" />
            <rect className="confetti c5" x="40" y="120" width="8" height="8" rx="2" fill="#5B8A9A" transform="rotate(60, 44, 124)" />
            <rect className="confetti c6" x="250" y="150" width="12" height="12" rx="2" fill="#C9A227" transform="rotate(-45, 256, 156)" />

            <circle className="confetti c7" cx="55" cy="180" r="6" fill="#DC2626" opacity="0.8" />
            <circle className="confetti c8" cx="240" cy="200" r="5" fill="#C9A227" />
            <circle className="confetti c9" cx="70" cy="250" r="7" fill="#1E5631" />
            <circle className="confetti c10" cx="230" cy="260" r="6" fill="#5B8A9A" />

            <polygon className="star star-1" points="45,90 48,100 58,100 50,106 53,116 45,110 37,116 40,106 32,100 42,100" fill="#C9A227" />
            <polygon className="star star-2" points="255,110 258,118 266,118 260,123 262,131 255,126 248,131 250,123 244,118 252,118" fill="#C9A227" />
            <polygon className="star star-3" points="150,25 153,35 163,35 155,42 158,52 150,45 142,52 145,42 137,35 147,35" fill="#C9A227" />

            <g className="winner" transform="translate(100, 60)">
                <ellipse cx="50" cy="18" rx="40" ry="10" fill="#0D2818" />
                <ellipse cx="50" cy="15" rx="25" ry="15" fill="#0D2818" />
                <ellipse cx="50" cy="12" rx="15" ry="8" fill="#1E5631" />

                <circle cx="50" cy="45" r="28" fill="#FFDAB9" />
                <path d="M25,40 Q20,20 50,15 Q80,20 75,40" fill="#4A3728" />

                <path d="M38,45 Q42,40 46,45" stroke="#2D3436" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M54,45 Q58,40 62,45" stroke="#2D3436" strokeWidth="3" fill="none" strokeLinecap="round" />

                <ellipse cx="32" cy="52" rx="6" ry="4" fill="#FFB6C1" opacity="0.5" />
                <ellipse cx="68" cy="52" rx="6" ry="4" fill="#FFB6C1" opacity="0.5" />

                <path d="M35,58 Q50,75 65,58" stroke="#2D3436" strokeWidth="3" fill="white" strokeLinecap="round" />

                <rect x="20" y="75" width="60" height="80" rx="10" fill="#1E5631" />
                <rect x="45" y="80" width="10" height="70" fill="#0D2818" />
                <rect x="25" y="110" width="18" height="15" rx="3" fill="#0D2818" opacity="0.3" />
                <rect x="57" y="110" width="18" height="15" rx="3" fill="#0D2818" opacity="0.3" />

                <circle cx="50" cy="95" r="12" fill="#C9A227" />
                <circle cx="50" cy="95" r="8" fill="#FFD700" />
                {/* Stemma stilizzato - Logo Polizia Locale */}
                <g transform="translate(50, 95) scale(0.35)">
                    <path d="M0,-15 L-8,-5 L-15,5 L-10,5 L-5,0 L0,10 L5,0 L10,5 L15,5 L8,-5 Z" fill="#0D2818" />
                    <circle cx="0" cy="-8" r="3" fill="#0D2818" />
                </g>

                <g className="left-arm">
                    <rect x="-15" y="80" width="35" height="15" rx="7" fill="#1E5631" transform="rotate(-60, 20, 87)" />
                    <circle cx="-5" cy="55" r="12" fill="#FFDAB9" />
                    <ellipse cx="-5" cy="45" rx="3" ry="6" fill="#FFDAB9" />
                    <ellipse cx="-12" cy="50" rx="3" ry="5" fill="#FFDAB9" />
                    <ellipse cx="2" cy="50" rx="3" ry="5" fill="#FFDAB9" />
                </g>

                <g className="right-arm">
                    <rect x="80" y="80" width="35" height="15" rx="7" fill="#1E5631" transform="rotate(60, 80, 87)" />
                    <circle cx="105" cy="55" r="12" fill="#FFDAB9" />
                    <ellipse cx="105" cy="45" rx="3" ry="6" fill="#FFDAB9" />
                    <ellipse cx="98" cy="50" rx="3" ry="5" fill="#FFDAB9" />
                    <ellipse cx="112" cy="50" rx="3" ry="5" fill="#FFDAB9" />
                </g>

                <rect x="25" y="155" width="20" height="55" rx="5" fill="#0D2818" />
                <rect x="55" y="155" width="20" height="55" rx="5" fill="#0D2818" />

                <rect x="22" y="200" width="26" height="18" rx="5" fill="#3D2914" />
                <rect x="52" y="200" width="26" height="18" rx="5" fill="#3D2914" />
            </g>
        </svg>
    </div>
);
