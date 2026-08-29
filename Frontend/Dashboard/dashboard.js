

tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "tertiary-container": "#9b6500",
                "on-secondary-fixed": "#1a1a2b",
                "secondary-fixed-dim": "#c7c4db",
                "on-surface": "#1a1b21",
                "on-tertiary": "#ffffff",
                "inverse-primary": "#cabeff",
                "secondary-fixed": "#e3e0f8",
                "tertiary": "#7a4f00",
                "on-primary": "#ffffff",
                "surface-container-low": "#f4f3fb",
                "tertiary-fixed-dim": "#ffb955",
                "inverse-on-surface": "#f1f0f8",
                "surface-container-highest": "#e2e2e9",
                "primary": "#593bce",
                "on-error": "#ffffff",
                "surface-dim": "#dad9e1",
                "on-error-container": "#93000a",
                "background": "#faf8ff",
                "on-background": "#1a1b21",
                "on-tertiary-fixed-variant": "#633f00",
                "secondary-container": "#e0ddf5",
                "outline-variant": "#c9c4d7",
                "surface": "#faf8ff",
                "primary-container": "#7257e8",
                "on-secondary-container": "#626075",
                "on-primary-fixed-variant": "#4723bc",
                "surface-container": "#eeedf5",
                "on-tertiary-fixed": "#291800",
                "tertiary-fixed": "#ffddb4",
                "on-secondary-fixed-variant": "#464558",
                "surface-container-lowest": "#ffffff",
                "on-primary-container": "#f9f3ff",
                "primary-fixed-dim": "#cabeff",
                "on-surface-variant": "#484554",
                "on-secondary": "#ffffff",
                "inverse-surface": "#2f3036",
                "error": "#ba1a1a",
                "error-container": "#ffdad6",
                "on-tertiary-container": "#fff4ea",
                "primary-fixed": "#e6deff",
                "surface-container-high": "#e8e7ef",
                "surface-bright": "#faf8ff",
                "surface-tint": "#6043d5",
                "surface-variant": "#e2e2e9",
                "on-primary-fixed": "#1c0062",
                "outline": "#797586",
                "secondary": "#5e5c70",

                "dashboard-bg": "#F5F4FC",
                "neumorph-shadow": "rgba(70, 60, 120, 0.08)",
                "neumorph-highlight": "rgba(255, 255, 255, 0.8)",
                "inset-shadow": "rgba(70, 60, 120, 0.06)",
                "inset-highlight": "rgba(255, 255, 255, 0.9)"
            },
            "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
                "full": "9999px"
            },
            "spacing": {
                "base": "8px",
                "gutter": "24px",
                "container-margin": "32px",
                "md": "24px",
                "xs": "4px",
                "sm": "12px",
                "xl": "64px",
                "lg": "40px"
            },
            "fontFamily": {
                "sans": ["Inter", "sans-serif"],
                "headline-sm": ["Inter"],
                "label-sm": ["Inter"],
                "headline-lg-mobile": ["Inter"],
                "body-sm": ["Inter"],
                "headline-lg": ["Inter"],
                "body-md": ["Inter"],
                "body-lg": ["Inter"],
                "display-lg": ["Inter"],
                "label-md": ["Inter"],
                "headline-md": ["Inter"]
            },
            "fontSize": {
                "headline-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
                "label-sm": ["12px", { "lineHeight": "1.2", "letterSpacing": "0.02em", "fontWeight": "500" }],
                "headline-lg-mobile": ["28px", { "lineHeight": "1.2", "fontWeight": "700" }],
                "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
                "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
                "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                "label-md": ["14px", { "lineHeight": "1.2", "fontWeight": "600" }],
                "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }]
            },
            "boxShadow": {
                "neumorphic": "inset -4px -4px 12px rgba(255, 255, 255, 0.8), 0 8px 24px rgba(70, 60, 120, 0.08)",
                "neumorphic-inset": "inset 4px 4px 8px rgba(70, 60, 120, 0.06), inset -4px -4px 8px rgba(255, 255, 255, 0.9)",
                "neumorphic-hover": "inset -4px -4px 12px rgba(255, 255, 255, 0.9), 0 12px 32px rgba(70, 60, 120, 0.12)",
                "card-soft": "0 8px 30px rgba(70, 60, 120, 0.05), inset -2px -2px 6px rgba(255, 255, 255, 0.9), inset 2px 2px 6px rgba(255, 255, 255, 0.5)",
                "card-soft-hover": "0 12px 40px rgba(70, 60, 120, 0.08), inset -2px -2px 6px rgba(255, 255, 255, 1), inset 2px 2px 6px rgba(255, 255, 255, 0.6)",
            }
        }
    }
}
const addBtn = document.getElementById('add-btn');
const addMenu = document.getElementById('add-menu');
const addIcon = document.getElementById('add-icon');

