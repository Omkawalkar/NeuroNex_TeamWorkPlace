      
              tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-primary-fixed-variant": "#4723bc",
                        "surface-bright": "#faf8ff",
                        "tertiary-fixed-dim": "#ffb955",
                        "primary-fixed-dim": "#cabeff",
                        "surface-container": "#eeedf5",
                        "on-surface-variant": "#484554",
                        "primary-container": "#7257e8",
                        "inverse-on-surface": "#f1f0f8",
                        "surface-container-lowest": "#ffffff",
                        "on-primary": "#ffffff",
                        "primary": "#593bce",
                        "secondary-fixed": "#e3e0f8",
                        "on-background": "#1a1b21",
                        "tertiary": "#7a4f00",
                        "on-error": "#ffffff",
                        "outline": "#797586",
                        "on-primary-container": "#f9f3ff",
                        "on-tertiary-container": "#fff4ea",
                        "surface-dim": "#dad9e1",
                        "on-secondary-fixed-variant": "#464558",
                        "background": "#faf8ff",
                        "secondary": "#5e5c70",
                        "primary-fixed": "#e6deff",
                        "surface-variant": "#e2e2e9",
                        "inverse-surface": "#2f3036",
                        "surface-container-low": "#f4f3fb",
                        "on-tertiary-fixed-variant": "#633f00",
                        "on-secondary-fixed": "#1a1a2b",
                        "tertiary-container": "#9b6500",
                        "surface-container-highest": "#e2e2e9",
                        "inverse-primary": "#cabeff",
                        "surface": "#faf8ff",
                        "on-tertiary-fixed": "#291800",
                        "on-surface": "#1a1b21",
                        "secondary-container": "#e0ddf5",
                        "surface-container-high": "#e8e7ef",
                        "on-primary-fixed": "#1c0062",
                        "error": "#ba1a1a",
                        "on-secondary-container": "#626075",
                        "error-container": "#ffdad6",
                        "secondary-fixed-dim": "#c7c4db",
                        "tertiary-fixed": "#ffddb4",
                        "on-secondary": "#ffffff",
                        "on-error-container": "#93000a",
                        "outline-variant": "#c9c4d7",
                        "surface-tint": "#6043d5",
                        "on-tertiary": "#ffffff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1.25rem",
                        "3xl": "1.5rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "base": "8px",
                        "sm": "12px",
                        "md": "24px",
                        "container-margin": "32px",
                        "lg": "40px",
                        "xl": "64px",
                        "xs": "4px",
                        "gutter": "24px"
                    },
                    "fontFamily": {
                        "label-md": ["Inter"],
                        "label-sm": ["Inter"],
                        "headline-lg": ["Inter"],
                        "display-lg": ["Inter"],
                        "headline-sm": ["Inter"],
                        "body-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Inter"]
                    },
                    "fontSize": {
                        "label-md": ["14px", { "lineHeight": "1.2", "fontWeight": "600" }],
                        "label-sm": ["12px", { "lineHeight": "1.2", "letterSpacing": "0.02em", "fontWeight": "500" }],
                        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "headline-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
                        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "1.2", "fontWeight": "700" }],
                        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }]
                    }
                }
            }
        }
      
      document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById('auth-container');
            const triggers = document.querySelectorAll('.flip-trigger');

            triggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    container.classList.toggle('is-flipped');
                });
            });
        });