tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "secondary-fixed-dim": "#c7c4db",
                "surface": "#faf8ff",
                "primary-fixed-dim": "#cabeff",
                "surface-dim": "#dad9e1",
                "surface-container-lowest": "#ffffff",
                "on-secondary-container": "#626075",
                "inverse-primary": "#cabeff",
                "outline-variant": "#c9c4d7",
                "on-surface-variant": "#484554",
                "on-primary-container": "#f9f3ff",
                "on-secondary-fixed-variant": "#464558",
                "surface-container-low": "#f4f3fb",
                "primary-fixed": "#e6deff",
                "surface-container": "#eeedf5",
                "surface-variant": "#e2e2e9",
                "on-secondary": "#ffffff",
                "secondary-container": "#e0ddf5",
                "on-primary": "#ffffff",
                "on-tertiary-fixed": "#291800",
                "tertiary-container": "#9b6500",
                "on-background": "#1a1b21",
                "tertiary-fixed-dim": "#ffb955",
                "surface-tint": "#6043d5",
                "tertiary-fixed": "#ffddb4",
                "error": "#ba1a1a",
                "surface-container-high": "#e8e7ef",
                "outline": "#797586",
                "inverse-surface": "#2f3036",
                "on-error-container": "#93000a",
                "on-secondary-fixed": "#1a1a2b",
                "tertiary": "#7a4f00",
                "on-surface": "#1a1b21",
                "secondary": "#5e5c70",
                "background": "#faf8ff",
                "primary": "#593bce",
                "inverse-on-surface": "#f1f0f8",
                "error-container": "#ffdad6",
                "surface-bright": "#faf8ff",
                "on-primary-fixed": "#1c0062",
                "on-primary-fixed-variant": "#4723bc",
                "primary-container": "#7257e8",
                "on-tertiary": "#ffffff",
                "secondary-fixed": "#e3e0f8",
                "on-tertiary-fixed-variant": "#633f00",
                "on-tertiary-container": "#fff4ea",
                "on-error": "#ffffff",
                "surface-container-highest": "#e2e2e9"
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            spacing: {
                "xs": "4px",
                "sm": "12px",
                "base": "8px",
                "gutter": "24px",
                "lg": "40px",
                "xl": "64px",
                "md": "24px",
                "container-margin": "32px"
            },
            fontFamily: {
                "body-md": ["Inter"],
                "display-lg": ["Inter"],
                "label-md": ["Inter"],
                "headline-lg": ["Inter"],
                "label-sm": ["Inter"],
                "headline-sm": ["Inter"],
                "body-lg": ["Inter"],
                "headline-md": ["Inter"],
                "headline-lg-mobile": ["Inter"],
                "body-sm": ["Inter"]
            },
            fontSize: {
                "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
                "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
                "label-md": ["14px", { lineHeight: "1.2", fontWeight: "600" }],
                "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
                "label-sm": ["12px", { lineHeight: "1.2", letterSpacing: "0.02em", fontWeight: "500" }],
                "headline-sm": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
                "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
                "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
                "headline-lg-mobile": ["28px", { lineHeight: "1.2", fontWeight: "700" }],
                "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }]
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
    const TASKS_STORAGE_KEY = 'neuronex_tasks_' + workspaceId;
    const SAVED_ITEMS_KEY = 'neuronex_saved_items';

    let isAdmin = false;

    // Default Seed Tasks
    const DEFAULT_TASKS = [
        {
            id: 'task-1',
            title: 'Review Brand Guidelines',
            description: 'Update the digital assets for the Q4 marketing push. Ensure all soft UI components are documented.',
            priority: 'High',
            status: 'In Progress',
            progress: 65,
            dueDate: 'Oct 24',
            assignee: 'Sarah Jenkins',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC2b4UptXl1kM44_w5lXvD2w0j-12fK7t0F0Xp7yT3lCg3JzL8U0jZ3v8A8Y5u1iX9_1XkK8mU-w_xX7mF9tK3zY0A4_w'
        },
        {
            id: 'task-2',
            title: 'API Integration V2',
            description: 'Connect the new payment gateway endpoints to the staging server and run unit tests.',
            priority: 'Medium',
            status: 'In Progress',
            progress: 30,
            dueDate: 'Oct 28',
            assignee: 'David Chen',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArLNeHLvbnxdmMPVMysncyaon1mrX8Zc-mVU9nOJKQs3qjtKE-qg1ZFu2uVQrJMZ8gg0C7wkDxorN6ulqri3ex33tbcXcxCybpqHWXLdPNBQ3IE-eMaYJfDb33rqrVZEn9ATyDhrbD0xQVISt3oCbUewI-gjsGHhJcwu4p2HDOt83ciiwVs6jCEJM6Y_-hPOlmh29w0ZUdzd9vZsVaeRvAduDboQJsw1AGwOMamWE6ab_yPqivwS50'
        },
        {
            id: 'task-3',
            title: 'Q3 Marketing Plan',
            description: 'Finalize budget allocation for social channels and review copy for the main landing page.',
            priority: 'High',
            status: 'In Progress',
            progress: 45,
            dueDate: 'Today',
            assignee: 'Michael Lee',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASdreBlCUtbIn7p_WGXCxNCOhs01xVcrATpf4lGs2HktG4SUwtYwUVfCWX3zrFNZxXbgCsYVnJDDP88wjtB8cnSANuPqajvrhpE2aaGbCM9Za4Bb546HsMUtLI5JGJw0NzvY3Rd-cylw6aCyR9eW7Q3p-8d1unyCZsrWLKGxd3NV5mBiYJlRqbTfmvvGd6l_bk0pZTT28Oyj8-OJmqiOumfC4ykFC9IgAAx6DHtmPvS1J-u5voMoow'
        },
        {
            id: 'task-4',
            title: 'Update Iconography Library',
            description: 'Audit and replace existing icons with rounded variants to match new visual direction.',
            priority: 'Low',
            status: 'Not Started',
            progress: 0,
            dueDate: 'Nov 02',
            assignee: 'Alex Rivera',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpzsk6NIVcKgh0xjmpIygu6yrbC6ls5C9PheIdoGJnc8MsMWx1pe_Z7gtW0k33NaDfIEfrqHCQwy9HYj1qadsUVkPomQ7ni5n79ZRJ6P0vcZfRGNjB4j4biDhdv-46jzCUz6dmmnTlW202Q88sSt6FZqwCayf7cpgEO8Hrn9-SC_AoSGFQ2H0F0cXWcG2s0pbQ4LLVCDaZ2RYty30y4oIeikib2Z6CK2WigTRC7jNt-SiA0WP-PxUU'
        }
    ];

    function getTasks() {
        try {
            const raw = localStorage.getItem(TASKS_STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
                return DEFAULT_TASKS;
            }
            return JSON.parse(raw);
        } catch (e) {
            return DEFAULT_TASKS;
        }
    }

    function saveTasks(tasks) {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }

    function escapeHtml(text) {
        return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderTasks() {
        const grid = document.getElementById('tasks-grid');
        const subtitle = document.getElementById('tasks-subtitle');
        if (!grid) return;

        const tasks = getTasks();
        if (subtitle) {
            subtitle.textContent = `Managing ${tasks.length} active assignment${tasks.length === 1 ? '' : 's'} across the workspace.`;
        }

        grid.innerHTML = tasks.map(task => {
            const isHigh = task.priority === 'High';
            const priorityClass = isHigh
                ? 'text-error bg-error-container/50'
                : (task.priority === 'Medium' ? 'text-tertiary bg-tertiary-container/20' : 'text-on-surface-variant bg-surface-container-highest');

            const isDone = task.status === 'Completed';
            const statusDot = isDone ? 'bg-green-600' : (task.status === 'In Progress' ? 'bg-primary' : 'bg-outline');

            const deleteBtnHtml = isAdmin ? `
                <button class="delete-task-btn w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-surface-container-low transition-colors"
                        data-task-id="${task.id}" title="Delete task (Admin)">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            ` : '';

            return `
                <div class="neumorphic-raised rounded-2xl p-md bg-surface flex flex-col justify-between group hover:scale-[1.01] transition-transform duration-300 relative"
                     data-task-id="${task.id}">
                    <div>
                        <div class="flex justify-between items-start mb-sm">
                            <span class="px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 neumorphic-inset">
                                <span class="w-2 h-2 rounded-full ${statusDot}"></span>
                                ${escapeHtml(task.status)}
                            </span>
                            <div class="flex items-center gap-1">
                                <span class="font-label-sm text-label-sm ${priorityClass} px-2.5 py-0.5 rounded-full font-medium">${escapeHtml(task.priority)}</span>
                                <button class="save-task-btn w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary transition-colors"
                                        data-task-id="${task.id}" title="Bookmark task">
                                    <span class="material-symbols-outlined text-[18px]">bookmark</span>
                                </button>
                                ${deleteBtnHtml}
                            </div>
                        </div>
                        <h3 class="font-headline-sm text-[18px] font-semibold text-on-surface mb-2 line-clamp-2">${escapeHtml(task.title)}</h3>
                        <p class="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">${escapeHtml(task.description)}</p>
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-label-sm text-label-sm text-on-surface-variant">Progress</span>
                            <span class="font-label-sm text-label-sm font-semibold text-primary">${task.progress}%</span>
                        </div>
                        <div class="w-full h-2 rounded-full neumorphic-inset bg-surface-container overflow-hidden mb-4">
                            <div class="h-full bg-primary-container rounded-full transition-all duration-500" style="width: ${task.progress}%"></div>
                        </div>
                        <div class="flex justify-between items-center border-t border-outline-variant/30 pt-3 mt-2">
                            <div class="flex items-center gap-1.5 text-on-surface-variant">
                                <span class="material-symbols-outlined text-[17px]">calendar_today</span>
                                <span class="font-label-sm text-label-sm">${escapeHtml(task.dueDate)}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-label-sm text-[12px] text-on-surface-variant font-medium">${escapeHtml(task.assignee || 'Assigned')}</span>
                                <div class="w-8 h-8 rounded-full neumorphic-raised p-[2px] overflow-hidden">
                                    <img class="w-full h-full rounded-full object-cover" src="${task.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6WZnIOKpeL4-vNpQp5vbjZQTOQGhKXBHRRSzYrFpslS9tqX7tajTwCt_YfZMZxkP0qQD7U8XR3usKgefEgH_Hos1Rs9Y92SAdDvXxpxlBqONUzYOWc4uhEXLHi4AF848ApD3afe3WiMzIiEXrkZsdU3MDz6jUM3I1amN94bwYFC8zGwByAzhYjraFIse8VHsNRtDu6BIV50IU0iB6EV9Gxf4Rvp_ggwRB30MUt-FUmUVhewpalUNY'}" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Delete button listeners (Admin only)
        if (isAdmin) {
            grid.querySelectorAll('.delete-task-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.taskId;
                    if (confirm('Delete this task?')) {
                        const tasks = getTasks().filter(t => t.id !== id);
                        saveTasks(tasks);
                        renderTasks();
                    }
                });
            });
        }

        // Bookmark button listeners
        grid.querySelectorAll('.save-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.taskId;
                const task = getTasks().find(t => t.id === id);
                if (task) {
                    saveToSavedItems(task);
                    btn.classList.add('text-primary');
                    btn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
                }
            });
        });
    }

    function saveToSavedItems(task) {
        try {
            let saved = JSON.parse(localStorage.getItem(SAVED_ITEMS_KEY) || '[]');
            const exists = saved.some(item => item.id === task.id || item.title === task.title);
            if (!exists) {
                saved.unshift({
                    id: task.id,
                    title: task.title,
                    author: task.assignee || 'Assigned',
                    date: task.dueDate || 'Active',
                    type: 'Tasks',
                    category: 'task',
                    icon: 'task_alt'
                });
                localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(saved));
            }
            alert(`Task "${task.title}" saved to your Saved Items!`);
        } catch (e) {
            console.error('Error saving item:', e);
        }
    }

    // Check Admin Permission
    async function checkAdminPermission() {
        try {
            const res = await fetch(API_BASE + '/api/me', {
                headers: { 'X-Current-User-Dummy-ID': dummyId }
            });
            if (res.status === 401) {
                window.location.replace('../Create_account/create.html');
                return;
            }
            const data = await res.json().catch(() => ({}));
            const user = data.user || {};
            const workspace = data.workspace || {};

            // Check if user is workspace creator, dummyId is admin, or role is Admin
            if (dummyId.toUpperCase().includes('ADMIN') || (workspace.created_by_user_id && workspace.created_by_user_id === user.id)) {
                isAdmin = true;
            } else if (workspace.members && Array.isArray(workspace.members)) {
                const myMember = workspace.members.find(m => m.user_id === user.id || (m.user && m.user.id === user.id));
                const myRole = myMember ? String(myMember.role || '').toUpperCase() : '';
                isAdmin = myRole === 'ADMIN';
            } else {
                isAdmin = false;
            }
        } catch (err) {
            // Default fallback: if dummyId has ADMIN, grant admin
            isAdmin = dummyId.toUpperCase().includes('ADMIN');
        }

        applyPermissionUI();
    }

    function applyPermissionUI() {
        const actionContainer = document.getElementById('admin-task-action-container');
        const statusBadge = document.getElementById('admin-status-badge');
        const banner = document.getElementById('admin-permission-banner');

        if (isAdmin) {
            // Admin Mode
            if (statusBadge) {
                statusBadge.innerHTML = `
                    <span class="px-3.5 py-1.5 rounded-full bg-primary-container/15 text-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                        <span class="material-symbols-outlined text-[15px]">verified_user</span>
                        Admin Access
                    </span>
                `;
            }
            if (actionContainer) {
                actionContainer.innerHTML = `
                    <button id="open-task-modal-btn"
                        class="ml-4 px-6 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md neumorphic-raised border-t border-white/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm">
                        <span class="material-symbols-outlined text-[18px]">add_task</span>
                        New Task
                    </button>
                `;
                document.getElementById('open-task-modal-btn').addEventListener('click', openModal);
            }
            if (banner) {
                banner.classList.add('hidden');
                banner.innerHTML = '';
            }
        } else {
            // Non-Admin Mode (Viewer / Member)
            if (statusBadge) {
                statusBadge.innerHTML = `
                    <span class="px-3.5 py-1.5 rounded-full bg-surface-container-high text-outline text-xs font-medium flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-[15px]">visibility</span>
                        Viewer Mode
                    </span>
                `;
            }
            if (actionContainer) {
                actionContainer.innerHTML = `
                    <div class="ml-4 px-4 py-2 rounded-full bg-surface-container-high/60 text-outline font-label-md text-xs flex items-center gap-1.5 cursor-not-allowed"
                         title="Only workspace administrators can create tasks">
                        <span class="material-symbols-outlined text-[16px]">lock</span>
                        Admin Only
                    </div>
                `;
            }
            if (banner) {
                banner.classList.remove('hidden');
                banner.innerHTML = `
                    <div class="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-xs text-amber-900 shadow-sm">
                        <span class="material-symbols-outlined text-[20px] text-amber-600 flex-shrink-0">admin_panel_settings</span>
                        <span><strong>Restricted Page:</strong> Only Workspace Administrators have permission to create and manage tasks. You have read-only access.</span>
                    </div>
                `;
            }
        }

        renderTasks();
    }

    // Modal controls
    const modal = document.getElementById('create-task-modal');
    const closeBtn = document.getElementById('close-task-modal-btn');
    const cancelBtn = document.getElementById('cancel-task-btn');
    const form = document.getElementById('create-task-form');

    function openModal() {
        if (!isAdmin) {
            alert('Permission Denied: Only Workspace Admins can create tasks.');
            return;
        }
        if (modal) {
            modal.classList.remove('hidden');
            const titleInp = document.getElementById('task-title-input');
            if (titleInp) titleInp.focus();
            // Prefill assignee with the current user's name
            const assigneeInp = document.getElementById('task-assignee-input');
            if (assigneeInp && !assigneeInp.value) {
                assigneeInp.value = localStorage.getItem('neuronex_name') || 'Sarah Jenkins';
            }
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.add('hidden');
            if (form) form.reset();
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!isAdmin) {
                    alert('Permission Denied: Only Workspace Admins can create tasks.');
                    return;
                }

                const title = document.getElementById('task-title-input').value.trim();
                const desc = document.getElementById('task-desc-input').value.trim();
                const priority = document.getElementById('task-priority-input').value;
                const status = document.getElementById('task-status-input').value;
                const dueDate = document.getElementById('task-date-input').value.trim() || 'Next week';
                const progress = parseInt(document.getElementById('task-progress-input').value) || 0;
                const assignee = document.getElementById('task-assignee-input').value.trim() || 'Sarah Jenkins';

                if (!title) return;

                const newTask = {
                    id: 'task-' + Date.now(),
                    title: title,
                    description: desc || 'Task instructions and deliverables.',
                    priority: priority,
                    status: status,
                    progress: Math.min(100, Math.max(0, progress)),
                    dueDate: dueDate,
                    assignee: assignee,
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6WZnIOKpeL4-vNpQp5vbjZQTOQGhKXBHRRSzYrFpslS9tqX7tajTwCt_YfZMZxkP0qQD7U8XR3usKgefEgH_Hos1Rs9Y92SAdDvXxpxlBqONUzYOWc4uhEXLHi4AF848ApD3afe3WiMzIiEXrkZsdU3MDz6jUM3I1amN94bwYFC8zGwByAzhYjraFIse8VHsNRtDu6BIV50IU0iB6EV9Gxf4Rvp_ggwRB30MUt-FUmUVhewpalUNY'
                };

                const tasks = getTasks();
                tasks.unshift(newTask);
                saveTasks(tasks);
                closeModal();
                renderTasks();
            });
        }

        await checkAdminPermission();
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
