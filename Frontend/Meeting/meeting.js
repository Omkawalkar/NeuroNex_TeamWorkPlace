tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "secondary-fixed": "#e3e0f8",
                "surface-container": "#eeedf5",
                "on-tertiary-container": "#fff4ea",
                "surface-variant": "#e2e2e9",
                "on-surface": "#1a1b21",
                "tertiary": "#7a4f00",
                "outline-variant": "#c9c4d7",
                "surface-dim": "#dad9e1",
                "inverse-surface": "#2f3036",
                "tertiary-fixed-dim": "#ffb955",
                "primary": "#593bce",
                "inverse-primary": "#cabeff",
                "secondary-container": "#e0ddf5",
                "outline": "#797586",
                "surface": "#faf8ff",
                "surface-tint": "#6043d5",
                "on-primary-fixed-variant": "#4723bc",
                "error": "#ba1a1a",
                "primary-container": "#7257e8",
                "primary-fixed": "#e6deff",
                "secondary": "#5e5c70",
                "on-secondary-fixed-variant": "#464558",
                "background": "#faf8ff",
                "on-background": "#1a1b21",
                "surface-container-lowest": "#ffffff",
                "inverse-on-surface": "#f1f0f8",
                "surface-container-high": "#e8e7ef",
                "surface-container-highest": "#e2e2e9",
                "error-container": "#ffdad6",
                "on-tertiary-fixed": "#291800",
                "on-primary-container": "#f9f3ff",
                "tertiary-container": "#9b6500",
                "primary-fixed-dim": "#cabeff",
                "on-error": "#ffffff",
                "on-primary": "#ffffff",
                "surface-container-low": "#f4f3fb",
                "tertiary-fixed": "#ffddb4",
                "on-secondary-container": "#626075",
                "secondary-fixed-dim": "#c7c4db",
                "on-tertiary-fixed-variant": "#633f00",
                "on-tertiary": "#ffffff",
                "on-secondary": "#ffffff",
                "on-primary-fixed": "#1c0062",
                "on-error-container": "#93000a",
                "on-surface-variant": "#484554",
                "on-secondary-fixed": "#1a1a2b",
                "surface-bright": "#faf8ff"
            },
            "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px",
                "neumorphic": "20px"
            },
            "spacing": {
                "md": "24px",
                "lg": "40px",
                "container-margin": "32px",
                "xs": "4px",
                "base": "8px",
                "sm": "12px",
                "gutter": "24px",
                "xl": "64px"
            },
            "fontFamily": {
                "display-lg": ["Inter"],
                "headline-lg": ["Inter"],
                "headline-lg-mobile": ["Inter"],
                "body-sm": ["Inter"],
                "headline-md": ["Inter"],
                "label-sm": ["Inter"],
                "headline-sm": ["Inter"],
                "label-md": ["Inter"],
                "body-md": ["Inter"],
                "body-lg": ["Inter"]
            },
            "fontSize": {
                "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                "headline-lg-mobile": ["28px", { "lineHeight": "1.2", "fontWeight": "700" }],
                "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
                "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
                "label-sm": ["12px", { "lineHeight": "1.2", "letterSpacing": "0.02em", "fontWeight": "500" }],
                "headline-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
                "label-md": ["14px", { "lineHeight": "1.2", "fontWeight": "600" }],
                "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }]
            },
            boxShadow: {
                'neumorphic-raised': '-4px -4px 12px rgba(255, 255, 255, 0.8), 0 8px 24px rgba(70, 60, 120, 0.08)',
                'neumorphic-pressed': 'inset 4px 4px 8px rgba(70, 60, 120, 0.06), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
                'neumorphic-floating': '-4px -4px 12px rgba(255, 255, 255, 0.8), 0 16px 48px rgba(70, 60, 120, 0.12)',
            }
        },
    },
};

