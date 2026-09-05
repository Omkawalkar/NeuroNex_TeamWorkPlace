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
    // NeuroNex Authentication (FastAPI + SQLite backend)
    // ------------------------------------------------------------------
    const APP_ORIGIN = (window.location.port === '8000')
        ? window.location.origin
        : 'http://localhost:8000';
    const WORKSPACE_URL = APP_ORIGIN + '/Frontend/WorkSpace/workspace.html';
    const API_BASE = APP_ORIGIN;

    // Demo email to Dummy ID mapping for quick testing
    const DEMO_USERS = {
        'alex.chen@etheric.app': 'NN-ADMIN-001',
        'jordan.l@etheric.app': 'NN-1001',
        's.connor@etheric.app': 'NN-1002',
        'michael.l@etheric.app': 'NN-1003',
        'priya.p@etheric.app': 'NN-1004',
        'lisa.w@etheric.app': 'NN-1005'
    };

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginSubmit = document.getElementById('login-submit');
    const registerSubmit = document.getElementById('register-submit');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-response-message');

    function setCurrentUser(user) {
        if (!user) return;
        localStorage.setItem('neuronex_dummy_id', user.dummy_id || '');
        localStorage.setItem('neuronex_user_name', user.name || '');
        localStorage.setItem('neuronex_user_email', user.email || '');
        localStorage.setItem('neuronex_user_id', String(user.id || ''));
        localStorage.setItem('neuronex_user_avatar', user.avatar_url || '');
    }

    function getCurrentUser() {
        return localStorage.getItem('neuronex_dummy_id');
    }

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

    async function checkServerReady() {
        try {
            const response = await fetch(API_BASE + '/api/health', { cache: 'no-store' });
            return response.ok;
        } catch (err) {
            return false;
        }
    }

    async function redirectIfLoggedIn() {
        const storedDummyId = getCurrentUser();
        if (storedDummyId) {
            const isServerUp = await checkServerReady();
            if (isServerUp) {
                try {
                    const validateRes = await fetch(API_BASE + '/api/users/validate?dummy_id=' + encodeURIComponent(storedDummyId));
                    if (validateRes.ok) {
                        const data = await validateRes.json();
                        if (data.valid) {
                            window.location.replace(WORKSPACE_URL);
                            return;
                        }
                    }
                } catch (err) {
                    localStorage.removeItem('neuronex_dummy_id');
                }
            }
        }
    }

    // LOGIN HANDLER
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
                const isServerUp = await checkServerReady();
                if (!isServerUp) {
                    setMessage(loginMessage, 'Cannot reach the server. Make sure backend is running on http://localhost:8000');
                    setLoading(loginSubmit, false, 'Login');
                    return;
                }

                const response = await fetch(API_BASE + '/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });

                const data = await response.json().catch(() => ({}));
                if (response.ok && data.success) {
                    setCurrentUser(data.user);
                    setMessage(loginMessage, 'Login successful! Redirecting…', false);
                    setTimeout(() => window.location.replace(WORKSPACE_URL), 500);
                } else {
                    setMessage(loginMessage, data.detail || data.message || 'Invalid email or credentials.');
                }
            } catch (err) {
                setMessage(loginMessage, 'Cannot reach the server. Make sure backend is running on http://localhost:8000');
            } finally {
                setLoading(loginSubmit, false, 'Login');
            }
        });
    }

    // REGISTER HANDLER
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
                const isServerUp = await checkServerReady();
                if (!isServerUp) {
                    setMessage(registerMessage, 'Cannot reach the server. Make sure backend is running on http://localhost:8000');
                    setLoading(registerSubmit, false, 'Create Account');
                    return;
                }

                const response = await fetch(API_BASE + '/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name, email: email, password: password })
                });

                const data = await response.json().catch(() => ({}));
                if (response.ok && data.success) {
                    setCurrentUser(data.user);
                    setMessage(registerMessage, 'Account created! Redirecting…', false);
                    setTimeout(() => window.location.replace(WORKSPACE_URL), 500);
                } else {
                    setMessage(registerMessage, data.detail || data.message || 'Could not create account.');
                }
            } catch (err) {
                setMessage(registerMessage, 'Cannot reach the server. Make sure backend is running on http://localhost:8000');
            } finally {
                setLoading(registerSubmit, false, 'Create Account');
            }
        });
    }

    // The login page is intentionally the ALWAYS-shown first screen
    // (per product requirement "first show login page every time").
    // The auto-skip below stays disabled so returning / already-logged-in
    // users are NOT bounced away from the login page on app start.
    // (Keep the function defined above for potential future use.)
    // redirectIfLoggedIn();
});

