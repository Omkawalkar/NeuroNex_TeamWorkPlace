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

    function nnGetUser() {
        return {
            id: localStorage.getItem('neuronex_user_id') || '0',
            dummy_id: localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001',
            name: localStorage.getItem('neuronex_user_name') || 'User'
        };
    }

    function nnToast(message, isError) {
        var container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-20 right-6 z-[60] flex flex-col gap-3 pointer-events-none';
            document.body.appendChild(container);
        }
        var toast = document.createElement('div');
        toast.className = 'neu-toast ' + (isError ? 'neu-toast-error' : 'neu-toast-success') + ' flex items-center gap-3 px-5 py-3.5 pointer-events-auto';
        var icon = isError ? 'error' : 'check_circle';
        toast.innerHTML = '<span class="material-symbols-outlined text-[22px] ' + (isError ? 'text-[#ef4444]' : 'text-[#10b981]') + '">' + icon + '</span>' +
            '<span class="text-[14px] font-medium text-[#1a1b21]">' + escapeHtml(message) + '</span>';
        container.appendChild(toast);
        setTimeout(function () { toast.style.animation = 'toastSlideOut 0.3s ease forwards'; setTimeout(function () { toast.remove(); }, 300); }, 3000);
    }

    let tasks = [];
    let isAdmin = false;
    let workspaceMembers = [];
    let editingTaskId = null;

    const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6WZnIOKpeL4-vNpQp5vbjZQTOQGhKXBHRRSzYrFpslS9tqX7tajTwCt_YfZMZxkP0qQD7U8XR3usKgefEgH_Hos1Rs9Y92SAdDvXxpxlBqONUzYOWc4uhEXLHi4AF848ApD3afe3WiMzIiEXrkZsdU3MDz6jUM3I1amN94bwYFC8zGwByAzhYjraFIse8VHsNRtDu6BIV50IU0iB6EV9Gxf4Rvp_ggwRB30MUt-FUmUVhewpalUNY';

    function apiHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Current-User-Dummy-ID': dummyId
        };
    }

    async function apiFetch(url, options) {
        const res = await fetch(API_BASE + url, options);
        if (res.status === 401) {
            window.location.replace('../Create_account/create.html');
            throw new Error('Unauthorized');
        }
        return res;
    }

    function mapTask(t) {
        return {
            id: t.id,
            title: t.title,
            description: t.description || 'Task instructions and deliverables.',
            priority: t.priority,
            status: t.status,
            progress: t.progress || 0,
            dueDate: t.due_date,
            assignee: t.assignee || '',
            avatar: t.assignee_avatar || DEFAULT_AVATAR,
            can_edit: !!t.can_edit,
            editor_user_ids: t.editor_user_ids || []
        };
    }

    async function loadTasks() {
        const res = await apiFetch('/api/tasks?workspace_id=' + encodeURIComponent(workspaceId), {
            method: 'GET',
            headers: apiHeaders()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Failed to load tasks');
        }
        const data = await res.json();
        tasks = (data.tasks || []).map(mapTask);
        return tasks;
    }

    async function createTaskApi(payload) {
        const res = await apiFetch('/api/tasks', {
            method: 'POST',
            headers: apiHeaders(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Failed to create task');
        }
        return res.json();
    }

    async function updateTaskApi(id, payload) {
        const res = await apiFetch('/api/tasks/' + id, {
            method: 'PUT',
            headers: apiHeaders(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Failed to update task');
        }
        return res.json();
    }

    async function deleteTaskApi(id) {
        const res = await apiFetch('/api/tasks/' + id, {
            method: 'DELETE',
            headers: apiHeaders()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Failed to delete task');
        }
        return res.json();
    }

    function escapeHtml(text) {
        return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderTasks() {
        const grid = document.getElementById('tasks-grid');
        const subtitle = document.getElementById('tasks-subtitle');
        if (!grid) return;

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

            const canEdit = isAdmin || task.can_edit;

            const editBtnHtml = canEdit ? `
                <button class="edit-task-btn w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-low transition-colors"
                        data-task-id="${task.id}" title="Edit task">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
            ` : '';

            const deleteBtnHtml = isAdmin ? `
                <button class="delete-task-btn w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-surface-container-low transition-colors"
                        data-task-id="${task.id}" title="Delete task (Admin)">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            ` : '';

            const viewOnlyChip = (!isAdmin && !task.can_edit) ? `
                <span class="px-2 py-1 rounded-full bg-surface-container-high text-outline text-[11px] font-medium flex items-center gap-1" title="View only - ask an Admin for edit access">
                    <span class="material-symbols-outlined text-[13px]">visibility</span>
                    View Only
                </span>
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
                                ${editBtnHtml}
                                ${deleteBtnHtml}
                                <button class="save-task-btn w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-low transition-colors"
                                        data-task-id="${task.id}" title="Save to Saved Items">
                                    <span class="material-symbols-outlined text-[18px]">bookmark_add</span>
                                </button>
                            </div>
                        </div>
                        <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-1.5 leading-snug">${escapeHtml(task.title)}</h3>
                        <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-3">${escapeHtml(task.description)}</p>
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
                    <img class="w-full h-full rounded-full object-cover" src="${task.avatar || DEFAULT_AVATAR}" alt="" />
                </div>
            </div>
        </div>
    </div>
</div>
`;
        }).join('');

        wireTaskCardListeners(grid);
    }

    function wireTaskCardListeners(grid) {
        // Edit button listeners (Admin always, plus members the Admin granted edit access)
        grid.querySelectorAll('.edit-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = Number(btn.dataset.taskId);
                const task = tasks.find(t => t.id === id);
                if (task) openEditModal(task);
            });
        });

        // Delete button listeners (Admin only)
        if (isAdmin) {
            grid.querySelectorAll('.delete-task-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const id = Number(btn.dataset.taskId);
                    if (confirm('Delete this task?')) {
                        try {
                            await deleteTaskApi(id);
                            await loadTasks();
                            renderTasks();
                        } catch (err) {
                            nnToast(err.message || 'Failed to delete task', true);
                        }
                    }
                });
            });
        }

        // Bookmark button listeners
        grid.querySelectorAll('.save-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = Number(btn.dataset.taskId);
                const task = tasks.find(t => t.id === id);
                if (task) {
                    saveToSavedItems(task);
                    btn.classList.add('text-primary');
                    btn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
                }
            });
        });
    }

    async function saveToSavedItems(task) {
        try {
            var res = await fetch(API_BASE + '/api/saved', {
                method: 'POST',
                headers: apiHeaders(),
                body: JSON.stringify({
                    workspace_id: Number(workspaceId),
                    title: task.title,
                    item_type: 'task',
                    item_id: String(task.id),
                    author: task.assignee || 'Assigned',
                    description: task.description || ''
                })
            });
            if (!res.ok) {
                var err = await res.json().catch(() => ({}));
                nnToast(err.detail || err.message || 'Could not save item', true);
                return;
            }
            nnToast('Task "' + task.title + '" saved to Saved Items!');
        } catch (e) {
            console.error('Error saving item:', e);
            nnToast('Cannot reach the server. Please make sure the backend is running.', true);
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

            isAdmin = false;
            if (workspace.created_by_user_id && workspace.created_by_user_id === user.id) {
                isAdmin = true;
            } else if (workspace.members && Array.isArray(workspace.members)) {
                var myMember = workspace.members.find(m => m.user_id === user.id || (m.user && m.user.id === user.id));
                var myRole = myMember ? String(myMember.role || '').toUpperCase() : '';
                isAdmin = myRole === 'ADMIN';
            }

            workspaceMembers = (workspace.members && Array.isArray(workspace.members)) ? workspace.members : [];
            const myId = user.id;
            workspaceMembers = workspaceMembers.filter(m => {
                const mid = m.user_id || (m.user && m.user.id);
                return mid !== myId;
            });

            await loadTasks();
            renderTasks();
            applyPermissionUI();
        } catch (err) {
            isAdmin = false;
            try {
                await loadTasks();
                renderTasks();
                applyPermissionUI();
            } catch (e) {
                console.error('Failed to load tasks:', e);
            }
        }
    }

    function memberName(m) {
        if (m.user && m.user.name) return m.user.name;
        if (m.name) return m.name;
        return m.user_id || 'Member';
    }

    function renderEditorMemberCheckboxes(preSelected) {
        const container = document.getElementById('task-editor-members');
        if (!container) return;
        if (!workspaceMembers.length) {
            container.innerHTML = `
                <span class="text-xs text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-xl neumorphic-inset">
                    No other members to grant access to yet.
                </span>
            `;
            return;
        }
        const selected = preSelected || [];
        container.innerHTML = workspaceMembers.map(m => {
            const uid = m.user_id || (m.user && m.user.id);
            const checked = selected.indexOf(uid) !== -1 ? 'checked' : '';
            const role = String(m.role || 'Viewer');
            return `
                <label class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface neumorphic-inset cursor-pointer hover:bg-surface-container-low transition-colors">
                    <input type="checkbox" value="${uid}" ${checked} class="task-editor-check rounded border-outline-variant text-primary focus:ring-primary/30">
                    <span class="text-label-sm font-label-sm text-on-surface">${escapeHtml(memberName(m))}</span>
                    <span class="text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">${escapeHtml(role)}</span>
                </label>
            `;
        }).join('');
    }

    function collectEditorIds() {
        const checked = document.querySelectorAll('.task-editor-check:checked');
        return Array.from(checked).map(cb => Number(cb.value));
    }

    function applyPermissionUI() {
        const actionContainer = document.getElementById('admin-task-action-container');
        const statusBadge = document.getElementById('admin-status-badge');
        const banner = document.getElementById('admin-permission-banner');

        if (isAdmin) {
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
                        <span><strong>Restricted Page:</strong> Only Workspace Administrators can create or delete tasks. Tasks assigned to you by an Admin can be edited — otherwise you have read-only access.</span>
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
    const modalTitle = document.getElementById('task-modal-title');
    const modalSubtitle = document.getElementById('task-modal-subtitle');
    const modalSubmitBtn = document.getElementById('task-modal-submit-btn');
    const permissionSection = document.getElementById('task-edit-permission-section');

    function setModalMode(isEdit) {
        if (!modalTitle) return;
        modalTitle.textContent = isEdit ? 'Edit Task' : 'Create New Task';
        if (modalSubtitle) {
            modalSubtitle.innerHTML = isEdit
                ? '<span class="material-symbols-outlined text-[13px] text-primary">edit_note</span> Update task details below'
                : '<span class="material-symbols-outlined text-[13px] text-primary">verified_user</span> Workspace Admin Permission';
        }
        if (modalSubmitBtn) {
            modalSubmitBtn.innerHTML = isEdit
                ? '<span class="material-symbols-outlined text-[18px]">save</span> Save Changes'
                : '<span class="material-symbols-outlined text-[18px]">check</span> Create Task';
        }
    }

    function openModal() {
        if (!isAdmin) {
            nnToast('Permission Denied: Only Workspace Admins can create tasks.', true);
            return;
        }
        editingTaskId = null;
        if (form) form.reset();
        const progressInput = document.getElementById('task-progress-input');
        if (progressInput) progressInput.value = 35;
        const assigneeInp = document.getElementById('task-assignee-input');
        if (assigneeInp && !assigneeInp.value) {
            assigneeInp.value = nnGetUser().name;
        }
        if (permissionSection) permissionSection.classList.remove('hidden');
        renderEditorMemberCheckboxes([]);
        setModalMode(false);
        if (modal) {
            modal.classList.remove('hidden');
            const titleInp = document.getElementById('task-title-input');
            if (titleInp) titleInp.focus();
        }
    }

    function openEditModal(task) {
        const canEdit = isAdmin || task.can_edit;
        if (!canEdit) {
            nnToast('Permission Denied: You can only edit tasks that an Admin granted you access to.', true);
            return;
        }
        editingTaskId = task.id;
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = (val === null || val === undefined) ? '' : val;
        };
        setVal('task-title-input', task.title);
        setVal('task-desc-input', task.description);
        setVal('task-priority-input', task.priority);
        setVal('task-status-input', task.status);
        setVal('task-progress-input', task.progress);
        setVal('task-date-input', task.dueDate);
        setVal('task-assignee-input', task.assignee);

        if (permissionSection) {
            if (isAdmin) {
                permissionSection.classList.remove('hidden');
                renderEditorMemberCheckboxes(task.editor_user_ids || []);
            } else {
                permissionSection.classList.add('hidden');
            }
        }

        setModalMode(true);
        if (modal) {
            modal.classList.remove('hidden');
            const titleInp = document.getElementById('task-title-input');
            if (titleInp) titleInp.focus();
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.add('hidden');
            if (form) form.reset();
        }
        editingTaskId = null;
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
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!isAdmin && !editingTaskId) {
                    nnToast('Permission Denied: Only Workspace Admins can create tasks.', true);
                    return;
                }
                if (editingTaskId) {
                    const current = tasks.find(t => t.id === editingTaskId);
                    if (!isAdmin && current && !current.can_edit) {
                        nnToast('Permission Denied: You can only edit tasks that an Admin granted you access to.', true);
                        return;
                    }
                }

                const title = document.getElementById('task-title-input').value.trim();
                const desc = document.getElementById('task-desc-input').value.trim();
                const priority = document.getElementById('task-priority-input').value;
                const status = document.getElementById('task-status-input').value;
                const dueDate = document.getElementById('task-date-input').value.trim() || 'Active';
                const progress = parseInt(document.getElementById('task-progress-input').value) || 0;
                const assignee = document.getElementById('task-assignee-input').value.trim() || nnGetUser().name || 'Assigned';

                if (!title) {
                    nnToast('Task title is required.', true);
                    return;
                }

                const payload = {
                    title: title,
                    description: desc || 'Task instructions and deliverables.',
                    priority: priority,
                    status: status,
                    progress: Math.min(100, Math.max(0, progress)),
                    due_date: dueDate,
                    assignee: assignee
                };

                if (isAdmin) {
                    payload.editor_user_ids = collectEditorIds();
                }

                try {
                    if (editingTaskId) {
                        await updateTaskApi(editingTaskId, payload);
                    } else {
                        await createTaskApi(Object.assign({ workspace_id: Number(workspaceId) }, payload));
                    }
                    closeModal();
                    await loadTasks();
                    renderTasks();
                    applyPermissionUI();
                } catch (err) {
                    nnToast(err.message || 'Something went wrong saving the task.', true);
                }
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
