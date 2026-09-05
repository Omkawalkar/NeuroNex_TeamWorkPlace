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

    // =====================================================================
    // CHAT SIDEBAR TOGGLE — FIXED LAYOUT REFLOW
    // =====================================================================
    const chatSidebar = document.getElementById('chat-sidebar');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const openChatBtn = document.getElementById('open-chat-btn');
    const floatingControls = document.getElementById('floating-sidebar-controls');
    const mainContent = document.getElementById('main-content');
    const mobileChatToggle = document.getElementById('mobile-chat-toggle');

    function updateChatToggleAccessibility(isClosed) {
        if (closeChatBtn) closeChatBtn.setAttribute('aria-expanded', String(!isClosed));
        if (openChatBtn) openChatBtn.setAttribute('aria-expanded', String(!isClosed));
        if (mobileChatToggle) mobileChatToggle.setAttribute('aria-expanded', String(!isClosed));
    }

    function closeChatSidebar() {
        if (!chatSidebar) return;
        chatSidebar.classList.add('closed');
        // Expand main content to fill 100%
        if (mainContent) {
            mainContent.classList.add('main-expanded');
        }
        // Show the floating controls group (desktop)
        if (floatingControls) {
            floatingControls.classList.remove('-translate-x-full', 'opacity-0', 'pointer-events-none');
            floatingControls.classList.add('translate-x-0', 'opacity-100');
        }
        updateChatToggleAccessibility(true);
    }

    function openChatSidebar() {
        if (!chatSidebar) return;
        chatSidebar.classList.remove('closed');
        // Shrink main content back to 70%
        if (mainContent) {
            mainContent.classList.remove('main-expanded');
        }
        // Hide the floating controls group
        if (floatingControls) {
            floatingControls.classList.add('-translate-x-full', 'opacity-0', 'pointer-events-none');
            floatingControls.classList.remove('translate-x-0', 'opacity-100');
        }
        updateChatToggleAccessibility(false);
    }

    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', closeChatSidebar);
    }
    if (openChatBtn) {
        openChatBtn.addEventListener('click', openChatSidebar);
    }
    if (mobileChatToggle) {
        mobileChatToggle.addEventListener('click', openChatSidebar);
    }

    // On mobile, start with chat closed
    if (window.innerWidth < 1024 && chatSidebar) {
        closeChatSidebar();
    } else {
        updateChatToggleAccessibility(false);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && chatSidebar && !chatSidebar.classList.contains('closed')) {
            closeChatSidebar();
        }
    });

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

    if(inviteBtn) {
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

// =====================================================================
// Team Workspace Chat - live, persisted via the FastAPI + WebSocket backend
// =====================================================================
(function () {
    'use strict';

    var API_BASE = (window.location.port === '8000')
        ? window.location.origin
        : 'http://localhost:8000';

    var LOGIN_URL = '../Create_account/create.html';
    var WORKSPACE_URL = '../WorkSpace/workspace.html';
    var CURRENT_USER_DUMMY_ID = localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001';
    var TYPING_TIMEOUT_MS = 3000;

    var chatMessages = document.getElementById('chat-messages');
    var chatComposer = document.getElementById('chat-composer');
    var chatInput = document.getElementById('chat-input');
    var sendBtn = document.getElementById('send-btn');
    var loadingEl = document.getElementById('chat-loading');
    var errorEl = document.getElementById('chat-error');
    var emojiBtn = document.getElementById('emoji-btn');
    var voiceBtn = document.getElementById('voice-btn');
    var replyPreviewContainer = document.getElementById('reply-preview-container');

    var currentUserId = null;
    var currentWorkspaceId = (function () {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('workspace_id') || sessionStorage.getItem('workspace_id');
        if (id) sessionStorage.setItem('workspace_id', id);
        return id ? Number(id) : null;
    })();
    var renderedIds = {};
    var lastDivider = null;
    var ws = null;
    var typingTimeout = null;
    var isTyping = false;
    var typingUsers = {};
    var replyingTo = null; // { id, username, text }
    var messageReactions = {}; // msgId -> { emoji: count }
    var pollVotes = {}; // pollId -> selectedIndex
    var messageElements = {}; // msgId -> DOM element
    var isRecording = false;

    // =====================================================================
    // EMOJI DATA — 150+ working emojis across 8 categories
    // =====================================================================
    var emojiCategories = [
        {
            name: '😀',
            label: 'Smileys',
            emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','🫡','😏','😒','🙄','😬','😮‍💨','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥴','😵','🤯','🥳','🤠','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','☹️','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖']
        },
        {
            name: '👋',
            label: 'Gestures',
            emojis: ['👍','👎','👌','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','✋','🤚','🖐️','🖖','👋','🤝','🫶','🙏','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','💪','🦾','🦿','🖕','✍️','🫳','🫴','🤌','🫱','🫲']
        },
        {
            name: '❤️',
            label: 'Hearts',
            emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','❤️‍🔥','❤️‍🩹','💯','💢','💥','💫','💦','💨','🕳️','💣','💬','👁️‍🗨️','🗨️','🗯️','💭','💤']
        },
        {
            name: '🐶',
            label: 'Animals',
            emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️']
        },
        {
            name: '🍕',
            label: 'Food',
            emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪']
        },
        {
            name: '🚗',
            label: 'Travel',
            emojis: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🚲','🛴','🛹','🛼','🚁','🛸','🚀','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','✈️','🛩️','🪂','🌍','🌎','🌏','🌐','🗺️','🧭','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️']
        },
        {
            name: '⚽',
            label: 'Activities',
            emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤸','🤺','⛹️','🏇','🧗','🚴','🚵','🤹']
        },
        {
            name: '🔥',
            label: 'Objects',
            emojis: ['🔥','⭐','🌟','✨','💫','🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','🎯','🎮','🕹️','🎲','🧩','♟️','🎭','🎨','🎬','🎤','🎧','🎼','🎵','🎶','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','💎','🔔','🔕','📣','📢','🔮','🧿','🪬','📌','📎','✏️','📝','📁','📂','📅','📆','📈','📊','💬','💭','🗯️','🗨️','📱','💻','⌨️','🖥️','🖨️','🖱️','💡','🔦','🕯️','🪔','🧯','🛒','💰','💳','✉️','📧','📦']
        }
    ];

    // Quick reactions for message hover
    var quickReactions = ['👍','❤️','😂','😮','😢','🔥'];

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showError(message) {
        if (!errorEl) return;
        errorEl.classList.remove('hidden');
        errorEl.querySelector('span').textContent = message;
        clearTimeout(showError._timer);
        showError._timer = setTimeout(function () {
            errorEl.classList.add('hidden');
        }, 3500);
    }

    function formatTime(createdAt) {
        var d = new Date(createdAt);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    function dayKey(createdAt) {
        var d = new Date(createdAt);
        if (isNaN(d.getTime())) return 'Today';
        var today = new Date();
        var startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        var startMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        var days = Math.round((startToday - startMsg) / 86400000);
        if (days <= 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return d.toLocaleDateString([], { weekday: 'long' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    function avatarHtml(msg) {
        if (msg.avatar) {
            return '<img class="chat-avatar" src="'
                + escapeHtml(msg.avatar)
                + '" alt="">';
        }
        var name = (msg.username || '?').trim();
        var initial = escapeHtml(name ? name.charAt(0).toUpperCase() : '?');
        return '<div class="chat-avatar chat-avatar-initial">'
            + initial + '</div>';
    }

    // =====================================================================
    // DETECT LINKS & IMAGES IN TEXT
    // =====================================================================
    function processMessageText(text) {
        // Detect URLs
        var urlRegex = /(https?:\/\/[^\s<]+)/g;
        var processed = escapeHtml(text);
        processed = processed.replace(/((https?:\/\/)[^\s&lt;]+)/g, function(url) {
            var cleanUrl = url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
            return '<a href="' + cleanUrl + '" target="_blank" rel="noopener" class="underline opacity-90 hover:opacity-100">' + url + '</a>';
        });
        return processed;
    }

    function isImageUrl(text) {
        return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(text.trim());
    }

    // =====================================================================
    // POLL RENDERING — WhatsApp Style
    // =====================================================================
    function isPollMessage(text) {
        return text && text.startsWith('📊 POLL:');
    }

    function parsePollData(text) {
        // Format: 📊 POLL:question|||option1|||option2|||option3
        var parts = text.replace('📊 POLL:', '').split('|||');
        if (parts.length < 3) return null;
        return {
            question: parts[0],
            options: parts.slice(1)
        };
    }

    function renderPollCard(msg, pollData) {
        var isMine = !!currentUserId && String(msg.user_id) === String(currentUserId);
        var pollId = 'poll-' + msg.id;
        var selectedIdx = pollVotes[pollId];
        var hasVoted = selectedIdx !== undefined;
        var totalVotes = hasVoted ? 1 : 0; // In a real app, this would come from the server
        
        // Generate simulated vote counts for demo
        var voteCounts = pollData.options.map(function(_, i) {
            if (hasVoted && i === selectedIdx) return 1;
            return 0;
        });
        var totalSimulated = voteCounts.reduce(function(a, b) { return a + b; }, 0);

        var optionsHtml = pollData.options.map(function(opt, i) {
            var isSelected = hasVoted && i === selectedIdx;
            var count = voteCounts[i];
            var percent = totalSimulated > 0 ? Math.round((count / totalSimulated) * 100) : 0;
            
            return '<div class="poll-option ' + (isSelected ? 'selected' : '') + (hasVoted ? ' voted' : '') + '" data-poll-id="' + pollId + '" data-option-idx="' + i + '">'
                + (hasVoted ? '<div class="poll-progress-bar" style="width: ' + percent + '%"></div>' : '')
                + '<div class="poll-radio"></div>'
                + '<span class="poll-option-text">' + escapeHtml(opt) + '</span>'
                + (hasVoted ? '<span class="poll-vote-count">' + percent + '%</span>' : '')
                + '</div>';
        }).join('');

        return '<div class="poll-card" id="' + pollId + '">'
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">'
            + '<span class="material-symbols-outlined poll-icon">poll</span>'
            + '<span style="font-size:11px;color:rgba(72,69,84,0.5);font-weight:500;">POLL</span>'
            + '</div>'
            + '<div class="poll-question">' + escapeHtml(pollData.question) + '</div>'
            + optionsHtml
            + '<div class="poll-footer">'
            + '<span class="poll-total">' + totalSimulated + ' vote' + (totalSimulated !== 1 ? 's' : '') + '</span>'
            + '<span style="font-size:11px;color:rgba(72,69,84,0.4);">' + formatTime(msg.created_at) + '</span>'
            + '</div>'
            + '</div>';
    }

    // =====================================================================
    // MESSAGE BUBBLE WITH HOVER ACTIONS, REACTIONS, REPLY QUOTE
    // =====================================================================
    function bubbleHtml(msg) {
        var isMine = !!currentUserId && String(msg.user_id) === String(currentUserId);
        var time = formatTime(msg.created_at);
        var msgId = msg.id;

        // Check if it's a poll message
        if (isPollMessage(msg.text)) {
            var pollData = parsePollData(msg.text);
            if (pollData) {
                var pollCard = renderPollCard(msg, pollData);
                if (isMine) {
                    return '<div class="chat-row chat-row-mine" data-msg-id="' + msgId + '">'
                        + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">'
                        + pollCard
                        + '<div class="chat-meta chat-meta-other" style="padding-right:4px;">'
                        + '<span>' + time + '</span>'
                        + '</div></div></div>';
                }
                return '<div class="chat-row chat-row-other" data-msg-id="' + msgId + '">'
                    + avatarHtml(msg)
                    + '<div style="display:flex;flex-direction:column;gap:4px;">'
                    + '<span class="chat-author">' + escapeHtml(msg.username || 'Unknown') + '</span>'
                    + pollCard
                    + '<div class="chat-meta chat-meta-other">'
                    + '<span>' + time + '</span>'
                    + '</div></div></div>';
            }
        }

        // Check for serialized WhatsApp-style reply
        var replyToData = msg.reply_to || null;
        var rawText = msg.text || '';
        if (rawText.startsWith('↩️[reply:')) {
            var closeBracket = rawText.indexOf('] ');
            if (closeBracket !== -1) {
                try {
                    replyToData = JSON.parse(decodeURIComponent(rawText.substring(9, closeBracket)));
                    rawText = rawText.substring(closeBracket + 2);
                } catch (e) {}
            }
        }

        // Process text for links
        var text = processMessageText(rawText);

        // Check for image URL
        var imagePreview = '';
        if (isImageUrl(rawText)) {
            imagePreview = '<div class="chat-image-preview"><img src="' + escapeHtml(rawText.trim()) + '" alt="Shared image" loading="lazy" /></div>';
        }

        // Reply/quote block (WhatsApp style)
        var quoteHtml = '';
        if (replyToData) {
            quoteHtml = '<div class="whatsapp-quote-card' + (isMine ? ' chat-quote-mine' : '') + '">'
                + '<div class="whatsapp-quote-details">'
                + '<span class="whatsapp-quote-sender">' + escapeHtml(replyToData.username || 'User') + '</span>'
                + '<span class="whatsapp-quote-text">' + escapeHtml(replyToData.text || '') + '</span>'
                + '</div></div>';
        }

        // Reactions bar
        var reactionsHtml = '';
        var reactions = messageReactions[msgId];
        if (reactions && Object.keys(reactions).length > 0) {
            var badges = Object.keys(reactions).map(function(emoji) {
                var count = reactions[emoji];
                var reacted = reactions[emoji + '_mine'] ? ' reacted' : '';
                return '<span class="msg-reaction-badge' + reacted + '" data-msg-id="' + msgId + '" data-emoji="' + emoji + '">'
                    + emoji + '<span class="msg-reaction-count">' + count + '</span></span>';
            }).join('');
            reactionsHtml = '<div class="msg-reaction-bar">' + badges + '</div>';
        }

        // Hover action buttons (reply + react)
        var hoverActions = '<div class="msg-hover-actions">'
            + '<button class="msg-hover-btn" data-action="react" data-msg-id="' + msgId + '" title="React"><span class="material-symbols-outlined" style="font-size:16px;">sentiment_satisfied</span></button>'
            + '<button class="msg-hover-btn" data-action="reply" data-msg-id="' + msgId + '" title="Reply"><span class="material-symbols-outlined" style="font-size:16px;">reply</span></button>'
            + '</div>';

        if (isMine) {
            var tickIcon = (msg.status === 'read') ? 'done_all' : 'done';
            var tickClass = (msg.status === 'read') ? 'chat-tick-read' : 'chat-tick-sent';
            return '<div class="chat-row chat-row-mine" data-msg-id="' + msgId + '">'
                + hoverActions
                + '<div class="chat-bubble chat-bubble-mine">'
                + quoteHtml
                + '<p class="chat-text chat-text-mine">' + text + '</p>'
                + imagePreview
                + '<div class="chat-meta chat-meta-mine">'
                + '<span>' + time + '</span>'
                + '<span class="material-symbols-outlined chat-tick ' + tickClass + '">' + tickIcon + '</span>'
                + '</div></div>'
                + reactionsHtml
                + '</div>';
        }

        return '<div class="chat-row chat-row-other" data-msg-id="' + msgId + '">'
            + avatarHtml(msg)
            + '<div style="display:flex;flex-direction:column;gap:2px;">'
            + hoverActions
            + '<div class="chat-bubble chat-bubble-other">'
            + '<span class="chat-author">' + escapeHtml(msg.username || 'Unknown') + '</span>'
            + quoteHtml
            + '<p class="chat-text chat-text-other">' + text + '</p>'
            + imagePreview
            + '<div class="chat-meta chat-meta-other">'
            + '<span>' + time + '</span>'
            + '</div></div>'
            + reactionsHtml
            + '</div></div>';
    }

    function renderMessages(messages) {
        if (!chatMessages || !Array.isArray(messages)) return;
        if (loadingEl) loadingEl.remove();

        if (messages.length === 0) {
            var emptyState = document.createElement('div');
            emptyState.className = 'chat-empty-state';
            emptyState.innerHTML = '<span class="material-symbols-outlined">chat_bubble_outline</span>'
                + '<p>No messages yet. Start the conversation!</p>';
            chatMessages.appendChild(emptyState);
            return;
        }

        var shouldAutoScroll = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 100;

        messages.forEach(function (msg) {
            if (!msg || !msg.id || renderedIds[msg.id]) return;
            renderedIds[msg.id] = true;

            var key = dayKey(msg.created_at);
            if (key !== lastDivider) {
                lastDivider = key;
                var divider = document.createElement('div');
                divider.className = 'chat-day-divider';
                var label = document.createElement('span');
                label.textContent = key;
                divider.appendChild(label);
                chatMessages.appendChild(divider);
            }

            var wrap = document.createElement('div');
            wrap.innerHTML = bubbleHtml(msg);
            while (wrap.firstChild) {
                var child = wrap.firstChild;
                chatMessages.appendChild(child);
                // Store reference
                if (child.dataset && child.dataset.msgId) {
                    messageElements[child.dataset.msgId] = child;
                }
            }
        });

        if (shouldAutoScroll) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Bind poll click handlers
        bindPollHandlers();
        bindHoverActionHandlers();
    }

    function appendMessage(msg) {
        if (!chatMessages || !msg || !msg.id || renderedIds[msg.id]) return;
        renderedIds[msg.id] = true;

        // Remove empty state if it exists
        var emptyState = chatMessages.querySelector('.chat-empty-state');
        if (emptyState) emptyState.remove();

        var key = dayKey(msg.created_at);
        if (key !== lastDivider) {
            lastDivider = key;
            var divider = document.createElement('div');
            divider.className = 'chat-day-divider';
            var label = document.createElement('span');
            label.textContent = key;
            divider.appendChild(label);
            chatMessages.appendChild(divider);
        }

        var shouldAutoScroll = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 100;

        var wrap = document.createElement('div');
        wrap.innerHTML = bubbleHtml(msg);
        while (wrap.firstChild) {
            var child = wrap.firstChild;
            chatMessages.appendChild(child);
            if (child.dataset && child.dataset.msgId) {
                messageElements[child.dataset.msgId] = child;
            }
        }

        if (shouldAutoScroll) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        bindPollHandlers();
        bindHoverActionHandlers();
    }

    // =====================================================================
    // POLL INTERACTION — Click to vote
    // =====================================================================
    function bindPollHandlers() {
        var pollOptions = document.querySelectorAll('.poll-option:not(.voted)');
        pollOptions.forEach(function(opt) {
            if (opt._bound) return;
            opt._bound = true;
            opt.addEventListener('click', function() {
                var pollId = opt.dataset.pollId;
                var idx = parseInt(opt.dataset.optionIdx);
                pollVotes[pollId] = idx;
                
                // Re-render the poll card
                var pollEl = document.getElementById(pollId);
                if (pollEl) {
                    var siblings = pollEl.querySelectorAll('.poll-option');
                    var totalVotes = 1;
                    siblings.forEach(function(sib, i) {
                        var isSelected = i === idx;
                        sib.classList.add('voted');
                        if (isSelected) {
                            sib.classList.add('selected');
                        } else {
                            sib.classList.remove('selected');
                        }
                        // Add radio fill
                        var radio = sib.querySelector('.poll-radio');
                        if (isSelected && radio) {
                            radio.innerHTML = '';
                            radio.style.background = '#7257e8';
                            radio.style.borderColor = '#7257e8';
                            radio.style.boxShadow = '0 2px 8px rgba(114,87,232,0.3)';
                            var dot = document.createElement('span');
                            dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:white;display:block;';
                            radio.appendChild(dot);
                        }
                        // Add progress bar
                        var percent = isSelected ? 100 : 0;
                        var existingBar = sib.querySelector('.poll-progress-bar');
                        if (!existingBar) {
                            var bar = document.createElement('div');
                            bar.className = 'poll-progress-bar';
                            bar.style.width = '0%';
                            sib.insertBefore(bar, sib.firstChild);
                            setTimeout(function() { bar.style.width = percent + '%'; }, 50);
                        } else {
                            existingBar.style.width = percent + '%';
                        }
                        // Add vote count
                        var existingCount = sib.querySelector('.poll-vote-count');
                        if (!existingCount) {
                            var countEl = document.createElement('span');
                            countEl.className = 'poll-vote-count';
                            countEl.textContent = percent + '%';
                            sib.appendChild(countEl);
                        } else {
                            existingCount.textContent = percent + '%';
                        }
                    });
                    // Update total
                    var footer = pollEl.querySelector('.poll-total');
                    if (footer) {
                        footer.textContent = totalVotes + ' vote';
                    }
                }
            });
        });
    }

    // =====================================================================
    // HOVER ACTIONS — Reply & React
    // =====================================================================
    function bindHoverActionHandlers() {
        // Reply buttons
        document.querySelectorAll('.msg-hover-btn[data-action="reply"]').forEach(function(btn) {
            if (btn._bound) return;
            btn._bound = true;
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var msgId = btn.dataset.msgId;
                var row = btn.closest('.chat-row');
                if (!row) return;
                var author = row.querySelector('.chat-author');
                var text = row.querySelector('.chat-text');
                setReplyTo({
                    id: msgId,
                    username: author ? author.textContent : 'You',
                    text: text ? text.textContent.substring(0, 100) : ''
                });
            });
        });

        // React buttons
        document.querySelectorAll('.msg-hover-btn[data-action="react"]').forEach(function(btn) {
            if (btn._bound) return;
            btn._bound = true;
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                showReactionPicker(btn);
            });
        });
    }

        // Double click on any chat row to reply (WhatsApp style)
        document.querySelectorAll('.chat-row').forEach(function(row) {
            if (row._dblbound) return;
            row._dblbound = true;
            row.addEventListener('dblclick', function() {
                var author = row.querySelector('.chat-author');
                var text = row.querySelector('.chat-text');
                setReplyTo({
                    id: row.dataset.msgId,
                    username: author ? author.textContent : (row.classList.contains('chat-row-mine') ? 'You' : 'User'),
                    text: text ? text.textContent.substring(0, 100) : ''
                });
            });
        });

    // =====================================================================
    // REPLY / QUOTE FEATURE (WhatsApp-Style)
    // =====================================================================
    function setReplyTo(data) {
        replyingTo = data;
        if (!replyPreviewContainer) return;
        replyPreviewContainer.classList.remove('hidden');
        replyPreviewContainer.innerHTML = '<div class="whatsapp-reply-banner">'
            + '<div class="whatsapp-reply-stripe"></div>'
            + '<div class="whatsapp-reply-info">'
            + '<div class="whatsapp-reply-sender">'
            + '<span class="material-symbols-outlined text-[15px] text-primary-container">reply</span>'
            + '<span>' + escapeHtml(data.username) + '</span>'
            + '</div>'
            + '<div class="whatsapp-reply-msg">' + escapeHtml(data.text) + '</div>'
            + '</div>'
            + '<button type="button" class="whatsapp-reply-close" id="cancel-reply" title="Cancel">'
            + '<span class="material-symbols-outlined text-[16px]">close</span>'
            + '</button>'
            + '</div>';
        
        var cancelBtn = document.getElementById('cancel-reply');
        if (cancelBtn) cancelBtn.addEventListener('click', clearReply);
        if (chatInput) {
            chatInput.placeholder = 'Reply to ' + (data.username || 'user') + '...';
            chatInput.focus();
        }
    }

    function clearReply() {
        replyingTo = null;
        if (replyPreviewContainer) {
            replyPreviewContainer.classList.add('hidden');
            replyPreviewContainer.innerHTML = '';
        }
        if (chatInput) {
            chatInput.placeholder = 'Type a message...';
        }
    }

    // =====================================================================
    // REACTION PICKER
    // =====================================================================
    function showReactionPicker(anchorBtn) {
        // Remove any existing picker
        var existing = document.querySelector('.reaction-picker');
        if (existing) existing.remove();

        var picker = document.createElement('div');
        picker.className = 'reaction-picker';
        
        var row = anchorBtn.closest('.chat-row');
        var msgId = anchorBtn.dataset.msgId;

        quickReactions.forEach(function(emoji) {
            var btn = document.createElement('button');
            btn.className = 'reaction-picker-emoji';
            btn.textContent = emoji;
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                addReaction(msgId, emoji);
                picker.remove();
            });
            picker.appendChild(btn);
        });

        // Position near the button
        anchorBtn.style.position = 'relative';
        anchorBtn.parentElement.appendChild(picker);
        picker.style.bottom = '100%';
        picker.style.left = '0';
        picker.style.marginBottom = '4px';

        // Close on outside click
        setTimeout(function() {
            document.addEventListener('click', function closeReaction(e) {
                if (!picker.contains(e.target)) {
                    picker.remove();
                    document.removeEventListener('click', closeReaction);
                }
            });
        }, 10);
    }

    function addReaction(msgId, emoji) {
        if (!messageReactions[msgId]) {
            messageReactions[msgId] = {};
        }
        if (messageReactions[msgId][emoji]) {
            messageReactions[msgId][emoji]++;
        } else {
            messageReactions[msgId][emoji] = 1;
        }
        messageReactions[msgId][emoji + '_mine'] = true;

        // Update UI - find the chat-row and add/update reaction bar
        var row = document.querySelector('.chat-row[data-msg-id="' + msgId + '"]');
        if (!row) return;

        var existingBar = row.querySelector('.msg-reaction-bar');
        if (existingBar) existingBar.remove();

        var reactions = messageReactions[msgId];
        var badges = '';
        Object.keys(reactions).forEach(function(key) {
            if (key.endsWith('_mine')) return;
            var count = reactions[key];
            var reacted = reactions[key + '_mine'] ? ' reacted' : '';
            badges += '<span class="msg-reaction-badge' + reacted + '" data-msg-id="' + msgId + '" data-emoji="' + key + '">'
                + key + '<span class="msg-reaction-count">' + count + '</span></span>';
        });
        
        var bar = document.createElement('div');
        bar.className = 'msg-reaction-bar';
        bar.innerHTML = badges;
        
        // Append after the bubble
        var bubble = row.querySelector('.chat-bubble');
        if (bubble) {
            bubble.parentElement.insertBefore(bar, bubble.nextSibling);
        } else {
            row.appendChild(bar);
        }
    }

    // =====================================================================
    // CONTEXT MENU (Right-click on messages)
    // =====================================================================
    if (chatMessages) {
        chatMessages.addEventListener('contextmenu', function(e) {
            var row = e.target.closest('.chat-row');
            if (!row) return;
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, row);
        });
    }

    function showContextMenu(x, y, row) {
        // Remove existing
        var existing = document.querySelector('.msg-context-menu');
        if (existing) existing.remove();

        var msgId = row.dataset.msgId;
        var textEl = row.querySelector('.chat-text');
        var msgText = textEl ? textEl.textContent : '';
        var authorEl = row.querySelector('.chat-author');
        var authorName = authorEl ? authorEl.textContent : 'You';

        var menu = document.createElement('div');
        menu.className = 'msg-context-menu';
        menu.innerHTML = 
            '<button class="msg-context-item" data-action="reply">'
            + '<span class="material-symbols-outlined">reply</span>Reply'
            + '</button>'
            + '<button class="msg-context-item" data-action="react">'
            + '<span class="material-symbols-outlined">sentiment_satisfied</span>React'
            + '</button>'
            + '<div class="msg-context-divider"></div>'
            + '<button class="msg-context-item" data-action="copy">'
            + '<span class="material-symbols-outlined">content_copy</span>Copy Text'
            + '</button>'
            + '<button class="msg-context-item" data-action="forward">'
            + '<span class="material-symbols-outlined">forward</span>Forward'
            + '</button>';

        document.body.appendChild(menu);

        // Position
        var menuRect = menu.getBoundingClientRect();
        var finalX = Math.min(x, window.innerWidth - menuRect.width - 10);
        var finalY = Math.min(y, window.innerHeight - menuRect.height - 10);
        menu.style.left = finalX + 'px';
        menu.style.top = finalY + 'px';

        // Actions
        menu.querySelector('[data-action="reply"]').addEventListener('click', function() {
            setReplyTo({ id: msgId, username: authorName, text: msgText.substring(0, 100) });
            menu.remove();
        });
        menu.querySelector('[data-action="react"]').addEventListener('click', function() {
            var reactBtn = row.querySelector('.msg-hover-btn[data-action="react"]');
            if (reactBtn) showReactionPicker(reactBtn);
            menu.remove();
        });
        menu.querySelector('[data-action="copy"]').addEventListener('click', function() {
            navigator.clipboard.writeText(msgText).then(function() {
                showError('Copied to clipboard!');
            }).catch(function() {
                showError('Could not copy text.');
            });
            menu.remove();
        });
        menu.querySelector('[data-action="forward"]').addEventListener('click', function() {
            showError('Forward feature coming soon!');
            menu.remove();
        });

        // Close on click outside
        setTimeout(function() {
            document.addEventListener('click', function closeCtx(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeCtx);
                }
            });
        }, 10);
    }

    // =====================================================================
    // VOICE MESSAGE UI
    // =====================================================================
    if (voiceBtn) {
        var voiceTimer = null;
        var voiceSeconds = 0;
        
        voiceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!isRecording) {
                startVoiceRecording();
            } else {
                stopVoiceRecording();
            }
        });

        function startVoiceRecording() {
            isRecording = true;
            voiceSeconds = 0;
            voiceBtn.style.color = '#ef4444';
            
            // Replace input with recording indicator
            if (chatInput) {
                chatInput.style.display = 'none';
                var indicator = document.createElement('div');
                indicator.className = 'voice-recording-indicator';
                indicator.id = 'voice-indicator';
                
                var waveBars = '';
                for (var i = 0; i < 20; i++) {
                    waveBars += '<span style="animation-delay:' + (i * 0.08) + 's;height:' + (4 + Math.random() * 12) + 'px"></span>';
                }
                
                indicator.innerHTML = '<div class="voice-recording-dot"></div>'
                    + '<span class="voice-recording-time" id="voice-time">0:00</span>'
                    + '<div class="voice-recording-wave">' + waveBars + '</div>';
                
                chatInput.parentElement.insertBefore(indicator, chatInput.nextSibling);
            }
            
            voiceTimer = setInterval(function() {
                voiceSeconds++;
                var mins = Math.floor(voiceSeconds / 60);
                var secs = voiceSeconds % 60;
                var timeEl = document.getElementById('voice-time');
                if (timeEl) {
                    timeEl.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
                }
            }, 1000);
        }

        function stopVoiceRecording() {
            isRecording = false;
            clearInterval(voiceTimer);
            voiceBtn.style.color = '';
            
            var indicator = document.getElementById('voice-indicator');
            if (indicator) indicator.remove();
            if (chatInput) {
                chatInput.style.display = '';
                chatInput.focus();
            }
            
            if (voiceSeconds > 0) {
                var mins = Math.floor(voiceSeconds / 60);
                var secs = voiceSeconds % 60;
                sendMessage('🎤 Voice message (' + mins + ':' + (secs < 10 ? '0' : '') + secs + ')');
            }
        }
    }

    // =====================================================================
    // API CALLS
    // =====================================================================
    async function loadMessages() {
        try {
            var res = await fetch(API_BASE + '/api/chat/messages' + (currentWorkspaceId ? '?workspace_id=' + currentWorkspaceId : ''), {
                headers: { 'X-Current-User-Dummy-ID': CURRENT_USER_DUMMY_ID }
            });
            if (res.status === 401) {
                showError('Not authenticated. Please check your Dummy ID.');
                return;
            }
            if (res.status === 400) {
                window.location.replace('../WorkSpace/workspace.html');
                return;
            }
            if (!res.ok) return;
            var data = await res.json();
            if (data.success) renderMessages(data.messages);
        } catch (err) {
            if (loadingEl) {
                loadingEl.innerHTML = '<span class="font-label-sm text-label-sm text-on-surface-variant">Cannot reach the server. Make sure backend is running on http://localhost:8000</span>';
            }
        }
    }

    function updateSendButton() {
        if (sendBtn) sendBtn.disabled = !(chatInput && chatInput.value.trim());
    }

    async function sendMessage(text) {
        if (sendBtn) sendBtn.disabled = true;
        try {
            var sendText = replyingTo ? ('↩️[reply:' + encodeURIComponent(JSON.stringify(replyingTo)) + '] ' + text) : text;
            var body = { text: sendText };
            var res = await fetch(API_BASE + '/api/chat/messages' + (currentWorkspaceId ? '?workspace_id=' + currentWorkspaceId : ''), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Current-User-Dummy-ID': CURRENT_USER_DUMMY_ID
                },
                body: JSON.stringify(body)
            });
            if (res.status === 401) {
                showError('Not authenticated. Please check your Dummy ID.');
                return;
            }
            if (res.status === 400) {
                window.location.replace('../WorkSpace/workspace.html');
                return;
            }
            var data = await res.json().catch(function () { return {}; });
            if (!res.ok) {
                showError(data.message || data.error || 'Could not send the message. Please try again.');
                return;
            }
            chatInput.value = '';
            updateSendButton();
            sendTypingStatus(false);
            clearReply();
            if (chatInput) chatInput.focus();
        } catch (err) {
            showError('Cannot reach the server. Make sure backend is running on http://localhost:8000');
        } finally {
            updateSendButton();
        }
    }

    // WebSocket connection
    function connectWebSocket() {
        if (!currentWorkspaceId) return;
        var wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        var wsUrl = wsProtocol + '//' + window.location.hostname + ':8000/ws/' + currentWorkspaceId;
        ws = new WebSocket(wsUrl);

        ws.onopen = function () {
            console.log('[WS] Connected to workspace', currentWorkspaceId);
        };

        ws.onmessage = function (event) {
            try {
                var data = JSON.parse(event.data);
                handleWebSocketEvent(data);
            } catch (e) {
                console.error('[WS] Parse error:', e);
            }
        };

        ws.onclose = function () {
            console.log('[WS] Disconnected. Reconnecting in 3s...');
            setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = function (err) {
            console.error('[WS] Error:', err);
        };
    }

    function handleWebSocketEvent(data) {
        switch (data.type) {
            case 'chat_message':
                if (data.message && data.message.workspace_id === currentWorkspaceId) {
                    appendMessage(data.message);
                }
                break;
            case 'typing_indicator':
                if (data.workspace_id === currentWorkspaceId && data.user_id !== currentUserId) {
                    handleTypingIndicator(data);
                }
                break;
            case 'members_updated':
                // Refresh member count in chat header
                if (data.workspace_id === currentWorkspaceId) {
                    refreshWorkspaceMeta();
                }
                break;
        }
    }

    // Refresh workspace member count
    async function refreshWorkspaceMeta() {
        try {
            var res = await fetch(API_BASE + '/api/workspaces/' + currentWorkspaceId, {
                headers: { 'X-Current-User-Dummy-ID': CURRENT_USER_DUMMY_ID },
            });
            if (res.ok) {
                var wsMeta = await res.json();
                var nameEl = document.getElementById('chat-workspace-name');
                var metaEl = document.getElementById('chat-workspace-meta');
                if (nameEl && wsMeta.name) nameEl.textContent = wsMeta.name;
                if (metaEl && wsMeta.members) {
                    var memberCount = wsMeta.members.length;
                    metaEl.textContent = memberCount + (memberCount === 1 ? ' member' : ' members');
                }
            }
        } catch (err) {
            // Silently fail - not critical
        }
    }

    // Typing indicators
    function handleTypingIndicator(data) {
        if (data.is_typing) {
            typingUsers[data.user_id] = { username: data.username, timestamp: Date.now() };
        } else {
            delete typingUsers[data.user_id];
        }
        renderTypingIndicator();
    }

    function renderTypingIndicator() {
        var existing = document.getElementById('typing-indicator');
        if (existing) existing.remove();

        var users = Object.values(typingUsers);
        if (users.length === 0) return;

        var text = '';
        if (users.length === 1) {
            text = users[0].username + ' is typing';
        } else if (users.length === 2) {
            text = users[0].username + ' and ' + users[1].username + ' are typing';
        } else {
            text = users.length + ' people are typing';
        }

        var indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'flex items-center gap-2 px-4 py-2';
        indicator.innerHTML = '<div class="typing-dots flex gap-1">'
            + '<span class="w-2 h-2 bg-primary-container/60 rounded-full" style="animation-delay: 0ms"></span>'
            + '<span class="w-2 h-2 bg-primary-container/60 rounded-full" style="animation-delay: 150ms"></span>'
            + '<span class="w-2 h-2 bg-primary-container/60 rounded-full" style="animation-delay: 300ms"></span>'
            + '</div>'
            + '<span class="text-xs text-on-surface-variant">' + escapeHtml(text) + '</span>';

        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Clean up stale typing indicators
        var now = Date.now();
        Object.keys(typingUsers).forEach(function (uid) {
            if (now - typingUsers[uid].timestamp > TYPING_TIMEOUT_MS) {
                delete typingUsers[uid];
            }
        });
    }

    function sendTypingStatus(typing) {
        if (typing === isTyping) return;
        isTyping = typing;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'typing_indicator',
                user_id: currentUserId,
                username: localStorage.getItem('neuronex_name') || 'User',
                is_typing: typing
            }));
        }
    }

    // =====================================================================
    // EMOJI PICKER — NEUMORPHIC WITH SEARCH, 150+ EMOJIS, 8 CATEGORIES
    // =====================================================================
    function createEmojiPicker() {
        var picker = document.createElement('div');
        picker.id = 'emoji-picker';
        picker.className = 'absolute bottom-[74px] left-3 right-3 sm:left-auto sm:right-6 sm:w-80 z-50 hidden shadow-2xl';

        // Search bar
        var searchContainer = document.createElement('div');
        searchContainer.className = 'p-3 pb-1';
        searchContainer.style.position = 'relative';
        var searchIcon = document.createElement('span');
        searchIcon.className = 'material-symbols-outlined';
        searchIcon.textContent = 'search';
        searchIcon.style.cssText = 'position:absolute;left:24px;top:50%;transform:translateY(-50%);font-size:18px;color:rgba(72,69,84,0.4);pointer-events:none;';
        var searchInput = document.createElement('input');
        searchInput.className = 'emoji-search-input';
        searchInput.placeholder = 'Search emojis...';
        searchInput.style.paddingLeft = '36px';
        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);
        picker.appendChild(searchContainer);

        // Category tabs
        var tabs = document.createElement('div');
        tabs.className = 'flex gap-1 px-3 py-2 overflow-x-auto scrollbar-hide';
        var tabButtons = [];
        
        emojiCategories.forEach(function (cat, i) {
            var tab = document.createElement('button');
            tab.className = 'px-2 py-1.5 text-lg rounded-xl whitespace-nowrap transition-all duration-200 flex-shrink-0 ' + (i === 0 ? 'emoji-tab-active' : 'hover:bg-surface-container-highest');
            tab.textContent = cat.name;
            tab.title = cat.label;
            tab.onclick = function () {
                tabButtons.forEach(function (b) { b.className = 'px-2 py-1.5 text-lg rounded-xl whitespace-nowrap transition-all duration-200 flex-shrink-0 hover:bg-surface-container-highest'; });
                tab.className = 'px-2 py-1.5 text-lg rounded-xl whitespace-nowrap transition-all duration-200 flex-shrink-0 emoji-tab-active';
                renderEmojiGrid(cat.emojis, cat.label);
                searchInput.value = '';
            };
            tabButtons.push(tab);
            tabs.appendChild(tab);
        });
        picker.appendChild(tabs);

        // Category label
        var catLabel = document.createElement('div');
        catLabel.id = 'emoji-cat-label';
        catLabel.className = 'px-4 py-1';
        catLabel.style.cssText = 'font-size:11px;font-weight:600;color:rgba(72,69,84,0.5);text-transform:uppercase;letter-spacing:0.05em;';
        catLabel.textContent = emojiCategories[0].label;
        picker.appendChild(catLabel);

        // Grid
        var grid = document.createElement('div');
        grid.id = 'emoji-grid';
        grid.className = 'grid grid-cols-8 gap-0.5 px-2 pb-3 max-h-56 overflow-y-auto chat-scroll';
        picker.appendChild(grid);

        function renderEmojiGrid(emojis, label) {
            grid.innerHTML = '';
            if (label) {
                var labelEl = document.getElementById('emoji-cat-label');
                if (labelEl) labelEl.textContent = label;
            }
            emojis.forEach(function (emoji) {
                var btn = document.createElement('button');
                btn.className = 'emoji-btn';
                btn.textContent = emoji;
                btn.onclick = function () {
                    if (chatInput) {
                        chatInput.value += emoji;
                        chatInput.focus();
                        updateSendButton();
                    }
                };
                grid.appendChild(btn);
            });
        }

        // Search functionality
        searchInput.addEventListener('input', function() {
            var query = searchInput.value.toLowerCase().trim();
            if (!query) {
                // Reset to first category
                renderEmojiGrid(emojiCategories[0].emojis, emojiCategories[0].label);
                tabButtons[0].click();
                return;
            }
            // Search across all categories
            var results = [];
            emojiCategories.forEach(function(cat) {
                cat.emojis.forEach(function(emoji) {
                    if (results.length < 50) results.push(emoji);
                });
            });
            // For a real search, you'd need emoji name mapping
            // For now, show all emojis as search results
            var labelEl = document.getElementById('emoji-cat-label');
            if (labelEl) labelEl.textContent = 'Search Results';
            grid.innerHTML = '';
            results.forEach(function(emoji) {
                var btn = document.createElement('button');
                btn.className = 'emoji-btn';
                btn.textContent = emoji;
                btn.onclick = function() {
                    if (chatInput) {
                        chatInput.value += emoji;
                        chatInput.focus();
                        updateSendButton();
                    }
                };
                grid.appendChild(btn);
            });
        });

        renderEmojiGrid(emojiCategories[0].emojis, emojiCategories[0].label);

        // Add button menu items
        var globalAddBtn = window.addBtn || document.getElementById('add-btn');
        var globalAddMenu = window.addMenu || document.getElementById('add-menu');
        if (globalAddBtn && globalAddMenu) {
            var menuItems = globalAddMenu.querySelectorAll('button');
            menuItems.forEach(function (item) {
                item.addEventListener('click', function () {
                    var action = item.querySelector('span:last-child').textContent.trim();
                    handleMenuAction(action);
                    globalAddMenu.classList.add('hidden');
                });
            });
        }

        return picker;
    }

    function handleMenuAction(action) {
        switch (action) {
            case 'Upload Document':
                triggerFileUpload('application/pdf,.doc,.docx,.txt,.rtf');
                break;
            case 'Upload Image':
                triggerFileUpload('image/*');
                break;
            case 'Video Upload':
                triggerFileUpload('video/*');
                break;
            case 'Add Poll':
                showPollCreator();
                break;
            case 'More':
                showError('More options coming soon!');
                break;
        }
    }

    function triggerFileUpload(accept) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.onchange = function (e) {
            var file = e.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) {
                    showError('File too large. Maximum size is 10MB.');
                    return;
                }
                sendMessage('[File: ' + file.name + ']');
            }
        };
        input.click();
    }

    // =====================================================================
    // POLL CREATOR — NEUMORPHIC WHATSAPP STYLE
    // =====================================================================
    function showPollCreator() {
        var modal = document.createElement('div');
        modal.className = 'poll-modal-overlay';
        
        var optionCount = 2;
        var optionsHtml = '';
        for (var i = 1; i <= optionCount; i++) {
            optionsHtml += '<div class="flex items-center gap-2 mb-2">'
                + '<div class="poll-radio" style="pointer-events:none;flex-shrink:0;width:16px;height:16px;"></div>'
                + '<input class="poll-modal-option-input poll-opt-input" placeholder="Option ' + i + '" />'
                + '</div>';
        }

        modal.innerHTML = '<div class="poll-modal">'
            + '<div class="poll-modal-title">Create Poll</div>'
            + '<div class="poll-modal-subtitle">Ask your team a question and collect their votes</div>'
            + '<input id="poll-q-input" class="poll-modal-input" placeholder="Ask a question..." />'
            + '<div style="margin-top:16px;">'
            + '<div style="font-size:12px;font-weight:600;color:rgba(72,69,84,0.6);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em;">Options</div>'
            + '<div id="poll-opts-container">' + optionsHtml + '</div>'
            + '<button class="poll-modal-add-btn" id="poll-add-opt">'
            + '<span class="material-symbols-outlined" style="font-size:18px;">add_circle</span> Add option'
            + '</button>'
            + '</div>'
            + '<div class="poll-modal-actions">'
            + '<button class="poll-modal-cancel" id="poll-cancel-btn">Cancel</button>'
            + '<button class="poll-modal-send" id="poll-send-btn">'
            + '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px;">poll</span>Create Poll'
            + '</button>'
            + '</div>'
            + '</div>';

        document.body.appendChild(modal);

        // Focus first input
        setTimeout(function() {
            var qInput = modal.querySelector('#poll-q-input');
            if (qInput) qInput.focus();
        }, 100);

        modal.querySelector('#poll-cancel-btn').onclick = function () { modal.remove(); };
        
        modal.querySelector('#poll-add-opt').onclick = function () {
            var container = modal.querySelector('#poll-opts-container');
            var count = container.querySelectorAll('.poll-opt-input').length;
            if (count < 8) {
                var newOpt = document.createElement('div');
                newOpt.className = 'flex items-center gap-2 mb-2';
                newOpt.innerHTML = '<div class="poll-radio" style="pointer-events:none;flex-shrink:0;width:16px;height:16px;"></div>'
                    + '<input class="poll-modal-option-input poll-opt-input" placeholder="Option ' + (count + 1) + '" />';
                container.appendChild(newOpt);
                newOpt.querySelector('input').focus();
            }
            if (count + 1 >= 8) {
                modal.querySelector('#poll-add-opt').style.display = 'none';
            }
        };
        
        modal.querySelector('#poll-send-btn').onclick = function () {
            var question = modal.querySelector('#poll-q-input').value.trim();
            var options = Array.from(modal.querySelectorAll('.poll-opt-input'))
                .map(function (i) { return i.value.trim(); })
                .filter(Boolean);
            if (!question || options.length < 2) {
                showError('Please enter a question and at least 2 options.');
                return;
            }
            // Send as special poll format
            var pollText = '📊 POLL:' + question + '|||' + options.join('|||');
            sendMessage(pollText);
            modal.remove();
        };
        
        modal.onclick = function (e) { if (e.target === modal) modal.remove(); };
    }

    // Message input handler
    if (chatInput) {
        chatInput.addEventListener('input', function () {
            updateSendButton();

            // Typing indicator
            if (chatInput.value.trim()) {
                sendTypingStatus(true);
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(function () { sendTypingStatus(false); }, TYPING_TIMEOUT_MS);
            } else {
                sendTypingStatus(false);
            }
        });
    }

    if (chatComposer && chatInput) {
        chatComposer.addEventListener('submit', function (e) {
            e.preventDefault();
            var text = chatInput.value.trim();
            if (text) sendMessage(text);
        });
    }

    // Emoji picker setup
    if (emojiBtn && chatInput && chatSidebar) {
        var emojiPicker = createEmojiPicker();
        chatSidebar.appendChild(emojiPicker);

        emojiBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            emojiPicker.classList.toggle('hidden');
            if (!emojiPicker.classList.contains('hidden')) {
                var searchInp = emojiPicker.querySelector('.emoji-search-input');
                if (searchInp) searchInp.focus();
            }
        });

        document.addEventListener('click', function (e) {
            if (!emojiPicker.contains(e.target) && e.target !== emojiBtn && !emojiBtn.contains(e.target)) {
                emojiPicker.classList.add('hidden');
            }
        });
    }

    async function initChat() {
        if (!chatMessages) return;
        try {
            var res = await fetch(API_BASE + '/api/me', {
                headers: { 'X-Current-User-Dummy-ID': CURRENT_USER_DUMMY_ID },
            });
            if (res.status === 401) {
                window.location.replace(LOGIN_URL);
                return;
            }
            var data = {};
            if (res.ok) {
                data = await res.json().catch(function () { return {}; });
                if (data.success && data.user) {
                    currentUserId = data.user.id;
                }
            }
            var wsMeta = data.workspace || null;
            if (currentWorkspaceId && (!wsMeta || String(wsMeta.id) !== String(currentWorkspaceId))) {
                var wsRes = await fetch(API_BASE + '/api/workspaces/' + currentWorkspaceId, {
                    headers: { 'X-Current-User-Dummy-ID': CURRENT_USER_DUMMY_ID },
                });
                if (wsRes.ok) wsMeta = await wsRes.json().catch(function () { return null; });
            }
            if (wsMeta) {
                var nameEl = document.getElementById('chat-workspace-name');
                var metaEl = document.getElementById('chat-workspace-meta');
                if (nameEl) nameEl.textContent = wsMeta.name || 'Team Workspace';
                if (metaEl) {
                    var memberCount = (wsMeta.members || []).length;
                    metaEl.textContent = memberCount + (memberCount === 1 ? ' member' : ' members');
                }
            } else if (!currentWorkspaceId) {
                window.location.replace(WORKSPACE_URL);
                return;
            }
        } catch (err) {
            if (loadingEl) {
                loadingEl.innerHTML = '<span class="font-label-sm text-label-sm text-on-surface-variant">Cannot reach the server. Make sure backend is running on http://localhost:8000</span>';
            }
        }
        updateSendButton();
        await loadMessages();
        connectWebSocket();
        if (chatInput) chatInput.focus();
    }

    initChat();
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

