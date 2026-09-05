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
