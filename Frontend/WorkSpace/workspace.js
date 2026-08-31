// =====================================================================
// NeuroNex — Workspace selection page
// =====================================================================
// - Verifies the session with the Flask backend on load.
// - Loads all workspaces the user is a member of from the backend and
//   renders them as neumorphic cards.
// - "Create New Workspace" opens a modal that creates an empty workspace
//   in MongoDB and opens it on the dashboard.
// - Clicking a workspace card or its "Open" button marks it as the
//   active workspace in the session and navigates to the dashboard.
// =====================================================================

(function () {
    'use strict';

    var API_BASE = (window.location.port === '5000')
        ? window.location.origin
        : 'http://localhost:5000';
    var DASHBOARD_URL = '../Dashboard/dashboard.html';
    var LOGIN_URL = '../Create_account/create.html';

    var workspaceList = document.getElementById('workspace-list');
    var workspaceEmpty = document.getElementById('workspace-list-empty');
    var workspaceLoading = document.getElementById('workspace-list-loading');
    var createBtn = document.getElementById('create-workspace-btn');

    // Modal elements
    var modalOverlay = document.getElementById('create-workspace-modal-overlay');
    var modalContent = document.getElementById('create-workspace-modal-content');
    var nameInput = document.getElementById('workspace-name-input');
    var colorPicker = document.getElementById('workspace-color-picker');
    var confirmBtn = document.getElementById('confirm-create-workspace');
    var cancelBtn = document.getElementById('cancel-create-workspace');
    var errorBox = document.getElementById('create-workspace-error');

    var selectedColor = 'primary';
    var isSubmitting = false;

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------
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

    // -----------------------------------------------------------------
    // Modal handling
    // -----------------------------------------------------------------
    function openModal() {
        hideError();
        if (nameInput) {
            nameInput.value = '';
            setTimeout(function () { nameInput.focus(); }, 50);
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
        var swatches = colorPicker.querySelectorAll('.color-swatch');
        swatches.forEach(function (sw) {
            var c = sw.getAttribute('data-color');
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
        colorPicker.addEventListener('click', function (e) {
            var btn = e.target.closest('.color-swatch');
            if (!btn) return;
            var c = btn.getAttribute('data-color');
            if (c) {
                selectedColor = c;
                updateColorPicker();
            }
        });
    }

    if (createBtn) {
        createBtn.addEventListener('click', function () {
            openModal();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            closeModal();
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    if (nameInput) {
        nameInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmBtn && confirmBtn.click();
            } else if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // -----------------------------------------------------------------
    // API calls
    // -----------------------------------------------------------------
    async function apiGet(url) {
        var res = await fetch(API_BASE + url, { credentials: 'include' });
        return res;
    }

    async function apiPost(url, body) {
        var res = await fetch(API_BASE + url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body || {})
        });
        return res;
    }

    // -----------------------------------------------------------------
    // Rendering
    // -----------------------------------------------------------------
    function initialOf(ws) {
        var name = (ws.name || '').trim();
        return name ? name.charAt(0).toUpperCase() : '?';
    }

    function renderCard(ws) {
        var iconBg = escapeHtml(ws.icon_bg || 'bg-primary-container/20');
        var textColor = escapeHtml(ws.text_color || 'text-primary-container');
        var icon = escapeHtml(ws.icon || 'workspace_preset');
        var name = escapeHtml(ws.name || 'Untitled workspace');
        var projectCount = Number(ws.project_count || 0);
        var projectLabel = projectCount + (projectCount === 1 ? ' Active Project' : ' Active Projects');
        var wsId = escapeHtml(ws.id || '');

        // Empty / new workspaces don't have member avatars — we show the
        // initial in a muted badge instead, matching the existing design
        // language for "0 members" placeholders.
        var memberBadge = '<div class="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center font-label-sm text-label-sm text-on-surface-variant" title="Just you">'
            + initialOf(ws) + '</div>';

        return '<div class="w-full bg-surface rounded-[24px] p-lg neumorphic-raised workspace-card cursor-pointer relative overflow-hidden flex items-center justify-between" data-workspace-id="'
            + wsId + '" data-workspace-name="' + name + '">'
            + '<div class="flex items-center gap-lg">'
            +   '<div class="w-16 h-16 rounded-2xl ' + iconBg + ' ' + textColor + ' flex items-center justify-center neumorphic-inset">'
            +     '<span class="material-symbols-outlined" style="font-size: 32px;">' + icon + '</span>'
            +   '</div>'
            +   '<div>'
            +     '<h2 class="font-headline-sm text-headline-sm text-on-surface mb-1">' + name + '</h2>'
            +     '<p class="font-body-sm text-body-sm text-on-surface-variant">' + projectLabel + '</p>'
            +   '</div>'
            + '</div>'
            + '<div class="flex items-center gap-md">'
            +   '<div class="flex -space-x-3">' + memberBadge + '</div>'
            +   '<button class="open-btn bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:bg-surface-tint transition-colors" data-workspace-id="' + wsId + '">Open</button>'
            + '</div>'
            + '</div>';
    }

    function renderWorkspaces(workspaces) {
        if (!workspaceList) return;
        // Remove dynamic children but keep the loading + empty placeholders.
        Array.from(workspaceList.querySelectorAll('.workspace-card')).forEach(function (el) {
            el.remove();
        });

        if (!Array.isArray(workspaces) || workspaces.length === 0) {
            hideLoading();
            if (workspaceEmpty) workspaceEmpty.classList.remove('hidden');
            return;
        }

        if (workspaceEmpty) workspaceEmpty.classList.add('hidden');
        hideLoading();

        var fragment = document.createDocumentFragment();
        var wrap = document.createElement('div');
        wrap.innerHTML = workspaces.map(renderCard).join('');
        while (wrap.firstChild) {
            fragment.appendChild(wrap.firstChild);
        }
        workspaceList.appendChild(fragment);
    }

    // -----------------------------------------------------------------
    // Load workspaces
    // -----------------------------------------------------------------
    async function loadWorkspaces() {
        showLoading();
        try {
            var res = await apiGet('/api/workspaces');
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
            var data = await res.json();
            renderWorkspaces(data.workspaces || []);
        } catch (err) {
            hideLoading();
            if (workspaceEmpty) {
                workspaceEmpty.textContent = 'Cannot reach the server. Open the app at http://localhost:5000.';
                workspaceEmpty.classList.remove('hidden');
            }
        }
    }

    // -----------------------------------------------------------------
    // Card / open button interactions (event delegation)
    // -----------------------------------------------------------------
    if (workspaceList) {
        workspaceList.addEventListener('click', function (e) {
            // "Open" button
            var openBtn = e.target.closest('.open-btn');
            if (openBtn) {
                e.stopPropagation();
                var wsId = openBtn.getAttribute('data-workspace-id');
                if (wsId) selectAndOpen(wsId);
                return;
            }
            // Card body
            var card = e.target.closest('.workspace-card');
            if (card) {
                var id = card.getAttribute('data-workspace-id');
                if (id) selectAndOpen(id);
            }
        });
    }

    async function selectAndOpen(workspaceId) {
        try {
            var res = await apiPost('/api/workspaces/select', { workspace_id: workspaceId });
            if (res.status === 401) {
                window.location.replace(LOGIN_URL);
                return;
            }
            if (!res.ok) {
                var err = await res.json().catch(function () { return {}; });
                showError(err.message || 'Could not open this workspace.');
                return;
            }
            window.location.href = DASHBOARD_URL;
        } catch (err) {
            showError('Cannot reach the server. Open the app at http://localhost:5000.');
        }
    }

    // -----------------------------------------------------------------
    // Create workspace
    // -----------------------------------------------------------------
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async function () {
            if (isSubmitting) return;
            hideError();
            var name = (nameInput && nameInput.value || '').trim();
            if (!name) {
                showError('Please enter a workspace name.');
                if (nameInput) nameInput.focus();
                return;
            }
            isSubmitting = true;
            confirmBtn.disabled = true;
            try {
                var res = await apiPost('/api/workspaces', {
                    name: name,
                    color: selectedColor
                });
                if (res.status === 401) {
                    window.location.replace(LOGIN_URL);
                    return;
                }
                var data = await res.json().catch(function () { return {}; });
                if (!res.ok) {
                    showError(data.message || 'Could not create the workspace.');
                    return;
                }
                closeModal();
                // The backend already selected the new workspace, so we
                // can jump straight into the dashboard.
                window.location.href = DASHBOARD_URL;
            } catch (err) {
                showError('Cannot reach the server. Open the app at http://localhost:5000.');
            } finally {
                isSubmitting = false;
                confirmBtn.disabled = false;
            }
        });
    }

    // -----------------------------------------------------------------
    // Auth check + initial load
    // -----------------------------------------------------------------
    (async function init() {
        try {
            var res = await apiGet('/api/me');
            if (res.status === 401) {
                window.location.replace(LOGIN_URL);
                return;
            }
        } catch (err) {
            // Network error — still try to render, the list call will
            // surface a useful error message to the user.
        }
        await loadWorkspaces();
    })();

    // Expose dropdown toggle for the profile / notification menus in the
    // header — kept identical to the previous implementation so the
    // existing markup keeps working without inline scripts.
    window.toggleDropdown = function (id) {
        var menu = document.getElementById(id);
        if (!menu) return;
        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            setTimeout(function () {
                menu.classList.remove('opacity-0', '-translate-y-2');
                menu.classList.add('opacity-100', 'translate-y-0');
            }, 10);
        } else {
            menu.classList.remove('opacity-100', 'translate-y-0');
            menu.classList.add('opacity-0', '-translate-y-2');
            setTimeout(function () { menu.classList.add('hidden'); }, 300);
        }
    };

    document.addEventListener('click', function (e) {
        ['profile-dropdown', 'notification-dropdown'].forEach(function (id) {
            var menu = document.getElementById(id);
            if (!menu) return;
            var trigger = menu.closest('.relative') ? menu.closest('.relative').querySelector('img, button') : null;
            if (trigger && !trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('opacity-100', 'translate-y-0');
                menu.classList.add('opacity-0', '-translate-y-2');
                setTimeout(function () { menu.classList.add('hidden'); }, 300);
            }
        });
    });
})();
