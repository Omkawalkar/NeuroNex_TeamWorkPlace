tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "tertiary": "#7a4f00",
                "on-secondary": "#ffffff",
                "surface-container-high": "#e8e7ef",
                "outline": "#797586",
                "on-tertiary-fixed": "#291800",
                "on-secondary-fixed": "#1a1a2b",
                "surface-dim": "#dad9e1",
                "on-surface-variant": "#484554",
                "secondary-fixed-dim": "#c7c4db",
                "on-primary-fixed-variant": "#4723bc",
                "tertiary-fixed": "#ffddb4",
                "surface": "#faf8ff",
                "primary-container": "#7257e8",
                "surface-container-highest": "#e2e2e9",
                "surface-container-lowest": "#ffffff",
                "secondary-fixed": "#e3e0f8",
                "on-primary-fixed": "#1c0062",
                "on-error-container": "#93000a",
                "on-tertiary": "#ffffff",
                "secondary-container": "#e0ddf5",
                "inverse-surface": "#2f3036",
                "primary-fixed-dim": "#cabeff",
                "surface-container-low": "#f4f3fb",
                "on-primary": "#ffffff",
                "on-primary-container": "#f9f3ff",
                "on-background": "#1a1b21",
                "tertiary-container": "#9b6500",
                "inverse-primary": "#cabeff",
                "on-error": "#ffffff",
                "surface-bright": "#faf8ff",
                "on-surface": "#1a1b21",
                "secondary": "#5e5c70",
                "surface-tint": "#6043d5",
                "error": "#ba1a1a",
                "background": "#faf8ff",
                "primary-fixed": "#e6deff",
                "on-secondary-fixed-variant": "#464558",
                "surface-container": "#eeedf5",
                "error-container": "#ffdad6",
                "on-tertiary-fixed-variant": "#633f00",
                "outline-variant": "#c9c4d7",
                "on-secondary-container": "#626075",
                "primary": "#593bce",
                "inverse-on-surface": "#f1f0f8",
                "tertiary-fixed-dim": "#ffb955",
                "surface-variant": "#e2e2e9",
                "on-tertiary-container": "#fff4ea"
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            spacing: {
                "gutter": "24px",
                "container-margin": "32px",
                "base": "8px",
                "sm": "12px",
                "xs": "4px",
                "lg": "40px",
                "xl": "64px",
                "md": "24px"
            },
            fontFamily: {
                "headline-md": ["Inter"],
                "body-sm": ["Inter"],
                "display-lg": ["Inter"],
                "headline-lg": ["Inter"],
                "label-md": ["Inter"],
                "label-sm": ["Inter"],
                "body-md": ["Inter"],
                "headline-sm": ["Inter"],
                "headline-lg-mobile": ["Inter"],
                "body-lg": ["Inter"]
            },
            fontSize: {
                "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
                "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
                "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                "label-md": ["14px", { "lineHeight": "1.2", "fontWeight": "600" }],
                "label-sm": ["12px", { "lineHeight": "1.2", "letterSpacing": "0.02em", "fontWeight": "500" }],
                "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                "headline-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
                "headline-lg-mobile": ["28px", { "lineHeight": "1.2", "fontWeight": "700" }],
                "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }]
            }
        }
    }
};

