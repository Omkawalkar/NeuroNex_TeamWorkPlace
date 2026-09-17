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

// =====================================================================
// NeuroNex - Meetings List (fetches from API)
// =====================================================================
(function () {
    'use strict';

    const API_BASE = (window.location.port === '8000')
        ? window.location.origin
        : 'http://localhost:8000';
    const dummyId = localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001';
    const workspaceId = sessionStorage.getItem('workspace_id') || '1';

    function nnGetUser() {
        return {
            id: localStorage.getItem('neuronex_user_id') || '0',
            dummy_id: dummyId,
            name: localStorage.getItem('neuronex_user_name') || 'User'
        };
    }

    function nnToast(message, isError) {
        var existing = document.querySelector('.nn-toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.className = 'nn-toast ' + (isError ? 'nn-toast-error' : 'nn-toast-success');
        toast.textContent = message || '';
        toast.style.cssText = 'position:fixed;bottom:32px;right:32px;z-index:2000;padding:12px 20px;borderRadius:12px;fontSize:13px;fontWeight:500;lineHeight:1.4;color:' + (isError ? '#93000a' : '#1a6b34') + ';backgroundColor:' + (isError ? '#ffdad6' : '#d6f5e1') + ';boxShadow:0 8px 24px rgba(70,60,120,0.15);backdropFilter:blur(4px);transition:opacity 0.25s ease;';
        toast.style.opacity = '0';
        document.body.appendChild(toast);
        setTimeout(function () { toast.style.opacity = '1'; }, 10);
        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 250);
        }, 3000);
    }

    let currentDate = new Date();
    let currentFilter = 'all';
    let meetings = [];

    function formatDateHeader(date) {
        var d = new Date(date);
        var today = new Date();
        var yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    }

    function fetchMeetings() {
        var dateStr = currentDate.toISOString().split('T')[0];
        return fetch(API_BASE + '/api/meetings?workspace_id=' + encodeURIComponent(workspaceId) + '&date=' + dateStr, {
            headers: { 'X-Current-User-Dummy-ID': dummyId }
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Failed to load meetings');
                return res.json();
            })
            .then(function (data) {
                var arr = (data.meetings || data || []);
                return arr.map(function (m) {
                    return {
                        id: m.id,
                        title: m.title || 'Untitled Meeting',
                        join_code: m.join_code || m.id,
                        date: m.date || dateStr,
                        startTime: m.start_time || m.time || '',
                        endTime: m.end_time || '',
                        host: m.host || nnGetUser().name,
                        participants: Array.isArray(m.participants) ? m.participants : [],
                        status: m.status || 'upcoming',
                        avatar: m.avatar || ''
                    };
                });
            })
            .catch(function (err) {
                console.warn('Could not fetch meetings:', err);
                return [];
            });
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    function formatTime(t) {
        if (!t) return '';
        var parts = String(t).split(':');
        if (parts.length >= 2) {
            var h = parseInt(parts[0]);
            var m = parts[1];
            var suffix = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return h + ':' + m + ' ' + suffix;
        }
        return t;
    }

    function renderMeetings() {
        var grid = document.getElementById('meetings-grid');
        var countText = document.getElementById('meetings-count-text');
        var dateHeader = document.getElementById('meetings-date-header');
        if (dateHeader) dateHeader.textContent = formatDateHeader(currentDate);
        if (!grid) return;

        var filtered = meetings.filter(function (m) {
            var q = currentSearch ? currentSearch.toLowerCase().trim() : '';
            if (q && (m.title.toLowerCase().indexOf(q) === -1) && (m.host && m.host.toLowerCase().indexOf(q) === -1)) return false;
            if (currentFilter === 'all') return true;
            return m.status === currentFilter;
        });

        if (countText) {
            countText.textContent = filtered.length + ' meeting' + (filtered.length === 1 ? '' : 's') + ' on ' + formatDateHeader(currentDate);
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-16 text-center"><span class="material-symbols-outlined text-[48px] text-outline mb-2">videocam_off</span><h4 class="font-headline-sm text-on-surface font-semibold">No meetings found</h4><p class="font-body-sm text-on-surface-variant mt-1">Schedule a meeting using the "New Meeting" button.</p></div>';
            return;
        }

        grid.innerHTML = filtered.map(function (m) {
            var statusClasses = m.status === 'in-progress'
                ? 'bg-green-500/15 text-green-700 border border-green-500/30'
                : (m.status === 'completed' ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary-container/15 text-primary border border-primary/30');
            var statusDot = m.status === 'in-progress' ? 'bg-green-500' : (m.status === 'completed' ? 'bg-outline' : 'bg-primary');
            var statusText = m.status === 'in-progress' ? 'In Progress' : (m.status === 'completed' ? 'Completed' : 'Upcoming');

            return '<div class="neumorphic-raised rounded-2xl p-md bg-surface flex flex-col h-44 group cursor-pointer hover-lift transition-all duration-300">' +
                '<div class="flex justify-between items-start mb-3">' +
                    '<div class="flex items-center gap-2">' +
                        '<div class="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center text-primary">' +
                            '<span class="material-symbols-outlined text-[18px]">' + (m.status === 'in-progress' ? 'videocam' : 'schedule') + '</span>' +
                        '</div>' +
                        '<div>' +
                            '<h4 class="font-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors">' + escapeHtml(m.title) + '</h4>' +
                            '<p class="font-body-sm text-on-surface-variant">' + escapeHtml(m.host) + '</p>' +
                        '</div>' +
                    '</div>' +
                    '<span class="px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 ' + statusClasses + '">' +
                        '<span class="w-1.5 h-1.5 rounded-full ' + statusDot + '"></span>' + escapeHtml(statusText) +
                    '</span>' +
                '</div>' +
                '<div class="mt-auto pt-3 border-t border-outline-variant/30">' +
                    '<div class="flex items-center justify-between">' +
                        '<div class="flex items-center gap-1.5 text-on-surface-variant">' +
                            '<span class="material-symbols-outlined text-[14px]">access_time</span>' +
                            '<span class="font-label-sm text-label-sm">' + formatTime(m.startTime) + (m.endTime ? ' - ' + formatTime(m.endTime) : '') + '</span>' +
                        '</div>' +
                        '<div class="flex items-center gap-1">' +
                            '<span class="font-label-sm text-on-surface-variant">' + escapeHtml(m.join_code || '') + '</span>' +
                            (m.status === 'in-progress' ? '<button class="join-meeting-btn px-3 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm neumorphic-raised hover:opacity-90 transition-opacity" data-code="' + escapeHtml(m.join_code || '') + '">Join</button>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');

        // Join button
        grid.querySelectorAll('.join-meeting-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var code = btn.dataset.code;
                window.location.href = '../meet_place/meet.html?code=' + code;
            });
        });
    }

    async function initMeetings() {
        meetings = await fetchMeetings();
        renderMeetings();
    }

    // =====================================================================
    // Document Ready - Wire up all UI handlers and init meetings
    // =====================================================================
    document.addEventListener('DOMContentLoaded', () => {
        var prevDayBtn = document.getElementById('prev-day-btn');
        var nextDayBtn = document.getElementById('next-day-btn');
        var todayBtn = document.getElementById('today-btn');
        var newMeetingBtn = document.getElementById('new-meeting-btn');
        var newMeetingMenu = document.getElementById('new-meeting-dropdown');
        var searchInput = document.getElementById('meeting-search-input');
        var filterBtns = document.querySelectorAll('.meeting-filter-btn');

        initMeetings();

        if (prevDayBtn) {
            prevDayBtn.addEventListener('click', () => {
                currentDate.setDate(currentDate.getDate() - 1);
                initMeetings();
            });
        }
        if (nextDayBtn) {
            nextDayBtn.addEventListener('click', () => {
                currentDate.setDate(currentDate.getDate() + 1);
                initMeetings();
            });
        }
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                currentDate = new Date();
                currentFilter = 'all';
                initMeetings();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value;
                renderMeetings();
            });
        }

        if (filterBtns) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => {
                        b.classList.remove('bg-primary', 'text-white');
                        b.classList.add('text-on-surface-variant');
                    });
                    btn.classList.remove('text-on-surface-variant');
                    btn.classList.add('bg-primary', 'text-white');
                    currentFilter = btn.dataset.filter || 'all';
                    renderMeetings();
                });
            });
        }

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

        // Instant meeting option - create a meeting via API and join
        var instantMeetBtn = document.getElementById('instant-meet-btn');
        if (instantMeetBtn) {
            instantMeetBtn.addEventListener('click', async () => {
                try {
                    var res = await fetch(API_BASE + '/api/meetings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Current-User-Dummy-ID': dummyId },
                        body: JSON.stringify({
                            workspace_id: Number(workspaceId),
                            title: nnGetUser().name + "'s Instant Meeting",
                            date: new Date().toISOString().split('T')[0],
                            time: new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(0, '0')
                        })
                    });
                    if (!res.ok) { nnToast('Could not start instant meeting', true); return; }
                    var data = await res.json();
                    var code = data.meeting?.join_code || data.join_code || data.id;
                    window.location.href = '../meet_place/meet.html?code=' + code;
                } catch (err) {
                    nnToast('Cannot reach the server.', true);
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
