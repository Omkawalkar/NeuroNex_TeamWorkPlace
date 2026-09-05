// =====================================================================
// Dashboard Member Management - Frontend Integration
// =====================================================================
// This file handles loading workspace data, displaying members, and
// managing invitations using the FastAPI backend.

(function() {
    'use strict';

    // Configuration
    var API_BASE = (window.location.port === '8000')
        ? window.location.origin
        : 'http://localhost:8000';
    
    // Dev auth: the login page stores the logged-in Dummy ID in localStorage.
    var CURRENT_USER_DUMMY_ID = localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001';
    var WORKSPACE_ID = null;

    // Get workspace ID from URL parameters or session storage
    function getWorkspaceId() {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('workspace_id');
        if (!id) {
            id = sessionStorage.getItem('workspace_id');
        }
        if (id) {
            sessionStorage.setItem('workspace_id', id);
        }
        return id;
    }

    WORKSPACE_ID = getWorkspaceId();

    if (!WORKSPACE_ID) {
        console.error('No workspace ID found. Redirecting to workspace selection.');
        window.location.replace('../WorkSpace/workspace.html');
        return;
    }

    // API Functions
    function getCurrentUserDummyId() {
        return localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001';
    }

    function apiHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Current-User-Dummy-ID': getCurrentUserDummyId()
        };
    }

    async function loadWorkspaceDashboard() {
        try {
            var response = await fetch(API_BASE + '/api/workspaces/' + WORKSPACE_ID, {
                headers: apiHeaders()
            });

            if (!response.ok) {
                var error = await response.json().catch(() => ({}));
                console.error('Failed to load workspace:', error);
                alert('Failed to load workspace: ' + (error.detail || 'Unknown error'));
                window.location.replace('../WorkSpace/workspace.html');
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error loading workspace:', error);
            alert('Error loading workspace. Make sure backend is running on http://localhost:8000');
            return null;
        }
    }

    async function inviteMember(identifier, role) {
        try {
            var response = await fetch(API_BASE + '/api/workspaces/' + WORKSPACE_ID + '/members', {
                method: 'POST',
                headers: apiHeaders(),
                body: JSON.stringify({
                    dummy_id: identifier,
                    email: identifier,
                    role: role || 'Editor'
                })
            });

            if (!response.ok) {
                var error = await response.json().catch(() => ({}));
                throw new Error(error.detail || error.error || 'Failed to invite member');
            }

            return await response.json();
        } catch (error) {
            console.error('Error inviting member:', error);
            throw error;
        }
    }

    async function validateDummyId(dummyId) {
        try {
            var response = await fetch(API_BASE + '/api/users/validate?dummy_id=' + encodeURIComponent(dummyId), {
                headers: apiHeaders()
            });

            if (!response.ok) {
                var error = await response.json().catch(() => ({}));
                throw new Error(error.detail || 'Dummy ID not found');
            }

            return await response.json();
        } catch (error) {
            console.error('Error validating Dummy ID:', error);
            throw error;
        }
    }

    async function updateMemberRole(userId, newRole) {
        try {
            var response = await fetch(
                API_BASE + '/api/workspaces/' + WORKSPACE_ID + '/members/' + userId,
                {
                    method: 'PUT',
                    headers: apiHeaders(),
                    body: JSON.stringify({ role: newRole })
                }
            );

            if (!response.ok) {
                var error = await response.json().catch(() => ({}));
                throw new Error(error.detail || error.error || 'Failed to update role');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating member role:', error);
            throw error;
        }
    }

    async function removeMember(userId) {
        try {
            var response = await fetch(
                API_BASE + '/api/workspaces/' + WORKSPACE_ID + '/members/' + userId,
                {
                    method: 'DELETE',
                    headers: apiHeaders()
                }
            );

            if (!response.ok) {
                var error = await response.json().catch(() => ({}));
                throw new Error(error.detail || error.error || 'Failed to remove member');
            }

            return await response.json();
        } catch (error) {
            console.error('Error removing member:', error);
            throw error;
        }
    }

    // Member Card Rendering
    function renderMemberCard(member) {
        var user = member.user;
        var avatar = user.avatar_url 
            ? '<img class="w-12 h-12 rounded-full object-cover shadow-sm" src="' + escapeHtml(user.avatar_url) + '" alt="' + escapeHtml(user.name) + '" />'
            : '<div class="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center shadow-sm"><span class="font-label-md text-[16px] font-bold text-primary-container">' + (user.name.charAt(0).toUpperCase() || '?') + '</span></div>';

        var cardHtml = '<div class="flex items-center justify-between p-4 bg-dashboard-bg shadow-neumorphic rounded-2xl border border-white/40" data-user-id="' + member.user_id + '">'
            + '<div class="flex items-center gap-4">'
            +   avatar
            +   '<div class="flex flex-col">'
            +     '<p class="font-label-md text-[14px] text-on-surface font-semibold leading-tight mb-1">' + escapeHtml(user.name) + '</p>'
            +     '<p class="font-body-sm text-[13px] text-on-surface-variant leading-tight">' + escapeHtml(user.email || user.dummy_id) + '</p>'
            +   '</div>'
            + '</div>'
            + '<div class="relative">'
            +   '<select class="h-8 pl-3 pr-8 bg-transparent border-none font-label-sm text-[13px] text-primary-container appearance-none cursor-pointer outline-none font-semibold member-role-select" data-user-id="' + member.user_id + '">'
            +     '<option value="Admin"' + (member.role === 'Admin' ? ' selected' : '') + '>Admin</option>'
            +     '<option value="Editor"' + (member.role === 'Editor' ? ' selected' : '') + '>Editor</option>'
            +     '<option value="Viewer"' + (member.role === 'Viewer' ? ' selected' : '') + '>Viewer</option>'
            +   '</select>'
            +   '<span class="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-primary-container pointer-events-none text-[18px]">expand_more</span>'
            + '</div>'
            + '</div>';

        return cardHtml;
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function updateWorkspaceMeta(data) {
        var workspaceNameEl = document.getElementById('chat-workspace-name');
        var workspaceMetaEl = document.getElementById('chat-workspace-meta');

        if (workspaceNameEl && data.name) {
            workspaceNameEl.textContent = data.name;
        }

        if (workspaceMetaEl) {
            var memberCount = (data.members ? data.members.length : 0) || data.member_count || 0;
            workspaceMetaEl.textContent = memberCount + (memberCount === 1 ? ' member' : ' members');
        }
    }

    // Update team highlights cards based on member count
    function updateTeamHighlights(memberCount) {
        // Find the "Team Highlights" section
        var highlightsSection = document.querySelector('.grid.grid-cols-1.xl\\:grid-cols-2.gap-4.sm\\:gap-6');
        if (!highlightsSection) return;

        // Clear existing cards but keep the structure
        var cards = highlightsSection.querySelectorAll('.bg-surface.shadow-card-soft.rounded-3xl');
        
        // If there are more than 1 member, show all cards, otherwise show only 1
        var cardsToShow = Math.min(cards.length, Math.max(1, memberCount));
        
        cards.forEach(function(card, index) {
            if (index < cardsToShow) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function attachRoleHandlers(memberListEl) {
        var roleSelects = memberListEl.querySelectorAll('.member-role-select');
        roleSelects.forEach(function(select) {
            select.addEventListener('change', async function() {
                var userId = parseInt(this.dataset.userId);
                var newRole = this.value;

                try {
                    await updateMemberRole(userId, newRole);
                    console.log('Member role updated successfully');
                    await refreshMembers(); // refresh to show updated state
                } catch (error) {
                    alert('Error updating role: ' + error.message);
                    await refreshMembers(); // restore the correct role from the database
                }
            });
        });
    }

    async function refreshMembers() {
        var data = await loadWorkspaceDashboard();
        if (!data) {
            return;
        }
        updateWorkspaceMeta(data);

        // Update team highlights based on member count
        var memberCount = (data.members ? data.members.length : 0) || data.member_count || 0;
        updateTeamHighlights(memberCount);

        var memberListEl = document.querySelector('.max-h-\\[300px\\]');
        if (memberListEl && data.members) {
            memberListEl.innerHTML = data.members.map(renderMemberCard).join('');
            attachRoleHandlers(memberListEl);
        }
    }

    function connectMemberSocket() {
        if (!WORKSPACE_ID || typeof WebSocket === 'undefined') {
            return;
        }
        var wsUrl = API_BASE.replace(/^http/, 'ws') + '/ws/' + WORKSPACE_ID;
        var socket = new WebSocket(wsUrl);
        socket.onmessage = function(event) {
            try {
                var msg = JSON.parse(event.data);
                if (msg.type === 'members_updated') {
                    refreshMembers();
                }
            } catch (err) {
                // ignore malformed frames
            }
        };
        socket.onclose = function() {
            setTimeout(connectMemberSocket, 3000); // auto-reconnect
        };
    }

    // Initialize Dashboard
    async function initDashboard() {
        if (window.__neuroNexDashboardInitialized__) {
            return;
        }
        window.__neuroNexDashboardInitialized__ = true;

        console.log('Initializing dashboard for workspace:', WORKSPACE_ID);

        // Load workspace data
        var workspaceData = await loadWorkspaceDashboard();
        if (!workspaceData) {
            return;
        }

        console.log('Workspace data:', workspaceData);

        // Update workspace name and member count
        updateWorkspaceMeta(workspaceData);

        // Update team highlights based on member count
        var memberCount = (workspaceData.members ? workspaceData.members.length : 0) || workspaceData.member_count || 0;
        updateTeamHighlights(memberCount);

        // Render member list dynamically (all data from the database)
        await refreshMembers();

        // Real-time updates: refresh when members are added/removed anywhere
        connectMemberSocket();

        // Handle invite form submission
        var inviteInput = document.querySelector('input[placeholder="Enter Dummy ID"], input[type="text"], input[type="email"]');
        var inviteBtn = null;
        var allButtons = document.querySelectorAll('button');
        for (var i = 0; i < allButtons.length; i++) {
            if (allButtons[i].textContent && allButtons[i].textContent.trim().toLowerCase() === 'invite') {
                inviteBtn = allButtons[i];
                break;
            }
        }

        if (!inviteBtn) {
            var modalContent = document.getElementById('invite-modal-content');
            if (modalContent) {
                var modalButtons = modalContent.querySelectorAll('button');
                for (var j = 0; j < modalButtons.length; j++) {
                    if (modalButtons[j].textContent && modalButtons[j].textContent.trim().toLowerCase() === 'invite') {
                        inviteBtn = modalButtons[j];
                        break;
                    }
                }
            }
        }

        if (inviteInput && inviteBtn) {
            async function handleInvite(e) {
                if (e) e.preventDefault();
                var identifier = inviteInput.value.trim();
                
                if (!identifier) {
                    alert('Please enter an email or Dummy ID (e.g., teammate@example.com or NN-1001)');
                    inviteInput.focus();
                    return;
                }

                var roleSelect = document.querySelector('select.member-role-select');
                var role = roleSelect && roleSelect.value ? roleSelect.value : 'Editor';

                try {
                    inviteBtn.disabled = true;
                    var originalText = inviteBtn.textContent;
                    inviteBtn.textContent = 'Inviting…';

                    await inviteMember(identifier, role);
                    alert('Teammate invited successfully!');

                    inviteInput.value = '';
                    // Refresh member cards + member count straight from the database
                    await refreshMembers();

                    var modal = document.getElementById('invite-modal-overlay');
                    if (modal) {
                        modal.classList.remove('active');
                    }
                } catch (error) {
                    alert('Error inviting member: ' + (error.message || error));
                } finally {
                    inviteBtn.disabled = false;
                    inviteBtn.textContent = 'Invite';
                }
            }

            inviteBtn.addEventListener('click', handleInvite);
            inviteInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInvite(e);
                }
            });
        }

        console.log('Dashboard initialized successfully');
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initDashboard);
    
    // Also try to initialize if DOM is already ready
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initDashboard();
    }

})();