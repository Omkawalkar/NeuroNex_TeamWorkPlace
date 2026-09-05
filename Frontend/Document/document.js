tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "tertiary": "#7a4f00",
                "surface-dim": "#dad9e1",
                "primary": "#593bce",
                "surface-bright": "#faf8ff",
                "on-surface-variant": "#484554",
                "tertiary-fixed-dim": "#ffb955",
                "surface": "#faf8ff",
                "surface-container-low": "#f4f3fb",
                "on-secondary-container": "#626075",
                "outline": "#797586",
                "on-tertiary-container": "#fff4ea",
                "on-secondary": "#ffffff",
                "on-surface": "#1a1b21",
                "on-tertiary-fixed": "#291800",
                "on-secondary-fixed-variant": "#464558",
                "surface-container-high": "#e8e7ef",
                "on-primary-container": "#f9f3ff",
                "surface-container-lowest": "#ffffff",
                "on-primary-fixed": "#1c0062",
                "error-container": "#ffdad6",
                "background": "#faf8ff",
                "primary-fixed": "#e6deff",
                "surface-container-highest": "#e2e2e9",
                "inverse-surface": "#2f3036",
                "tertiary-container": "#9b6500",
                "inverse-on-surface": "#f1f0f8",
                "on-primary": "#ffffff",
                "on-tertiary": "#ffffff",
                "primary-fixed-dim": "#cabeff",
                "secondary-fixed-dim": "#c7c4db",
                "secondary-fixed": "#e3e0f8",
                "on-primary-fixed-variant": "#4723bc",
                "surface-tint": "#6043d5",
                "secondary": "#5e5c70",
                "on-error": "#ffffff",
                "on-background": "#1a1b21",
                "on-secondary-fixed": "#1a1a2b",
                "tertiary-fixed": "#ffddb4",
                "outline-variant": "#c9c4d7"
            },
            "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            "spacing": {
                "xl": "64px",
                "md": "24px",
                "xs": "4px",
                "base": "8px",
                "container-margin": "32px",
                "lg": "40px",
                "sm": "12px",
                "gutter": "24px"
            },
            "fontFamily": {
                "headline-md": ["Inter"],
                "label-sm": ["Inter"],
                "headline-sm": ["Inter"],
                "headline-lg-mobile": ["Inter"],
                "headline-lg": ["Inter"],
                "body-md": ["Inter"],
                "label-md": ["Inter"],
                "body-lg": ["Inter"],
                "display-lg": ["Inter"],
                "body-sm": ["Inter"]
            },
            "fontSize": {
                "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
                "label-sm": ["12px", {"lineHeight": "1.2", "letterSpacing": "0.02em", "fontWeight": "500"}],
                "headline-sm": ["20px", {"lineHeight": "1.4", "fontWeight": "600"}],
                "headline-lg-mobile": ["28px", {"lineHeight": "1.2", "fontWeight": "700"}],
                "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "700"}],
                "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
                "label-md": ["14px", {"lineHeight": "1.2", "fontWeight": "600"}],
                "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                "body-sm": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}]
            }
        },
    },
};

