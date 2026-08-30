tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "tertiary-container": "#9b6500",
                "on-tertiary-fixed-variant": "#633f00",
                "on-surface": "#1a1b21",
                "surface-dim": "#dad9e1",
                "outline-variant": "#c9c4d7",
                "primary-container": "#7257e8",
                "tertiary-fixed": "#ffddb4",
                "secondary-fixed": "#e3e0f8",
                "tertiary": "#7a4f00",
                "surface-bright": "#faf8ff",
                "inverse-surface": "#2f3036",
                "secondary-fixed-dim": "#c7c4db",
                "surface-tint": "#6043d5",
                "surface-variant": "#e2e2e9",
                "secondary": "#5e5c70",
                "outline": "#797586",
                "primary-fixed": "#e6deff",
                "inverse-primary": "#cabeff",
                "surface-container-high": "#e8e7ef",
                "primary-fixed-dim": "#cabeff",
                "background": "#faf8ff",
                "tertiary-fixed-dim": "#ffb955",
                "on-tertiary": "#ffffff",
                "surface": "#faf8ff",
                "on-tertiary-container": "#fff4ea",
                "on-error": "#ffffff",
                "on-secondary-fixed-variant": "#464558",
                "surface-container-low": "#f4f3fb",
                "inverse-on-surface": "#f1f0f8",
                "surface-container-highest": "#e2e2e9",
                "on-primary-container": "#f9f3ff",
                "on-primary": "#ffffff",
                "on-primary-fixed": "#1c0062",
                "on-background": "#1a1b21",
                "surface-container": "#eeedf5",
                "on-secondary": "#ffffff",
                "on-tertiary-fixed": "#291800",
                "on-secondary-container": "#626075",
                "primary": "#593bce",
                "error-container": "#ffdad6",
                "secondary-container": "#e0ddf5",
                "on-error-container": "#93000a",
                "surface-container-lowest": "#ffffff",
                "error": "#ba1a1a",
                "on-primary-fixed-variant": "#4723bc",
                "on-secondary-fixed": "#1a1a2b",
                "on-surface-variant": "#484554"
            },
            "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            "spacing": {
                "base": "8px",
                "gutter": "24px",
                "container-margin": "32px",
                "sm": "12px",
                "xs": "4px",
                "lg": "40px",
                "xl": "64px",
                "md": "24px"
            },
            "fontFamily": {
                "body-md": ["Inter"],
                "headline-lg-mobile": ["Inter"],
                "headline-sm": ["Inter"],
                "headline-md": ["Inter"],
                "label-sm": ["Inter"],
                "label-md": ["Inter"],
                "display-lg": ["Inter"],
                "headline-lg": ["Inter"],
                "body-sm": ["Inter"],
                "body-lg": ["Inter"]
            },
            "fontSize": {
                "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                "headline-lg-mobile": ["28px", { "lineHeight": "1.2", "fontWeight": "700" }],
                "headline-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
                "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
                "label-sm": ["12px", { "lineHeight": "1.2", "letterSpacing": "0.02em", "fontWeight": "500" }],
                "label-md": ["14px", { "lineHeight": "1.2", "fontWeight": "600" }],
                "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
                "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }]
            }
        }
    }
};

// Session Auth Check
(async function checkSession() {
    const API_BASE = (window.location.port === '5000')
        ? window.location.origin
        : 'http://localhost:5000';
    try {
        const response = await fetch(API_BASE + '/api/me', { credentials: 'include' });
        if (response.status === 401) {
            window.location.replace('../Create_account/create.html');
        }
    } catch (err) {
        console.warn('Could not check session on new_document page:', err);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Interactive handlers can be placed here
});