// Session Auth Check
(async function checkSession() {
    const API_BASE = (window.location.port === '8000')
        ? window.location.origin
        : 'http://localhost:8000';
    const dummyId = localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001';
    try {
        const response = await fetch(API_BASE + '/api/me', {
            headers: { 'X-Current-User-Dummy-ID': dummyId }
        });
        if (response.status === 401) {
            window.location.replace('../Create_account/create.html');
        }
    } catch (err) {
        console.warn('Could not check session on meeting page:', err);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // New Meeting Dropdown Handler
    const newMeetingBtn = document.getElementById('new-meeting-btn');
    const newMeetingMenu = document.getElementById('new-meeting-dropdown');

    function closeNewMeetingMenu() {
        if (!newMeetingMenu || !newMeetingBtn) return;
        newMeetingMenu.classList.remove('scale-100', 'opacity-100');
        newMeetingMenu.classList.add('scale-95', 'opacity-0');
        newMeetingBtn.classList.remove('shadow-neumorphic-pressed');
        newMeetingBtn.classList.add('shadow-neumorphic-raised');
        setTimeout(() => {
            newMeetingMenu.classList.add('hidden');
        }, 200);
    }

    function openNewMeetingMenu() {
        if (!newMeetingMenu || !newMeetingBtn) return;
        newMeetingMenu.classList.remove('hidden');
        setTimeout(() => {
            newMeetingMenu.classList.remove('scale-95', 'opacity-0');
            newMeetingMenu.classList.add('scale-100', 'opacity-100');
        }, 10);
        newMeetingBtn.classList.remove('shadow-neumorphic-raised');
        newMeetingBtn.classList.add('shadow-neumorphic-pressed');
    }

    if (newMeetingBtn && newMeetingMenu) {
        newMeetingBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (newMeetingMenu.classList.contains('hidden')) {
                openNewMeetingMenu();
            } else {
                closeNewMeetingMenu();
            }
        });
    }

    // Profile Dropdown Handler
    const profileBtn = document.getElementById('profile-menu-btn');
    const profileMenu = document.getElementById('profile-menu-dropdown');
    const profileOverlay = document.getElementById('profile-menu-overlay');

    function openProfileMenu() {
        if (!profileMenu) return;
        profileMenu.classList.remove('hidden');
        if (profileOverlay) profileOverlay.classList.remove('hidden');
        setTimeout(() => {
            profileMenu.classList.remove('scale-95', 'opacity-0');
            profileMenu.classList.add('scale-100', 'opacity-100');
            if (profileOverlay) {
                profileOverlay.classList.remove('opacity-0');
                profileOverlay.classList.add('opacity-100');
            }
        }, 10);
    }

    function closeProfileMenu() {
        if (!profileMenu) return;
        profileMenu.classList.remove('scale-100', 'opacity-100');
        profileMenu.classList.add('scale-95', 'opacity-0');
        if (profileOverlay) {
            profileOverlay.classList.remove('opacity-100');
            profileOverlay.classList.add('opacity-0');
        }
        setTimeout(() => {
            profileMenu.classList.add('hidden');
            if (profileOverlay) profileOverlay.classList.add('hidden');
        }, 200);
    }

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (profileMenu.classList.contains('hidden')) {
                openProfileMenu();
            } else {
                closeProfileMenu();
            }
        });

        if (profileOverlay) profileOverlay.addEventListener('click', closeProfileMenu);
    }

    // Close menus on outside click
    document.addEventListener('click', (e) => {
        if (newMeetingMenu && newMeetingBtn && !newMeetingMenu.contains(e.target) && !newMeetingBtn.contains(e.target)) {
            closeNewMeetingMenu();
        }
        if (profileMenu && profileBtn && !profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
            closeProfileMenu();
        }
    });

    // Back to Dashboard button
    const backBtn = document.getElementById('back-to-dashboard-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../Dashboard/dashboard.html';
        });
    }

    // Instant meeting option
    const instantMeetBtn = document.getElementById('instant-meet-btn');
    if (instantMeetBtn) {
        instantMeetBtn.addEventListener('click', () => {
            window.location.href = '../meet_place/meet.html';
        });
    }
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