const closeAddMenu = () => {
    addMenu.classList.remove('add-menu-enter-active');
    addMenu.classList.add('add-menu-exit-active');
    addIcon.classList.remove('rotate-45');
    setTimeout(() => {
        addMenu.classList.add('hidden');
        addMenu.classList.remove('add-menu-exit-active');
        addMenu.classList.add('add-menu-enter');
    }, 150);
};

addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (addMenu.classList.contains('hidden')) {
        addMenu.classList.remove('hidden');
        addIcon.classList.add('rotate-45');
        setTimeout(() => {
            addMenu.classList.remove('add-menu-enter');
            addMenu.classList.add('add-menu-enter-active');
        }, 10);
    } else {
        closeAddMenu();
    }
});

const profileBtn = document.getElementById('profile-btn');
const profileDropdown = document.getElementById('profile-dropdown');

const closeProfileMenu = () => {
    profileDropdown.classList.remove('dropdown-enter-active');
    profileDropdown.classList.add('dropdown-exit-active');
    setTimeout(() => {
        profileDropdown.classList.add('hidden');
        profileDropdown.classList.remove('dropdown-exit-active');
        profileDropdown.classList.add('dropdown-enter');
    }, 150);
};

profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (profileDropdown.classList.contains('hidden')) {
        profileDropdown.classList.remove('hidden');
        setTimeout(() => {
            profileDropdown.classList.remove('dropdown-enter');
            profileDropdown.classList.add('dropdown-enter-active');
        }, 10);
    } else {
        closeProfileMenu();
    }
});

const notificationBtn = document.getElementById('notification-btn');
const notificationDropdown = document.getElementById('notification-dropdown');

const closeNotificationMenu = () => {
    notificationDropdown.classList.remove('dropdown-enter-active');
    notificationDropdown.classList.add('dropdown-exit-active');
    setTimeout(() => {
        notificationDropdown.classList.add('hidden');
        notificationDropdown.classList.remove('dropdown-exit-active');
        notificationDropdown.classList.add('dropdown-enter');
    }, 150);
};

notificationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (notificationDropdown.classList.contains('hidden')) {
        notificationDropdown.classList.remove('hidden');
        setTimeout(() => {
            notificationDropdown.classList.remove('dropdown-enter');
            notificationDropdown.classList.add('dropdown-enter-active');
        }, 10);
    } else {
        closeNotificationMenu();
    }
});

// Chat Sidebar Toggle Logic
const chatSidebar = document.getElementById('chat-sidebar');
const closeChatBtn = document.getElementById('close-chat-btn');
const openChatBtn = document.getElementById('open-chat-btn');

if (closeChatBtn && openChatBtn && chatSidebar) {
    closeChatBtn.addEventListener('click', () => {
        chatSidebar.classList.add('-translate-x-full', '-ml-[360px]');
        openChatBtn.classList.remove('-translate-x-full', 'opacity-0', 'pointer-events-none');
        openChatBtn.classList.add('translate-x-0', 'opacity-100');
    });

    openChatBtn.addEventListener('click', () => {
        chatSidebar.classList.remove('-translate-x-full', '-ml-[360px]');
        openChatBtn.classList.add('-translate-x-full', 'opacity-0', 'pointer-events-none');
        openChatBtn.classList.remove('translate-x-0', 'opacity-100');
    });
}

// Modal Logic
const inviteBtn = document.getElementById('invite-btn');
const modalOverlay = document.getElementById('invite-modal-overlay');
const modalContent = document.getElementById('invite-modal-content');

const openModal = () => {
    modalOverlay.classList.add('active');
};

const closeModal = () => {
    modalOverlay.classList.remove('active');
};

if (inviteBtn) {
    inviteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal();
    });
}

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

document.addEventListener('click', (e) => {
    if (addMenu && !addMenu.classList.contains('hidden') && !addMenu.contains(e.target) && e.target !== addBtn && !addBtn.contains(e.target)) {
        closeAddMenu();
    }

    if (profileDropdown && !profileDropdown.classList.contains('hidden') && !profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        closeProfileMenu();
    }

    if (notificationDropdown && !notificationDropdown.classList.contains('hidden') && !notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
        closeNotificationMenu();
    }
});