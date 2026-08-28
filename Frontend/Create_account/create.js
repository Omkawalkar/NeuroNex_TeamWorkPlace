
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

    // ------------------------------------------------------------------
    // NeuroNex Authentication (Flask + MongoDB backend)
    // ------------------------------------------------------------------
    const DASHBOARD_URL = '/Frontend/Dashboard/dashboard.html';
    const API_BASE = (window.location.port === '5000')
        ? window.location.origin
        : 'http://localhost:5000';

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginSubmit = document.getElementById('login-submit');
    const registerSubmit = document.getElementById('register-submit');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-response-message');

    function setMessage(el, text, isError = true) {
        if (!el) return;
        el.textContent = text || '';
        el.style.display = text ? 'block' : 'none';
        el.style.marginTop = '12px';
        el.style.padding = '10px 14px';
        el.style.borderRadius = '12px';
        el.style.fontSize = '13px';
        el.style.fontWeight = '500';
        el.style.lineHeight = '1.4';
        el.style.color = isError ? '#93000a' : '#1a6b34';
        el.style.backgroundColor = isError ? '#ffdad6' : '#d6f5e1';
    }

    function setLoading(btn, loading, label) {
        if (!btn) return;
        btn.disabled = loading;
        btn.style.opacity = loading ? '0.7' : '1';
        btn.style.cursor = loading ? 'wait' : 'pointer';
        btn.textContent = loading ? 'Please wait…' : label;
    }

    async function postJSON(url, payload) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        });
        let data = null;
        try {
            data = await response.json();
        } catch (err) {
            data = { message: 'Unexpected server response. Please open the app at http://localhost:5000 (not by double-clicking the HTML file).' };
        }
        return { ok: response.ok, status: response.status, data };
    }

    // If the user is already logged in, send them straight to the dashboard.
    async function redirectIfLoggedIn() {
        try {
            const response = await fetch(API_BASE + '/api/me', { credentials: 'same-origin' });
            if (response.ok) {
                window.location.replace(DASHBOARD_URL);
            }
        } catch (err) {
            console.warn('Could not check session:', err);
        }
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                setMessage(loginMessage, 'Please fill in both email and password.');
                return;
            }

            setLoading(loginSubmit, true, 'Login');
            setMessage(loginMessage, '');

            try {
                const { ok, status, data } = await postJSON(API_BASE + '/api/login', { email, password });
                if (ok && data.success) {
                    setMessage(loginMessage, 'Login successful! Redirecting…', false);
                    setTimeout(() => window.location.replace(DASHBOARD_URL), 600);
                } else {
                    setMessage(
                        loginMessage,
                        data.message || (status === 401 ? 'Invalid email or password.' : 'Login failed. Please try again.')
                    );
                }
            } catch (err) {
                setMessage(loginMessage, 'Cannot reach the server. Open the app at http://localhost:5000.');
            } finally {
                setLoading(loginSubmit, false, 'Login');
            }
        });
    }

    // Create account
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const terms = document.getElementById('reg-terms').checked;

            if (!name || !email || !password) {
                setMessage(registerMessage, 'Please fill in all the fields.');
                return;
            }
            if (!terms) {
                setMessage(registerMessage, 'Please accept the Terms & Privacy policy.');
                return;
            }

            setLoading(registerSubmit, true, 'Create Account');
            setMessage(registerMessage, '');

            try {
                const { ok, status, data } = await postJSON(API_BASE + '/api/register', { name, email, password });
                if (ok && data.success) {
                    setMessage(registerMessage, 'Account created! Redirecting…', false);
                    setTimeout(() => window.location.replace(DASHBOARD_URL), 600);
                } else {
                    setMessage(
                        registerMessage,
                        data.message || (status === 409 ? 'An account with this email already exists.' : 'Could not create the account.')
                    );
                }
            } catch (err) {
                setMessage(registerMessage, 'Cannot reach the server. Open the app at http://localhost:5000.');
            } finally {
                setLoading(registerSubmit, false, 'Create Account');
            }
        });
    }

    // Already logged in? → Dashboard.
    redirectIfLoggedIn();
});