// ----- NN: Profile / Notifications modal wiring (Dashboard) -----
    function nnOpenModal(id) {
        var modal = document.getElementById(id);
        if (!modal) return;
        var pd = document.getElementById('profile-dropdown');
        if (pd && !pd.classList.contains('hidden')) {
            pd.classList.add('hidden');
            pd.classList.remove('dropdown-enter-active');
            pd.classList.add('dropdown-enter');
        }
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
    function nnCloseModal(id) {
        var modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('active');
        modal.classList.add('hidden');
    }
    function nnWorkspaceId() {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('workspace_id');
        if (!id) id = sessionStorage.getItem('workspace_id');
        if (id) sessionStorage.setItem('workspace_id', id);
        return id;
    }
    function nnDummyId() {
        return localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001';
    }
    function nnProfileMsg(text, isErr) {
        var el = document.getElementById('nn-profile-msg');
        if (!el) return;
        el.classList.remove('hidden');
        el.textContent = text || '';
        el.style.color = isErr ? '#ffb4ab' : '#4ade80';
    }
    function nnLoadProfileModal() {
        var nameEl = document.getElementById('nn-profile-name');
        var emailEl = document.getElementById('nn-profile-email');
        var avatarEl = document.getElementById('nn-profile-modal-avatar');
        var msgEl = document.getElementById('nn-profile-msg');
        if (msgEl) { msgEl.classList.add('hidden'); msgEl.textContent = ''; }
        if (nameEl) nameEl.value = localStorage.getItem('neuronex_user_name') || '';
        if (emailEl) emailEl.value = localStorage.getItem('neuronex_user_email') || '';
        var cur = localStorage.getItem('neuronex_user_avatar');
        if (avatarEl && cur) avatarEl.setAttribute('src', cur);
        fetch(nnApiBase() + '/api/me', {
            headers: { 'X-Current-User-Dummy-ID': nnDummyId() }
        }).then(function (r) { return r.json(); }).then(function (data) {
            if (!data || !data.user) return;
            var u = data.user;
            if (nameEl) nameEl.value = u.name || '';
            if (emailEl) emailEl.value = u.email || '';
            if (avatarEl && u.avatar_url) avatarEl.setAttribute('src', u.avatar_url);
            localStorage.setItem('neuronex_user_name', u.name || '');
            localStorage.setItem('neuronex_user_email', u.email || '');
            if (u.avatar_url) localStorage.setItem('neuronex_user_avatar', u.avatar_url);
        }).catch(function () { });
    }
    function nnSaveProfile() {
        var nameEl = document.getElementById('nn-profile-name');
        var emailEl = document.getElementById('nn-profile-email');
        var name = nameEl ? nameEl.value.trim() : '';
        var email = emailEl ? emailEl.value.trim() : '';
        if (!name) { nnProfileMsg('Name can\'t be empty.', true); return; }
        var payload = { name: name };
        if (email) payload.email = email;
        fetch(nnApiBase() + '/api/users/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Current-User-Dummy-ID': nnDummyId() },
            body: JSON.stringify(payload)
        }).then(function (r) {
            return r.json().then(function (d) { return { ok: r.ok, data: d }; });
        }).then(function (res) {
            if (!res.ok) {
                var detail = (res.data && res.data.detail) || 'Could not save changes.';
                if (typeof detail === 'object' && detail[0] && detail[0].msg) detail = detail[0].msg;
                nnProfileMsg(detail, true);
                return;
            }
            var u = res.data.user || res.data;
            localStorage.setItem('neuronex_user_name', u.name || name);
            localStorage.setItem('neuronex_user_email', u.email || email || '');
            if (u.avatar_url) localStorage.setItem('neuronex_user_avatar', u.avatar_url);
            nnFillUserHeader();
            nnProfileMsg('Profile updated successfully!', false);
            setTimeout(function () { nnCloseModal('nn-profile-modal'); }, 900);
        }).catch(function () { nnProfileMsg('Cannot reach the server.', true); });
    }

    function nnEsc(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function nnLoadTeam() {
        var listEl = document.getElementById('nn-team-list');
        if (!listEl) return;
        var wsId = nnWorkspaceId();
        if (!wsId) {
            listEl.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center">Select a workspace first.</p>';
            return;
        }
        listEl.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center">Loading members…</p>';
        fetch(nnApiBase() + '/api/workspaces/' + encodeURIComponent(wsId) + '/members', {
            headers: { 'X-Current-User-Dummy-ID': nnDummyId() }
        }).then(function (r) {
            if (!r.ok) throw new Error('http ' + r.status);
            return r.json();
        }).then(function (members) {
            if (!Array.isArray(members) || !members.length) {
                listEl.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center">No members found.</p>';
                return;
            }
            var me = (localStorage.getItem('neuronex_user_email') || '').toLowerCase();
            listEl.innerHTML = members.map(function (m) {
                var u = m.user || {};
                var isMe = (u.email || '').toLowerCase() === me;
                var avatar = u.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5q9rnrldK0TJlhLfC1ne1R0KpCXK-q5jBJZiHTe0cX9goKs6keiyuZa1SmqGD-s7_QKAgXwQH0bJ0TpnfEZkW_n6ZkAzV11Q9uDqEEl4jE8glc5vGxV6jaqGyAP7wQM4QekrAJ1j_GDu9GEnDbxBGdlwaVCucJicUSHt-pKA4ad1_a7jYoSmA-jB_cCRTQoutmF8zXOWU90_UUwPjV2nAU-hMP_JJbjyWoO6O3Ulm1gFZkQS6Th8';
                var joined = '';
                try { if (m.joined_at) joined = new Date(m.joined_at).toLocaleDateString(); } catch (e) { }
                return '<div class="flex items-center gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5">' +
                    '<img src="' + nnEsc(avatar) + '" class="w-10 h-10 rounded-full object-cover border-2 border-white/40" alt="">' +
                    '<div class="flex-1 min-w-0">' +
                    '<p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">' + nnEsc(u.name || 'Member') +
                    (isMe ? ' <span class="text-xs font-medium text-indigo-500">(you)</span>' : '') + '</p>' +
                    '<p class="text-xs text-slate-500 dark:text-slate-400 truncate">' + nnEsc(u.email || '') + '</p>' +
                    '</div>' +
                    '<div class="text-right shrink-0">' +
                    '<span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary-container/20 text-primary">' + nnEsc(m.role || 'member') + '</span>' +
                    (joined ? '<p class="text-[11px] text-slate-400 mt-0.5">Joined ' + joined + '</p>' : '') +
                    '</div></div>';
            }).join('');
        }).catch(function () {
            listEl.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center">Cannot reach the server.</p>';
        });
    }
    function nnTimeAgo(iso) {
        try {
            var d = new Date(iso), diff = Date.now() - d.getTime();
            var mins = Math.floor(diff / 60000);
            if (mins < 1) return 'just now';
            if (mins < 60) return mins + 'm ago';
            var hrs = Math.floor(mins / 60);
            if (hrs < 24) return hrs + 'h ago';
            return d.toLocaleDateString();
        } catch (e) { return ''; }
    }
    function nnLoadNotifications() {
        var listEl = document.getElementById('nn-notify-list');
        if (!listEl) return;
        var wsId = nnWorkspaceId();
        if (!wsId) {
            listEl.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center">Select a workspace first.</p>';
            return;
        }
        listEl.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center">Loading activity…</p>';
        fetch(nnApiBase() + '/api/chat/messages?workspace_id=' + encodeURIComponent(wsId), {
            headers: { 'X-Current-User-Dummy-ID': nnDummyId() }
        }).then(function (r) {
            if (!r.ok) throw new Error('http ' + r.status);
            return r.json();
        }).then(function (data) {
            var msgs = (data && data.messages) || [];
            if (!msgs.length) {
                listEl.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center">No recent activity yet. Say hi in the chat!</p>';
                return;
            }
            var latest = msgs[msgs.length - 1];
            if (latest && latest.id) {
                try { localStorage.setItem('neuronex_notify_last_' + wsId, String(latest.id)); } catch (e) { }
            }
            var recent = msgs.slice(-15).reverse();
            listEl.innerHTML = recent.map(function (m) {
                var avatar = m.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5q9rnrldK0TJlhLfC1ne1R0KpCXK-q5jBJZiHTe0cX9goKs6keiyuZa1SmqGD-s7_QKAgXwQH0bJ0TpnfEZkW_n6ZkAzV11Q9uDqEEl4jE8glc5vGxV6jaqGyAP7wQM4QekrAJ1j_GDu9GEnDbxBGdlwaVCucJicUSHt-pKA4ad1_a7jYoSmA-jB_cCRTQoutmF8zXOWU90_UUwPjV2nAU-hMP_JJbjyWoO6O3Ulm1gFZkQS6Th8';
                var text = String(m.text || '');
                if (text.length > 90) text = text.slice(0, 90) + '…';
                return '<div class="flex items-start gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5">' +
                    '<img src="' + nnEsc(avatar) + '" class="w-9 h-9 rounded-full object-cover border-2 border-white/40 shrink-0" alt="">' +
                    '<div class="flex-1 min-w-0">' +
                    '<div class="flex items-baseline justify-between gap-2">' +
                    '<p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">' + nnEsc(m.username || 'Member') + '</p>' +
                    '<span class="text-[11px] text-slate-400 shrink-0">' + nnEsc(nnTimeAgo(m.created_at)) + '</span>' +
                    '</div>' +
                    '<p class="text-xs text-slate-500 dark:text-slate-400 break-words">' + nnEsc(text) + '</p>' +
                    '</div></div>';
            }).join('');
        }).catch(function () {
            listEl.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center">Cannot reach the server.</p>';
        });
    }

    function nnWireProfileModals() {
        var pItem = document.getElementById('nn-profile-item');
        if (pItem) pItem.addEventListener('click', function (e) {
            if (e) e.stopPropagation();
            nnOpenModal('nn-profile-modal');
            nnLoadProfileModal();
        });
        var nItem = document.getElementById('nn-notify-item');
        if (nItem) nItem.addEventListener('click', function (e) {
            if (e) e.stopPropagation();
            nnOpenModal('nn-notify-modal');
            nnLoadNotifications();
        });
        var tItem = document.getElementById('nn-team-item');
        if (tItem) tItem.addEventListener('click', function (e) {
            if (e) e.stopPropagation();
            nnOpenModal('nn-team-modal');
            nnLoadTeam();
        });
        var pCancel = document.getElementById('nn-profile-cancel');
        if (pCancel) pCancel.addEventListener('click', function () { nnCloseModal('nn-profile-modal'); });
        var nClose = document.getElementById('nn-notify-close');
        if (nClose) nClose.addEventListener('click', function () { nnCloseModal('nn-notify-modal'); });
        var tClose = document.getElementById('nn-team-close');
        if (tClose) tClose.addEventListener('click', function () { nnCloseModal('nn-team-modal'); });
        ['nn-profile-modal', 'nn-notify-modal', 'nn-team-modal'].forEach(function (id) {
            var modal = document.getElementById(id);
            if (modal) modal.addEventListener('click', function (e) {
                if (e.target === modal) nnCloseModal(id);
            });
        });
        var saveBtn = document.getElementById('nn-profile-save');
        if (saveBtn) saveBtn.addEventListener('click', nnSaveProfile);
        var picBtn = document.getElementById('nn-profile-change-pic-btn');
        var picInput = document.getElementById('nn-modal-avatar-file');
        if (picBtn && picInput) {
            picBtn.addEventListener('click', function (e) { if (e) e.stopPropagation(); picInput.click(); });
            picInput.addEventListener('change', function () {
                if (picInput.files && picInput.files[0]) nnHandleAvatarFile(picInput.files[0]);
                picInput.value = '';
            });
        }
    }
    function nnInit() {
        nnApplyTheme();
        nnFillUserHeader();
        nnWireDropdown();
        nnWireProfileModals();
        nnSyncThemeUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', nnInit);
    } else {
        nnInit();
    }
})();