// =====================================================================
// NeuroNex - Shared Profile & Theme System (avatar + dark/light theme)
// =====================================================================
(function () {
    'use strict';

    var STORAGE_KEYS = ['neuronex_dummy_id','neuronex_user_id','neuronex_user_name','neuronex_user_email','neuronex_user_avatar','neuronex_theme'];

    function nnApiBase() {
        return (window.location.port === '8000') ? window.location.origin : 'http://localhost:8000';
    }

    // ----- Theme -----
    function nnThemePref() { return localStorage.getItem('neuronex_theme') || 'light'; }
    function nnSystemDark() { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
    function nnApplyTheme() {
        var pref = nnThemePref();
        var dark = (pref === 'dark') || (pref === 'system' && nnSystemDark());
        var root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(dark ? 'dark' : 'light');
    }
    function nnSyncThemeUI(mode) {
        var current = mode || nnThemePref();
        document.querySelectorAll('[data-theme-mode]').forEach(function (el) {
            el.classList.remove('ring-2','ring-primary','bg-primary-container/20');
            if (el.getAttribute('data-theme-mode') === current) el.classList.add('ring-2','ring-primary','bg-primary-container/20');
        });
    }
    window.nnSetTheme = function (mode) {
        localStorage.setItem('neuronex_theme', mode);
        nnApplyTheme();
        nnSyncThemeUI(mode);
    };

    // ----- Avatar -----
    function nnStoredAvatar() { return localStorage.getItem('neuronex_user_avatar') || ''; }
    function nnApplyAvatar() {
        var url = nnStoredAvatar();
        if (!url) return;
        document.querySelectorAll('img[data-user-avatar], img[data-user-avatar-preview]').forEach(function (img) {
            img.setAttribute('src', url);
        });
    }
    function nnFillUserHeader() {
        var nameEl = document.getElementById('nn-user-name');
        var emailEl = document.getElementById('nn-user-email');
        if (nameEl) nameEl.textContent = localStorage.getItem('neuronex_user_name') || 'User';
        if (emailEl) emailEl.textContent = localStorage.getItem('neuronex_user_email') || 'user@email.com';
        nnApplyAvatar();
    }
    function nnHandleAvatarFile(file) {
        if (!file || !file.type || file.type.indexOf('image/') !== 0) return;
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                var max = 256, w = img.width, h = img.height;
                if (w > h) { if (w > max) { h = Math.round(h * max / w); w = max; } }
                else { if (h > max) { w = Math.round(w * max / h); h = max; } }
                var canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                localStorage.setItem('neuronex_user_avatar', dataUrl);
                nnApplyAvatar();
                nnFillUserHeader();
                try {
                    var dummyId = localStorage.getItem('neuronex_dummy_id');
                    if (dummyId) fetch(nnApiBase() + '/api/users/me', {
                        method: 'PUT',
                        headers: { 'Content-Type':'application/json','X-Current-User-Dummy-ID': dummyId },
                        body: JSON.stringify({ avatar_url: dataUrl })
                    }).catch(function () { });
                } catch (err) { }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    function nnLogout() {
        STORAGE_KEYS.forEach(function (k) { localStorage.removeItem(k); });
        window.location.href = nnApiBase() + '/Frontend/Create_account/create.html';
    }

    // ----- Dropdown wiring (pages with a profile menu) -----
    function nnWireDropdown() {
        var changeBtn = document.getElementById('nn-change-picture-btn');
        var fileInput = document.getElementById('nn-avatar-file');
        if (changeBtn && fileInput) {
            changeBtn.addEventListener('click', function (e) { if (e) e.stopPropagation(); fileInput.click(); });
            fileInput.addEventListener('change', function () {
                if (fileInput.files && fileInput.files[0]) nnHandleAvatarFile(fileInput.files[0]);
                fileInput.value = '';
            });
        }
        var appearanceBtn = document.getElementById('nn-appearance-btn');
        var themeMenu = document.getElementById('nn-theme-menu');
        if (appearanceBtn && themeMenu) {
            appearanceBtn.addEventListener('click', function (e) { if (e) e.stopPropagation(); themeMenu.classList.toggle('hidden'); });
        }
        document.querySelectorAll('[data-theme-mode]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                if (e) e.stopPropagation();
                window.nnSetTheme(el.getAttribute('data-theme-mode'));
                var tm = document.getElementById('nn-theme-menu');
                if (tm) tm.classList.add('hidden');
            });
        });
        var logoutBtn = document.getElementById('nn-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) { if (e) e.stopPropagation(); nnLogout(); });
        }
    }

    function nnInit() {
        nnApplyTheme();
        nnFillUserHeader();
        nnWireDropdown();
        nnSyncThemeUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', nnInit);
    } else {
        nnInit();
    }
})();
