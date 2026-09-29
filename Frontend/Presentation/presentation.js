tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
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
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px"
            },
            spacing: {
                base: "8px",
                gutter: "24px",
                "container-margin": "32px",
                sm: "12px",
                xs: "4px",
                lg: "40px",
                xl: "64px",
                md: "24px"
            },
            fontFamily: {
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
            fontSize: {
                "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
                "headline-lg-mobile": ["28px", { lineHeight: "1.2", fontWeight: "700" }],
                "headline-sm": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
                "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
                "label-sm": ["12px", { lineHeight: "1.2", letterSpacing: "0.02em", fontWeight: "500" }],
                "label-md": ["14px", { lineHeight: "1.2", fontWeight: "600" }],
                "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
                "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
                "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
                "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }]
            }
        }
    }
};

(function () {
    'use strict';

    const API_BASE = (window.location.port === '8000')
        ? window.location.origin
        : 'http://localhost:8000';
    const dummyId = localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001';
    const workspaceId = sessionStorage.getItem('workspace_id') || '1';
    const SAVED_ITEMS_KEY = 'neuronex_saved_items';

    let currentFilter = 'all';
    let currentSearch = '';

    function getPresentations() {
        try {
            const raw = localStorage.getItem(PPT_STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(PPT_STORAGE_KEY, JSON.stringify(DEFAULT_PRESENTATIONS));
                return DEFAULT_PRESENTATIONS;
            }
            return JSON.parse(raw);
        } catch (e) {
            return DEFAULT_PRESENTATIONS;
        }
    }

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
        toast.className = 'nn-toast ' + (isError ? 'nn-toast-error' : 'nn-toast-success') + ' flex items-center gap-3 px-5 py-3.5';
        var icon = isError ? 'error' : 'check_circle';
        toast.innerHTML = '<span class="material-symbols-outlined text-[22px] ' + (isError ? 'text-[#ef4444]' : 'text-[#10b981]') + '">' + icon + '</span>' +
            '<span class="text-[14px] font-medium text-[#1a1b21]">' + escapeHtml(message) + '</span>';
        toast.style.cssText = 'position:fixed;bottom:32px;right:32px;z-index:2000;borderRadius:12px;backgroundColor:' + (isError ? '#ffdad6' : '#d6f5e1') + ';boxShadow:0 8px 24px rgba(70,60,120,0.15);backdropFilter:blur(4px);transition:opacity 0.25s ease;opacity:0;';
        document.body.appendChild(toast);
        setTimeout(function () { toast.style.opacity = '1'; }, 10);
        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 250);
        }, 3000);
    }

    let presentations = [];

    async function loadPresentations() {
        const res = await fetch(API_BASE + '/api/presentations?workspace_id=' + encodeURIComponent(workspaceId), {
            headers: { 'X-Current-User-Dummy-ID': dummyId }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.presentations || data || []).map(p => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            category: p.category || 'all',
            slides: p.slides || 0,
            author: p.author || 'You',
            date: p.date || 'Recent',
            views: p.views || 0,
            avatar: p.avatar || '',
            file_name: p.file_name || ''
        }));
    }

    async function incrementView(pptId) {
        try {
            await fetch(API_BASE + '/api/presentations/' + pptId + '/view', {
                method: 'POST',
                headers: { 'X-Current-User-Dummy-ID': dummyId }
            });
        } catch (e) { console.warn('view increment failed', e); }
    }

    async function deletePresentationApi(pptId) {
        const res = await fetch(API_BASE + '/api/presentations/' + pptId, {
            method: 'DELETE',
            headers: { 'X-Current-User-Dummy-ID': dummyId }
        });
        if (!res.ok) {
            var err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Failed to delete presentation');
        }
        return res.json();
    }

    async function saveToSavedItems(ppt) {
        try {
            var res = await fetch(API_BASE + '/api/saved', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Current-User-Dummy-ID': dummyId },
                body: JSON.stringify({
                    workspace_id: Number(workspaceId),
                    title: ppt.title,
                    item_type: 'presentation',
                    item_id: String(ppt.id),
                    author: ppt.author || 'You',
                    description: ppt.description || ''
                })
            });
            if (!res.ok) {
                var err = await res.json().catch(() => ({}));
                nnToast(err.detail || err.message || 'Could not save item', true);
                return;
            }
            nnToast('Presentation "' + ppt.title + '" bookmarked!');
        } catch (e) {
            console.error('Error saving item:', e);
            nnToast('Cannot reach the server. Please make sure the backend is running.', true);
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    async function renderGrid() {
        const grid = document.getElementById('presentations-grid');
        const countText = document.getElementById('ppt-count-text');
        if (!grid) return;

        presentations = await loadPresentations();
        const filtered = presentations.filter(ppt => {
            const matchesTab = currentFilter === 'all' || ppt.category === currentFilter;
            const q = currentSearch.toLowerCase().trim();
            const matchesSearch = !q ||
                ppt.title.toLowerCase().includes(q) ||
                (ppt.author && ppt.author.toLowerCase().includes(q)) ||
                (ppt.description && ppt.description.toLowerCase().includes(q));
            return matchesTab && matchesSearch;
        });

        if (countText) {
            countText.textContent = filtered.length + ' deck' + (filtered.length === 1 ? '' : 's') + ' in Project Alpha';
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-16 text-center neumorphic-raised rounded-2xl p-8 bg-surface">
                    <span class="material-symbols-outlined text-[48px] text-outline mb-2">slideshow</span>
                    <h4 class="font-headline-sm text-on-surface font-semibold">No presentations found</h4>
                    <p class="font-body-sm text-on-surface-variant mt-1">Click "Upload PPT" above to upload your first presentation.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(ppt => {
            const badgeHtml = ppt.category === 'drafts'
                ? `<span class="bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Draft</span>`
                : (ppt.category === 'templates'
                    ? `<span class="bg-primary-container/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Template</span>`
                    : `<span class="bg-surface-container-high text-on-surface-variant text-[10px] font-semibold px-2 py-0.5 rounded-full">${ppt.slides} Slides</span>`);

            return `
                <div class="neumorphic-raised rounded-2xl p-5 flex flex-col justify-between group hover-lift cursor-pointer bg-surface relative overflow-hidden transition-all duration-300"
                     data-ppt-id="${ppt.id}">
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
                    <div>
                        <div class="flex justify-between items-start mb-4 relative z-10">
                            <div class="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary shadow-inner">
                                <span class="material-symbols-outlined text-[24px]">slideshow</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                                ${badgeHtml}
                                <button class="save-ppt-btn w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary transition-colors"
                                        title="Bookmark deck" data-ppt-id="${ppt.id}">
                                    <span class="material-symbols-outlined text-[18px]">bookmark</span>
                                </button>
                                <button class="delete-ppt-btn w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-error transition-colors"
                                        title="Delete deck" data-ppt-id="${ppt.id}">
                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        </div>
                        <div class="flex-1 relative z-10">
                            <h4 class="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors font-semibold truncate"
                                title="${escapeHtml(ppt.title)}">
                                ${escapeHtml(ppt.title)}
                            </h4>
                            <p class="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">${escapeHtml(ppt.description)}</p>
                        </div>
                    </div>
                    <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-between relative z-10 mt-auto">
                        <div class="flex items-center gap-2">
                            <img class="w-6 h-6 rounded-full neumorphic-raised object-cover" src="${ppt.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrmy51HwIaEThOq2vFZO-W-pf2eQtvUOG0UjlbXEVwoKZCUbdYaQyjJ-qTkKeVf4metwUf3NVTffHgD9csOEvKYCHpNpfL7GfTHrAqqzklcc4mDd60KfJb2BrXKCdiVeiBmp3yTaYSxmSb3PiXdSNEOoezOC-STOp8Ycy6vWiSsigRoP7Hubbkqcz3frD1gCia8GN3Xdc05mjykF2Ngvj6wLSNlkdmNRQKA0n1RlCOV65gf8I-Gz2B'}" alt="" />
                            <span class="font-label-sm text-label-sm text-on-surface font-medium">${escapeHtml(ppt.author || 'You')}</span>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="font-label-sm text-label-sm text-on-surface-variant">${escapeHtml(ppt.date || 'Recent')}</span>
                            <div class="flex items-center gap-1 text-primary mt-0.5">
                                <span class="material-symbols-outlined text-[12px]">visibility</span>
                                <span class="text-[10px] font-semibold">${ppt.views || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Delete buttons
        grid.querySelectorAll('.delete-ppt-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.pptId;
                if (confirm('Delete this presentation?')) {
                    try {
                        await deletePresentationApi(id);
                        await renderGrid();
                    } catch (err) {
                        nnToast(err.message || 'Failed to delete presentation', true);
                    }
                }
            });
        });

        // Bookmark buttons
        grid.querySelectorAll('.save-ppt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.pptId;
                const deck = presentations.find(p => p.id == id);
                if (deck) {
                    saveToSavedItems(deck);
                    btn.classList.add('text-primary');
                    btn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
                }
            });
        });

        // Click card opens presentation
        grid.querySelectorAll('[data-ppt-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const id = card.dataset.pptId;
                window.location.href = '../Presentation/presentation.html?open=' + id;
            });
        });
    }

    // Modal & Event listeners
    document.addEventListener('DOMContentLoaded', () => {
        renderGrid();

        // Search Input
        const searchInput = document.getElementById('ppt-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value;
                renderGrid();
            });
        }

        // Filter Tabs
        const filterBtns = document.querySelectorAll('.ppt-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => {
                    b.className = 'ppt-filter-btn px-4 py-1.5 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-all';
                });
                btn.className = 'ppt-filter-btn px-4 py-1.5 rounded-lg bg-surface shadow-sm font-label-sm text-label-sm text-primary transition-all font-semibold';
                currentFilter = btn.dataset.pptFilter;
                renderGrid();
            });
        });

        // Upload PPT Modal
        const modal = document.getElementById('upload-ppt-modal');
        const openBtn = document.getElementById('open-upload-ppt-btn');
        const closeBtn = document.getElementById('close-ppt-modal-btn');
        const cancelBtn = document.getElementById('cancel-ppt-btn');
        const form = document.getElementById('upload-ppt-form');
        const dropZone = document.getElementById('ppt-drop-zone');
        const fileInput = document.getElementById('ppt-file-input');
        const dropText = document.getElementById('ppt-drop-text');

        let uploadedFile = null;

        function openModal() {
            if (modal) {
                modal.classList.remove('hidden');
                const titleInp = document.getElementById('ppt-title-input');
                if (titleInp) titleInp.focus();
                const authorInp = document.getElementById('ppt-author-input');
                if (authorInp && !authorInp.value) {
                    authorInp.value = localStorage.getItem('neuronex_user_name') || nnGetUser().name;
                }
            }
        }

        function closeModal() {
            if (modal) {
                modal.classList.add('hidden');
                if (form) form.reset();
                uploadedFile = null;
                if (dropText) dropText.textContent = 'Click to choose .pptx, .ppt, or .pdf';
            }
        }

        if (openBtn) openBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // File drop zone
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    uploadedFile = e.target.files[0];
                    if (dropText) dropText.textContent = `Attached: ${uploadedFile.name} (${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB)`;
                    const titleInp = document.getElementById('ppt-title-input');
                    if (titleInp && !titleInp.value) {
                        titleInp.value = uploadedFile.name.replace(/\.[^/.]+$/, "");
                    }
                }
            });
        }

        // Form Submit (multipart upload via API)
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const title = document.getElementById('ppt-title-input').value.trim();
                const category = document.getElementById('ppt-type-input').value;
                const slides = parseInt(document.getElementById('ppt-slides-input').value) || 12;
                const author = document.getElementById('ppt-author-input').value.trim() || nnGetUser().name;
                const desc = document.getElementById('ppt-desc-input').value.trim() || 'PowerPoint presentation deck uploaded to workspace.';

                if (!title) {
                    nnToast('Presentation title is required.', true);
                    return;
                }

                var formData = new FormData();
                formData.append('title', title);
                formData.append('description', desc);
                formData.append('category', category);
                formData.append('slides', slides);
                formData.append('author', author);
                formData.append('workspace_id', workspaceId);

                if (uploadedFile) {
                    formData.append('file', uploadedFile);
                }

                try {
                    const res = await fetch(API_BASE + '/api/presentations', {
                        method: 'POST',
                        headers: { 'X-Current-User-Dummy-ID': dummyId },
                        body: formData
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        nnToast(err.detail || 'Failed to upload presentation', true);
                        return;
                    }
                    nnToast('Presentation uploaded successfully!');
                    closeModal();
                    await renderGrid();
                } catch (err) {
                    nnToast('Cannot reach the server. Please make sure the backend is running.', true);
                }
            });
        }
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
