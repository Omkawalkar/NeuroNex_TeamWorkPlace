// script.js
function toggleDropdown(id) {
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
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 300);
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    const dropdowns = ['profile-dropdown', 'notification-dropdown'];
    dropdowns.forEach(id => {
        const menu = document.getElementById(id);
        if (!menu) return;
        const trigger = menu.closest('.relative')?.querySelector('img, button');
        if (trigger && !trigger.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('opacity-100', 'translate-y-0');
            menu.classList.add('opacity-0', '-translate-y-2');
            setTimeout(() => {
                menu.classList.add('hidden');
            }, 300);
        }
    });
});

// Open button click handlers
document.querySelectorAll('.open-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        window.location.href = '../Dashboard/dashboard.html';
    });
});

// Workspace card click
document.querySelectorAll('.workspace-card').forEach(card => {
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.open-btn')) {
            window.location.href = '../Dashboard/dashboard.html';
        }
    });
});

// Create New Workspace button
const createWorkspaceBtn = document.getElementById('create-workspace-btn') || document.querySelector('button.neumorphic-raised.group');
if (createWorkspaceBtn) {
    createWorkspaceBtn.addEventListener('click', function() {
        window.location.href = '../Dashboard/dashboard.html';
    });
}