(function () {
    'use strict';

    const API_BASE = (window.location.port === '8000')
        ? window.location.origin
        : 'http://localhost:8000';
    const dummyId = localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001';
    const workspaceId = sessionStorage.getItem('workspace_id') || '1';

    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');

    function getAuthHeaders(includeContentType = true) {
        const headers = {
            'X-Current-User-Dummy-ID': dummyId
        };
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    function escapeHtml(text) {
        return String(text || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
    }

    function detectLanguage(fileName, category) {
        if (category === 'code') {
            const ext = (fileName || '').split('.').pop()?.toLowerCase();
            const langMap = {
                js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
                py: 'python', html: 'html', css: 'css', json: 'json',
                java: 'java', cpp: 'cpp', c: 'c', cs: 'csharp', go: 'go',
                rs: 'rust', php: 'php', rb: 'ruby', swift: 'swift',
                kt: 'kotlin', sql: 'sql', sh: 'bash', md: 'markdown',
                xml: 'xml', yaml: 'yaml', yml: 'yaml', toml: 'toml'
            };
            return langMap[ext] || 'plaintext';
        }
        return 'plaintext';
    }

    function applySyntaxHighlighting(code, language) {
        // Simple syntax highlighting for common languages
        if (language === 'plaintext') return escapeHtml(code);
        
        let highlighted = escapeHtml(code);
        
        // Keywords
        const keywords = [
            'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while',
            'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch',
            'finally', 'throw', 'new', 'this', 'super', 'extends', 'implements',
            'interface', 'type', 'enum', 'namespace', 'module', 'declare',
            'def', 'class', 'import', 'from', 'as', 'return', 'if', 'elif', 'else',
            'for', 'while', 'try', 'except', 'finally', 'raise', 'with', 'as',
            'lambda', 'yield', 'await', 'async', 'pass', 'break', 'continue',
            'def', 'class', 'return', 'import', 'from', 'as', 'global', 'nonlocal'
        ];
        
        const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
        highlighted = highlighted.replace(keywordRegex, '<span class="token-keyword">$1</span>');
        
        // Strings
        highlighted = highlighted.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="token-string">$&</span>');
        
        // Comments
        highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>');
        highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');
        highlighted = highlighted.replace(/(#.*$)/gm, '<span class="token-comment">$1</span>');
        
        // Numbers
        highlighted = highlighted.replace(/\b\d+(\.\d+)?\b/g, '<span class="token-number">$&</span>');
        
        // Functions
        highlighted = highlighted.replace(/\b([a-zA-Z_$][\w$]*)(?=\s*\()/g, '<span class="token-function">$1</span>');
        
        return highlighted;
    }

    function showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-20 right-6 z-[60] flex flex-col gap-3 pointer-events-none';
            document.body.appendChild(container);
        }

        const iconMap = {
            success: 'check_circle',
            error: 'error',
            info: 'info'
        };

        const toast = document.createElement('div');
        toast.className = `neu-toast neu-toast-${type} flex items-center gap-3 px-5 py-3.5 pointer-events-auto`;
        toast.innerHTML = `
            <span class="material-symbols-outlined text-[22px] ${type === 'success' ? 'text-[#10b981]' : type === 'error' ? 'text-[#ef4444]' : 'text-[#593bce]'}">${iconMap[type]}</span>
            <span class="text-[14px] font-medium text-[#1a1b21]">${escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async function fetchDocument() {
        if (!docId) return null;
        
        try {
            const response = await fetch(`${API_BASE}/api/documents/${docId}`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Failed to fetch document: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching document:', error);
            showToast('Failed to load document', 'error');
            return null;
        }
    }

    async function saveDocumentAPI(documentId, data) {
        const response = await fetch(`${API_BASE}/api/documents/${documentId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to save document');
        }
        
        return response.json();
    }

    async function createDocumentAPI(data) {
        const response = await fetch(`${API_BASE}/api/documents`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create document');
        }
        
        return response.json();
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const titleInput = document.getElementById('doc-title-input');
        const editorBody = document.getElementById('doc-editor-body');
        const saveBtn = document.getElementById('save-doc-btn');
        const backLink = document.querySelector('a[href*="new_document.html"]');

        let currentDoc = null;
        let isCodeFile = false;
        let currentLanguage = 'plaintext';

        // Load document
        if (docId) {
            currentDoc = await fetchDocument();
        }

        if (currentDoc) {
            if (titleInput) titleInput.value = currentDoc.title;
            
            isCodeFile = currentDoc.category === 'code';
            currentLanguage = detectLanguage(currentDoc.file_name, currentDoc.category);
            
            if (editorBody) {
                if (isCodeFile) {
                    // For code files, use a pre/code block with syntax highlighting
                    editorBody.innerHTML = `<pre class="code-editor"><code class="language-${currentLanguage}">${applySyntaxHighlighting(currentDoc.content || '', currentLanguage)}</code></pre>`;
                    editorBody.classList.add('font-mono', 'text-sm');
                    editorBody.style.fontFamily = '"JetBrains Mono", "Fira Code", "Consolas", monospace';
                } else {
                    editorBody.innerHTML = currentDoc.content || '<p>Start typing here...</p>';
                }
            }
        } else if (titleInput && editorBody) {
            titleInput.value = 'Untitled Document';
            editorBody.innerHTML = '<p>Welcome to your new document. Start typing here...</p>';
        }

        // Add code editor styles if needed
        if (isCodeFile) {
            const style = document.createElement('style');
            style.textContent = `
                .code-editor {
                    background: #1e1e1e;
                    color: #d4d4d4;
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                    font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
                    font-size: 14px;
                    line-height: 1.6;
                    min-height: 500px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                .code-editor code {
                    display: block;
                }
                .token-keyword { color: #569cd6; }
                .token-string { color: #ce9178; }
                .token-comment { color: #6a9955; }
                .token-number { color: #b5cea8; }
                .token-function { color: #dcdcaa; }
                .token-operator { color: #d4d4d4; }
                .token-punctuation { color: #d4d4d4; }
            `;
            document.head.appendChild(style);
        }

        // Save action
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const updatedTitle = titleInput ? titleInput.value.trim() : 'Untitled';
                let updatedContent = '';

                if (editorBody) {
                    if (isCodeFile) {
                        // For code files, get the raw text content
                        const codeElement = editorBody.querySelector('code');
                        updatedContent = codeElement ? codeElement.textContent : editorBody.textContent;
                    } else {
                        updatedContent = editorBody.innerHTML;
                    }
                }

                const saveData = {
                    title: updatedTitle,
                    content: updatedContent
                };

                // Show saving state
                saveBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">sync</span> Saving...';
                saveBtn.disabled = true;

                try {
                    if (currentDoc) {
                        await saveDocumentAPI(currentDoc.id, saveData);
                    } else {
                        // Create new document
                        const newDocData = {
                            workspace_id: parseInt(workspaceId),
                            title: updatedTitle,
                            author: localStorage.getItem('neuronex_name') || 'You',
                            category: 'doc',
                            content: updatedContent
                        };
                        currentDoc = await createDocumentAPI(newDocData);
                        // Update URL with new doc ID
                        window.history.replaceState({}, '', `document.html?id=${currentDoc.id}`);
                    }

                    showToast('Document saved successfully');
                    saveBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> Saved!';
                    saveBtn.classList.remove('bg-primary');
                    saveBtn.classList.add('bg-green-600');
                    
                    setTimeout(() => {
                        saveBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">save</span> Save Document';
                        saveBtn.classList.remove('bg-green-600');
                        saveBtn.classList.add('bg-primary');
                    }, 2000);
                } catch (error) {
                    showToast(error.message, 'error');
                    saveBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">save</span> Save Document';
                    saveBtn.classList.remove('bg-green-600');
                    saveBtn.classList.add('bg-primary');
                } finally {
                    saveBtn.disabled = false;
                }
            });
        }

        // Formatting toolbar support
        const formatMap = {
            'B': 'bold',
            'I': 'italic',
            'U': 'underline'
        };
        
        document.querySelectorAll('button').forEach(btn => {
            const txt = btn.textContent.trim();
            if (formatMap[txt] && !isCodeFile) {
                btn.addEventListener('click', () => {
                    document.execCommand(formatMap[txt], false, null);
                    if (editorBody) editorBody.focus();
                });
            }
        });

        // Add keyboard shortcut for saving (Ctrl/Cmd + S)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (saveBtn) saveBtn.click();
            }
        });

        // Auto-save on blur (optional)
        let autoSaveTimeout;
        if (editorBody) {
            editorBody.addEventListener('input', () => {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    // Could implement auto-save here
                }, 5000);
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