(function () {
    'use strict';

    const SAVED_ITEMS_KEY = 'neuronex_saved_items';

    // Default Seed Saved Items
    const DEFAULT_SAVED_ITEMS = [
        {
            id: 'saved-1',
            title: 'Q3 Marketing Strategy',
            author: 'Alex Rivera',
            date: 'Oct 12',
            type: 'Documents',
            category: 'doc',
            icon: 'description',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd68CTD1CBp8yKA53dCH-FVWrG2cAE7MSZZ9uq569lH4j6zdGaCZa49by3nuHBVVUATs9_hwaxyW0h1Wvw7_sxNB69prW4Wyap9TqQhYC4fPUV5-h1MdhChjfhH7Me2diGQe8T-_f1-x76V0G9vrTSHAwEpE2lzpzl0T1yNqzYIKLoHsdxNDymqL8Wi4eNrbohc_9MGsckk5BXS3nV8wo_yKilbyME9UUoshDBsdkBgp7Jz90XUx6r'
        },
        {
            id: 'saved-2',
            title: 'API Authentication Refactor',
            author: 'Sarah Jenkins',
            date: 'Oct 10',
            type: 'Tasks',
            category: 'task',
            icon: 'task_alt',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBf9WdMvMwhb_5g_jX1c1eZ7q1Jg5s0Q3y4f8u9iO_XlK4nN-rPtD8yF0H2s3v4A6Y7u1iX9_1XkK8mU-w_xX7mF9tK3zY0A4_w'
        },
        {
            id: 'saved-3',
            title: 'Competitor Analysis',
            author: 'Emily Chen',
            date: 'Oct 08',
            type: 'Research',
            category: 'research',
            icon: 'analytics',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCupQjOhamiMPZY7__y0RzbTm0j_B_iqGlXbbXPsTXvsiD8RJWpJD5nIk-pxtxWPRErwnlodqUKCOznsy2BK7TrEIp5PD9pX79ONZzxifQji9Gn2KWBGWIWC-QCgXr6kzuMqOLatkRTQzzlnRQibVvVzG6gvl_5VpcXi2xpwXbx3ggnFWfGd5PBWOaIQIA-t9YtWjAYFuU3OeXmPkjjL9AIW2-1ICKVcDmMfO5Eyx1JZ8xfH52NOF-C'
        },
        {
            id: 'saved-4',
            title: 'User Interview Transcripts',
            author: 'David Chen',
            date: 'Oct 05',
            type: 'Research',
            category: 'research',
            icon: 'travel_explore',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArLNeHLvbnxdmMPVMysncyaon1mrX8Zc-mVU9nOJKQs3qjtKE-qg1ZFu2uVQrJMZ8gg0C7wkDxorN6ulqri3ex33tbcXcxCybpqHWXLdPNBQ3IE-eMaYJfDb33rqrVZEn9ATyDhrbD0xQVISt3oCbUewI-gjsGHhJcwu4p2HDOt83ciiwVs6jCEJM6Y_-hPOlmh29w0ZUdzd9vZsVaeRvAduDboQJsw1AGwOMamWE6ab_yPqivwS50'
        },
        {
            id: 'saved-5',
            title: 'Q4 Budget Projections',
            author: 'Finance Team',
            date: 'Oct 02',
            type: 'Documents',
            category: 'sheet',
            icon: 'table_view',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6WZnIOKpeL4-vNpQp5vbjZQTOQGhKXBHRRSzYrFpslS9tqX7tajTwCt_YfZMZxkP0qQD7U8XR3usKgefEgH_Hos1Rs9Y92SAdDvXxpxlBqONUzYOWc4uhEXLHi4AF848ApD3afe3WiMzIiEXrkZsdU3MDz6jUM3I1amN94bwYFC8zGwByAzhYjraFIse8VHsNRtDu6BIV50IU0iB6EV9Gxf4Rvp_ggwRB30MUt-FUmUVhewpalUNY'
        },
        {
            id: 'saved-6',
            title: 'Wireframe New Checkout',
            author: 'Design Team',
            date: 'Sep 29',
            type: 'Tasks',
            category: 'task',
            icon: 'task_alt',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpzsk6NIVcKgh0xjmpIygu6yrbC6ls5C9PheIdoGJnc8MsMWx1pe_Z7gtW0k33NaDfIEfrqHCQwy9HYj1qadsUVkPomQ7ni5n79ZRJ6P0vcZfRGNjB4j4biDhdv-46jzCUz6dmmnTlW202Q88sSt6FZqwCayf7cpgEO8Hrn9-SC_AoSGFQ2H0F0cXWcG2s0pbQ4LLVCDaZ2RYty30y4oIeikib2Z6CK2WigTRC7jNt-SiA0WP-PxUU'
        }
    ];

    let currentFilter = 'All';
    let currentSearch = '';

    function getSavedItems() {
        try {
            const raw = localStorage.getItem(SAVED_ITEMS_KEY);
            if (!raw) {
                localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(DEFAULT_SAVED_ITEMS));
                return DEFAULT_SAVED_ITEMS;
            }
            return JSON.parse(raw);
        } catch (e) {
            return DEFAULT_SAVED_ITEMS;
        }
    }

    function saveItems(items) {
        localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(items));
    }

    function escapeHtml(text) {
        return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderGrid() {
        const grid = document.getElementById('saved-items-grid');
        const countText = document.getElementById('saved-count-text');
        if (!grid) return;

        const all = getSavedItems();
        const filtered = all.filter(item => {
            const matchesFilter = currentFilter === 'All' || item.type === currentFilter;
            const q = currentSearch.toLowerCase().trim();
            const matchesSearch = !q ||
                item.title.toLowerCase().includes(q) ||
                (item.author && item.author.toLowerCase().includes(q));
            return matchesFilter && matchesSearch;
        });

        if (countText) {
            countText.textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'} saved across documents, tasks, and research`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-16 text-center neumorphic-raised rounded-2xl p-8 bg-surface">
                    <span class="material-symbols-outlined text-[48px] text-outline mb-2">bookmark_border</span>
                    <h4 class="font-headline-sm text-on-surface font-semibold">No saved items found</h4>
                    <p class="font-body-sm text-on-surface-variant mt-1">Bookmark any document, presentation, or task to access it quickly here.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(item => {
            const icon = item.icon || (item.type === 'Tasks' ? 'task_alt' : (item.type === 'Research' ? 'analytics' : 'description'));
            const iconColor = item.type === 'Tasks' ? 'text-tertiary' : (item.type === 'Research' ? 'text-secondary' : 'text-primary');

            return `
                <div class="neumorphic-raised rounded-2xl p-md flex flex-col justify-between neumorphic-hover group cursor-pointer h-48 bg-surface transition-all duration-300 relative"
                     data-id="${item.id}">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center ${iconColor} neumorphic-inset">
                            <span class="material-symbols-outlined text-[20px]">${icon}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <span class="font-label-sm text-[11px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">${escapeHtml(item.type || 'Item')}</span>
                            <button class="unbookmark-btn text-primary hover:text-error transition-colors p-1"
                                    data-id="${item.id}" title="Remove from saved items">
                                <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">bookmark</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-headline-sm text-[17px] font-semibold text-on-surface mb-1 truncate group-hover:text-primary transition-colors"
                            title="${escapeHtml(item.title)}">
                            ${escapeHtml(item.title)}
                        </h3>
                        <div class="flex items-center justify-between mt-4 pt-2 border-t border-surface-variant/40">
                            <div class="flex items-center gap-2">
                                <img alt="Author" class="w-6 h-6 rounded-full object-cover neumorphic-raised"
                                     src="${item.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd68CTD1CBp8yKA53dCH-FVWrG2cAE7MSZZ9uq569lH4j6zdGaCZa49by3nuHBVVUATs9_hwaxyW0h1Wvw7_sxNB69prW4Wyap9TqQhYC4fPUV5-h1MdhChjfhH7Me2diGQe8T-_f1-x76V0G9vrTSHAwEpE2lzpzl0T1yNqzYIKLoHsdxNDymqL8Wi4eNrbohc_9MGsckk5BXS3nV8wo_yKilbyME9UUoshDBsdkBgp7Jz90XUx6r'}">
                                <span class="font-label-sm text-label-sm text-on-surface-variant truncate max-w-[120px]">${escapeHtml(item.author || 'You')}</span>
                            </div>
                            <span class="font-label-sm text-label-sm text-secondary">${escapeHtml(item.date || 'Recent')}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Unbookmark action (dynamic removal)
        grid.querySelectorAll('.unbookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const card = btn.closest('[data-id]');
                if (card) {
                    card.style.transform = 'scale(0.9)';
                    card.style.opacity = '0';
                    card.style.transition = 'all 0.25s ease';
                }
                setTimeout(() => {
                    const items = getSavedItems().filter(i => i.id !== id);
                    saveItems(items);
                    renderGrid();
                }, 250);
            });
        });

        // Click card navigates if it's a document
        grid.querySelectorAll('[data-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const id = card.dataset.id;
                const item = getSavedItems().find(i => i.id === id);
                if (item && (item.category === 'ppt' || item.icon === 'co_present')) {
                    // Saved slide decks open the presentation library
                    window.location.href = '../Presentation/presentation.html';
                } else if (item && item.type === 'Documents') {
                    window.location.href = `../Document/document.html?id=${id}`;
                } else if (item && item.type === 'Tasks') {
                    window.location.href = '../New_task/Task.html';
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderGrid();

        // Search Input
        const searchInput = document.getElementById('saved-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value;
                renderGrid();
            });
        }

        // Filter buttons
        const filterBtns = document.querySelectorAll('.saved-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => {
                    b.className = 'saved-filter-btn px-4 py-2 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors neu-raised font-medium';
                });
                btn.className = 'saved-filter-btn px-4 py-2 rounded-full font-label-sm text-label-sm bg-primary text-white shadow-sm transition-all font-semibold';
                currentFilter = btn.dataset.filter;
                renderGrid();
            });
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
