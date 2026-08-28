        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-container-highest": "#e2e2e9",
                        "inverse-primary": "#cabeff",
                        "inverse-on-surface": "#f1f0f8",
                        "on-error-container": "#93000a",
                        "tertiary-container": "#9b6500",
                        "on-secondary-fixed": "#1a1a2b",
                        "on-primary": "#ffffff",
                        "tertiary-fixed-dim": "#ffb955",
                        "secondary-fixed-dim": "#c7c4db",
                        "secondary": "#5e5c70",
                        "surface-container": "#eeedf5",
                        "on-surface": "#1a1b21",
                        "on-tertiary-fixed": "#291800",
                        "on-secondary-container": "#626075",
                        "secondary-container": "#e0ddf5",
                        "on-secondary-fixed-variant": "#464558",
                        "surface-container-low": "#f4f3fb",
                        "on-surface-variant": "#484554",
                        "inverse-surface": "#2f3036",
                        "on-secondary": "#ffffff",
                        "on-primary-fixed-variant": "#4723bc",
                        "primary": "#593bce",
                        "on-primary-fixed": "#1c0062",
                        "primary-fixed": "#e6deff",
                        "outline": "#797586",
                        "primary-container": "#7257e8",
                        "on-error": "#ffffff",
                        "outline-variant": "#c9c4d7",
                        "on-tertiary": "#ffffff",
                        "surface-container-high": "#e8e7ef",
                        "on-primary-container": "#f9f3ff",
                        "surface-container-lowest": "#ffffff",
                        "surface-tint": "#6043d5",
                        "surface-bright": "#faf8ff",
                        "tertiary": "#7a4f00",
                        "primary-fixed-dim": "#cabeff",
                        "error": "#ba1a1a",
                        "on-tertiary-container": "#fff4ea",
                        "secondary-fixed": "#e3e0f8",
                        "tertiary-fixed": "#ffddb4",
                        "error-container": "#ffdad6",
                        "surface": "#faf8ff",
                        "surface-dim": "#dad9e1",
                        "surface-variant": "#e2e2e9",
                        "background": "#faf8ff",
                        "on-background": "#1a1b21",
                        "on-tertiary-fixed-variant": "#633f00"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px",
                        "2xl": "1rem",
                        "3xl": "1.5rem"
                    },
                    "spacing": {
                        "xl": "64px",
                        "md": "24px",
                        "base": "8px",
                        "container-margin": "32px",
                        "lg": "40px",
                        "xs": "4px",
                        "sm": "12px",
                        "gutter": "24px"
                    },
                    "fontFamily": {
                        "label-sm": ["Inter"],
                        "headline-sm": ["Inter"],
                        "body-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "label-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-lg": ["Inter"],
                        "display-lg": ["Inter"],
                        "headline-md": ["Inter"]
                    },
                    "fontSize": {
                        "label-sm": ["12px", { "lineHeight": "1.2", "letterSpacing": "0.02em", "fontWeight": "500" }],
                        "headline-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
                        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "1.2", "fontWeight": "700" }],
                        "label-md": ["14px", { "lineHeight": "1.2", "fontWeight": "600" }],
                        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }]
                    },
                    boxShadow: {
                        'neumorphic-raised': 'inset -4px -4px 12px rgba(255, 255, 255, 0.8), 0 8px 24px rgba(70, 60, 120, 0.08)',
                        'neumorphic-inset': 'inset 4px 4px 8px rgba(70, 60, 120, 0.06), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
                        'neumorphic-float': 'inset -4px -4px 12px rgba(255, 255, 255, 0.8), 0 16px 48px rgba(70, 60, 120, 0.12)'
                    }
                }
            }
        }
    function openMergeModal() {
        const backdrop = document.getElementById('merge-modal-backdrop');
        const modal = document.getElementById('merge-modal');
        backdrop.classList.remove('hidden');
        // trigger reflow
        void backdrop.offsetWidth;
        backdrop.classList.remove('opacity-0');
        modal.classList.remove('scale-95');
        modal.classList.add('scale-100');
    }
    
    function closeMergeModal() {
        const backdrop = document.getElementById('merge-modal-backdrop');
        const modal = document.getElementById('merge-modal');
        backdrop.classList.add('opacity-0');
        modal.classList.remove('scale-100');
        modal.classList.add('scale-95');
        setTimeout(() => {
            backdrop.classList.add('hidden');
        }, 300);
    }






    (function() {
        const navButtons = document.querySelectorAll('nav.fixed.bottom-0 button:not(.bg-error)');
        const activeClasses = ['bg-primary-container', 'text-on-primary-container', 'shadow-[inset_4px_4px_8px_rgba(70,60,120,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]'];
        const inactiveClasses = ['text-on-surface-variant', 'shadow-[-4px_-4px_12px_rgba(255,255,255,0.8),8px_8px_24px_rgba(70,60,120,0.08)]'];

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                navButtons.forEach(btn => {
                    btn.classList.remove(...activeClasses);
                    btn.classList.add(...inactiveClasses);
                });
                button.classList.add(...activeClasses);
                button.classList.remove(...inactiveClasses);
            });
        });
    })();