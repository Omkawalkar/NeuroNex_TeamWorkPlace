// =====================================================================
// NeuroNex — Workspace selection page
// =====================================================================

(function () {
    'use strict';

    const API_BASE = (window.location.port === '8000')
        ? window.location.origin
        : 'http://localhost:8000';
    const DASHBOARD_URL = '../Dashboard/dashboard.html';
    const LOGIN_URL = '../Create_account/create.html';

    // Get current user from localStorage
    function getCurrentUser() {
        const dummyId = localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001';
        return {
            id: localStorage.getItem('neuronex_user_id'),
            name: localStorage.getItem('neuronex_user_name') || 'Alex Chen',
            dummy_id: dummyId,
            email: localStorage.getItem('neuronex_user_email') || 'alex.chen@etheric.app'
        };
    }

    const currentUser = getCurrentUser();

    const workspaceList = document.getElementById('workspace-list');
    const workspaceEmpty = document.getElementById('workspace-list-empty');
    const workspaceLoading = document.getElementById('workspace-list-loading');
    const createBtn = document.getElementById('create-workspace-btn');

    // Modal elements
    const modalOverlay = document.getElementById('create-workspace-modal-overlay');
    const nameInput = document.getElementById('workspace-name-input');
    const colorPicker = document.getElementById('workspace-color-picker');
    const confirmBtn = document.getElementById('confirm-create-workspace');
    const cancelBtn = document.getElementById('cancel-create-workspace');
    const errorBox = document.getElementById('create-workspace-error');

    let selectedColor = 'primary';
    let isSubmitting = false;

    // Helper functions
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showError(message) {
        if (!errorBox) return;
        errorBox.classList.remove('hidden');
        errorBox.querySelector('span').textContent = message;
    }

    function hideError() {
        if (!errorBox) return;
        errorBox.classList.add('hidden');
        errorBox.querySelector('span').textContent = '';
    }

    function showLoading() {
        if (workspaceLoading) workspaceLoading.classList.remove('hidden');
        if (workspaceEmpty) workspaceEmpty.classList.add('hidden');
    }

    function hideLoading() {
        if (workspaceLoading) workspaceLoading.classList.add('hidden');
    }

    // Modal handling
    function openModal() {
        hideError();
        if (nameInput) {
            nameInput.value = '';
            setTimeout(() => nameInput.focus(), 50);
        }
        selectedColor = 'primary';
        updateColorPicker();
        if (modalOverlay) modalOverlay.classList.add('active');
    }

    function closeModal() {
        hideError();
        if (modalOverlay) modalOverlay.classList.remove('active');
    }

    function updateColorPicker() {
        if (!colorPicker) return;
        const swatches = colorPicker.querySelectorAll('.color-swatch');
        swatches.forEach(sw => {
            const c = sw.getAttribute('data-color');
            if (c === selectedColor) {
                sw.classList.add('border-primary-container');
                sw.classList.remove('border-transparent');
            } else {
                sw.classList.remove('border-primary-container');
                sw.classList.add('border-transparent');
            }
        });
    }

    if (colorPicker) {
        colorPicker.addEventListener('click', (e) => {
            const btn = e.target.closest('.color-swatch');
            if (!btn) return;
            const c = btn.getAttribute('data-color');
            if (c) {
                selectedColor = c;
                updateColorPicker();
            }
        });
    }

    if (createBtn) {
        createBtn.addEventListener('click', openModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    if (nameInput) {
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmBtn && confirmBtn.click();
            } else if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // API calls with authentication
    async function apiGet(url) {
        const response = await fetch(API_BASE + url, {
            headers: {
                'Content-Type': 'application/json',
                'X-Current-User-Dummy-ID': currentUser.dummy_id || ''
            }
        });
        return response;
    }

    async function apiPost(url, body) {
        const response = await fetch(API_BASE + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Current-User-Dummy-ID': currentUser.dummy_id || ''
            },
            body: JSON.stringify(body || {})
        });
        return response;
    }

    // Rendering
    function initialOf(ws) {
        const name = (ws.name || '').trim();
        return name ? name.charAt(0).toUpperCase() : '?';
    }

    function renderCard(ws) {
        const name = escapeHtml(ws.name || 'Untitled workspace');
        const wsId = escapeHtml(ws.id || '');
        const memberCount = ws.member_count || 0;
        const memberLabel = memberCount + (memberCount === 1 ? ' Active Member' : ' Active Members');

        // Show member avatars (up to 3)
        let memberAvatars = '';
        if (ws.members && ws.members.length > 0) {
            const displayMembers = ws.members.slice(0, 3);
            memberAvatars = displayMembers.map(m => {
                const user = m.user || {};
                const initial = (user.name || '?').charAt(0).toUpperCase();
                const avatarUrl = user.avatar_url;
                if (avatarUrl) {
                    return `<img class="w-10 h-10 rounded-full border-2 border-surface object-cover" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(user.name || 'Member')}">`;
                }
                return `<div class="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center font-label-sm text-label-sm text-on-surface-variant">${initial}</div>`;
            }).join('');
        } else {
            memberAvatars = `<div class="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center font-label-sm text-label-sm text-on-surface-variant">${initialOf(ws)}</div>`;
        }

        return `<div class="w-full bg-surface rounded-[24px] p-lg neumorphic-raised workspace-card cursor-pointer relative overflow-hidden flex items-center justify-between" data-workspace-id="${wsId}" data-workspace-name="${name}">
            <div class="flex items-center gap-lg">
                <div class="w-16 h-16 rounded-2xl bg-primary-container/20 text-primary-container flex items-center justify-center neumorphic-inset">
                    <span class="material-symbols-outlined" style="font-size: 32px;">workspace_preset</span>
                </div>
                <div>
                    <h2 class="font-headline-sm text-headline-sm text-on-surface mb-1">${name}</h2>
                    <p class="font-body-sm text-body-sm text-on-surface-variant">${memberLabel}</p>
                </div>
            </div>
            <div class="flex items-center gap-md">
                <div class="flex -space-x-3">${memberAvatars}</div>
                <button class="open-btn bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:bg-surface-tint transition-colors" data-workspace-id="${wsId}">Open</button>
            </div>
        </div>`;
    }

    function renderWorkspaces(workspaces) {
        if (!workspaceList) return;
        Array.from(workspaceList.querySelectorAll('.workspace-card')).forEach(el => el.remove());

        if (!Array.isArray(workspaces) || workspaces.length === 0) {
            hideLoading();
            if (workspaceEmpty) workspaceEmpty.classList.remove('hidden');
            return;
        }

        if (workspaceEmpty) workspaceEmpty.classList.add('hidden');
        hideLoading();

        const fragment = document.createDocumentFragment();
        const wrap = document.createElement('div');
        wrap.innerHTML = workspaces.map(renderCard).join('');
        while (wrap.firstChild) {
            fragment.appendChild(wrap.firstChild);
        }
        workspaceList.appendChild(fragment);
    }

    // Load workspaces
    async function loadWorkspaces() {
        showLoading();
        try {
            // Check if user is logged in
            if (!currentUser.id) {
                window.location.replace(LOGIN_URL);
                return;
            }

            const res = await apiGet('/api/workspaces');
            if (res.status === 401) {
                window.location.replace(LOGIN_URL);
                return;
            }
            if (!res.ok) {
                hideLoading();
                if (workspaceEmpty) {
                    workspaceEmpty.textContent = 'Could not load workspaces. Please try again.';
                    workspaceEmpty.classList.remove('hidden');
                }
                return;
            }
            const data = await res.json();
            renderWorkspaces(Array.isArray(data) ? data : (data.workspaces || []));
        } catch (err) {
            hideLoading();
            if (workspaceEmpty) {
                workspaceEmpty.textContent = 'Cannot reach the server. Please make sure the backend is running.';
                workspaceEmpty.classList.remove('hidden');
            }
        }
    }

    // Card / open button interactions
    if (workspaceList) {
        workspaceList.addEventListener('click', (e) => {
            const openBtn = e.target.closest('.open-btn');
            if (openBtn) {
                e.stopPropagation();
                const wsId = openBtn.getAttribute('data-workspace-id');
                if (wsId) selectAndOpen(wsId);
                return;
            }
            const card = e.target.closest('.workspace-card');
            if (card) {
                const id = card.getAttribute('data-workspace-id');
                if (id) selectAndOpen(id);
            }
        });
    }

    async function selectAndOpen(workspaceId) {
        try {
            const res = await apiPost('/api/workspaces/select', { workspace_id: workspaceId });
            if (res.status === 401) {
                window.location.replace(LOGIN_URL);
                return;
            }
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                showError(err.message || 'Could not open this workspace.');
                return;
            }
            const data = await res.json().catch(() => ({}));
            window.location.href = DASHBOARD_URL + '?workspace_id=' + encodeURIComponent(data.id || workspaceId);
        } catch (err) {
            showError('Cannot reach the server. Please make sure the backend is running.');
        }
    }

    // Create workspace
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (isSubmitting) return;
            hideError();
            const name = (nameInput && nameInput.value || '').trim();
            if (!name) {
                showError('Please enter a workspace name.');
                if (nameInput) nameInput.focus();
                return;
            }
            isSubmitting = true;
            confirmBtn.disabled = true;
            try {
                const res = await apiPost('/api/workspaces', {
                    name: name,
                    color: selectedColor
                });
                if (res.status === 401) {
                    showError('Not authenticated. Please log in again.');
                    window.location.replace(LOGIN_URL);
                    return;
                }
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    showError(data.error || data.detail || data.message || 'Could not create the workspace.');
                    return;
                }
                closeModal();
                // Redirect to dashboard with the new workspace ID
                window.location.href = DASHBOARD_URL + '?workspace_id=' + data.id;
            } catch (err) {
                showError('Cannot reach the server. Please make sure the backend is running.');
            } finally {
                isSubmitting = false;
                confirmBtn.disabled = false;
            }
        });
    }

    // Initial load
    (async function init() {
        try {
            await loadWorkspaces();
        } catch (err) {
            showError('Failed to load workspaces. Please make sure the backend is running.');
        }
    })();

    // Dropdown toggle
    window.toggleDropdown = function(id) {
        const menu = document.getElementById(id);
        if (!menu) return;
        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            setTimeout(() => {
                menu.classList.remove('opacity-0', '-translate-y-2');
                menu.classList.add('opacity-100', 'translate-y-0');
            }, 10);
        } else {
            menu.classList.remove('opacity-100', 'translate-y-0');
            menu.classList.add('opacity-0', '-translate-y-2');
            setTimeout(() => menu.classList.add('hidden'), 300);
        }
    };

    document.addEventListener('click', (e) => {
        ['profile-dropdown', 'notification-dropdown'].forEach(id => {
            const menu = document.getElementById(id);
            if (!menu) return;
            const trigger = menu.closest('.relative') ? menu.closest('.relative').querySelector('img, button') : null;
            if (trigger && !trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('opacity-100', 'translate-y-0');
                menu.classList.add('opacity-0', '-translate-y-2');
                setTimeout(() => menu.classList.add('hidden'), 300);
            }
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
