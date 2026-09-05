try {
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                "colors": {
                    "on-surface": "#1a1b21",
                    "surface": "#faf8ff",
                    "primary": "#593bce",
                    "secondary": "#5e5c70",
                    "outline": "#797586",
                    "error": "#ba1a1a",
                    "surface-variant": "#e2e2e9"
                },
                "fontFamily": {
                    "body-md": ["Inter"]
                }
            }
        }
    };
} catch (e) { console.warn('Tailwind config skipped:', e); }

(function () {
    'use strict';

    // ====================================================================
    // Constants
    // ====================================================================
    const API_BASE = (window.location.port === '8000')
        ? window.location.origin
        : 'http://localhost:8000';
    const dummyId = localStorage.getItem('neuronex_dummy_id') || 'NN-ADMIN-001';
    const workspaceId = sessionStorage.getItem('workspace_id') || '1';
    const MAX_FILE_SIZE_MB = 25;
    const ITEMS_PER_PAGE = 20;
    const SAVED_ITEMS_KEY = 'neuronex_saved_items';

    // ====================================================================
    // State
    // ====================================================================
    let currentCategory = 'all';
    let currentSearch = '';
    let currentSort = 'date';
    let currentSortOrder = 'desc';
    let currentPage = 1;
    let selectedFile = null;
    let totalDocuments = 0;
    let isLoading = false;
    let allDocuments = [];
    let filteredDocuments = [];
    let selectedDocIdForMenu = null;

    // ====================================================================
    // DOM References (cached after DOMContentLoaded)
    // ====================================================================
    let $grid, $countText, $searchInput, $clearSearchBtn, $modal, $openBtn, $closeBtn;
    let $cancelBtn, $form, $dropZone, $fileInput, $dropZoneDefault, $dropZoneFile;
    let $fileNameDisplay, $fileSizeDisplay, $fileTypeIcon, $removeFileBtn;
    let $progressContainer, $progressBar, $progressText;
    let $sortToggleBtn, $sortDropdownMenu, $sortLabel, $sortChevron;
    let $toastContainer;
    let $loadMoreBtn, $loadMoreContainer;
    let $docOptionsMenu, $docOptionSave, $docOptionDelete;

    // ====================================================================
    // Helpers
    // ====================================================================

    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Current-User-Dummy-ID': dummyId
        };
    }

    function escapeHtml(text) {
        return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatFileSize(bytes) {
        if (!bytes) return '0 KB';
        if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return bytes + ' B';
    }

    function parseDateToTimestamp(dateStr) {
        if (!dateStr) return 0;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    }

    function getCategoryStyle(cat) {
        switch (cat) {
            case 'pdf': return { icon: 'picture_as_pdf', color: 'text-[#ba1a1a]', bg: 'bg-[#ba1a1a]/10' };
            case 'sheet': return { icon: 'table_view', color: 'text-[#107c41]', bg: 'bg-[#107c41]/10' };
            case 'ppt': return { icon: 'present_to_all', color: 'text-[#9b6500]', bg: 'bg-[#9b6500]/10' };
            case 'notes': return { icon: 'edit_note', color: 'text-[#b45309]', bg: 'bg-[#b45309]/10' };
            case 'code': return { icon: 'code', color: 'text-[#593bce]', bg: 'bg-[#593bce]/10' };
            case 'doc':
            default: return { icon: 'description', color: 'text-[#593bce]', bg: 'bg-[#593bce]/10' };
        }
    }

    function getFileIcon(filename) {
        if (!filename) return 'description';
        const ext = (filename.split('.').pop() || '').toLowerCase();
        const map = {
            pdf: 'picture_as_pdf', doc: 'description', docx: 'description',
            xls: 'table_view', xlsx: 'table_view', csv: 'table_view',
            ppt: 'present_to_all', pptx: 'present_to_all',
            txt: 'article', md: 'article',
            js: 'code', ts: 'code', py: 'code', html: 'code', css: 'code', json: 'code', java: 'code'
        };
        return map[ext] || 'description';
    }

    function getCategoryFromFile(filename) {
        if (!filename) return 'doc';
        const ext = (filename.split('.').pop() || '').toLowerCase();
        const map = {
            pdf: 'pdf',
            doc: 'doc', docx: 'doc',
            xls: 'sheet', xlsx: 'sheet', csv: 'sheet',
            ppt: 'ppt', pptx: 'ppt', key: 'ppt',
            txt: 'notes', md: 'notes',
            js: 'code', ts: 'code', py: 'code', html: 'code', css: 'code', json: 'code', java: 'code'
        };
        return map[ext] || 'doc';
    }

    // ====================================================================
    // Toast Notifications
    // ====================================================================

    function showToast(message, type = 'success') {
        if (!$toastContainer) return;

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

        $toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ====================================================================
    // API Functions
    // ====================================================================

    async function fetchDocuments(append = false) {
        if (isLoading) return;
        isLoading = true;

        if (!append) {
            $grid.innerHTML = `
                <div class="col-span-full py-16 text-center">
                    <div class="neu-loading-spinner w-10 h-10 mx-auto border-4 border-[#e2e2e9] border-t-[#593bce] rounded-full animate-spin"></div>
                    <p class="text-[14px] text-[#5e5c70] mt-4">Loading documents...</p>
                </div>
            `;
            currentPage = 1;
        }

        try {
            const params = new URLSearchParams({
                workspace_id: workspaceId,
                sort_by: currentSort,
                sort_order: currentSortOrder,
                page: currentPage.toString(),
                limit: ITEMS_PER_PAGE.toString()
            });

            if (currentCategory !== 'all') {
                params.append('category', currentCategory);
            }
            if (currentSearch.trim()) {
                params.append('search', currentSearch.trim());
            }

            const response = await fetch(`${API_BASE}/api/documents?${params}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch documents: ${response.status}`);
            }

            const data = await response.json();
            totalDocuments = data.total;

            const documents = data.documents.map(doc => ({
                id: doc.id.toString(),
                title: doc.title,
                author: doc.author,
                category: doc.category,
                size: formatFileSize(doc.file_size),
                date: new Date(doc.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
                content: doc.content,
                fileName: doc.file_name,
                fileType: doc.file_type,
                createdAt: doc.created_at
            }));

            allDocuments = append ? [...allDocuments, ...documents] : documents;
            filteredDocuments = allDocuments;
            renderGrid(documents, append);

            const hasMore = currentPage * ITEMS_PER_PAGE < totalDocuments;
            if ($loadMoreContainer) {
                $loadMoreContainer.classList.toggle('hidden', !hasMore);
            }

        } catch (error) {
            console.error('Error fetching documents:', error);
            showToast('Failed to load documents', 'error');

            if (!append) {
                $grid.innerHTML = `
                    <div class="col-span-full py-16 text-center">
                        <div class="neu-empty-icon w-20 h-20 mx-auto flex items-center justify-center mb-5">
                            <span class="material-symbols-outlined text-[40px] text-[#a09cb0]">error</span>
                        </div>
                        <h4 class="text-[18px] font-bold text-[#1a1b21] mb-1">Failed to load documents</h4>
                        <p class="text-[14px] text-[#5e5c70] max-w-sm mx-auto">${error.message}</p>
                        <button onclick="fetchDocuments()"
                            class="mt-5 h-11 px-6 rounded-2xl neu-btn-primary font-semibold text-[14px] inline-flex items-center gap-2">
                            <span class="material-symbols-outlined text-[20px]">refresh</span>
                            Retry
                        </button>
                    </div>
                `;
            }
        } finally {
            isLoading = false;
        }
    }

    async function createDocumentAPI(documentData) {
        const response = await fetch(`${API_BASE}/api/documents`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(documentData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create document');
        }

        return response.json();
    }

    async function deleteDocumentAPI(documentId) {
        const response = await fetch(`${API_BASE}/api/documents/${documentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete document');
        }

        return response.json();
    }

    // ====================================================================
    // Save to Bookmarks (Saved Items)
    // ====================================================================

    function saveToSavedItems(doc) {
        try {
            let saved = JSON.parse(localStorage.getItem(SAVED_ITEMS_KEY) || '[]');
            const exists = saved.some(item => item.id === doc.id || item.title === doc.title);
            if (!exists) {
                saved.unshift({
                    id: doc.id,
                    title: doc.title,
                    author: doc.author || 'You',
                    date: doc.date || new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
                    type: 'Documents',
                    category: doc.category || 'doc',
                    icon: 'description',
                    fileName: doc.fileName || '',
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd68CTD1CBp8yKA53dCH-FVWrG2cAE7MSZZ9uq569lH4j6zdGaCZa49by3nuHBVVUATs9_hwaxyW0h1Wvw7_sxNB69prW4Wyap9TqQhYC4fPUV5-h1MdhChjfhH7Me2diGQe8T-_f1-x76V0G9vrTSHAwEpE2lzpzl0T1yNqzYIKLoHsdxNDymqL8Wi4eNrbohc_9MGsckk5BXS3nV8wo_yKilbyME9UUoshDBsdkBgp7Jz90XUx6r'
                });
                localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(saved));
            }
        } catch (e) {
            console.error('Error saving item:', e);
        }
    }

    // ====================================================================
    // Rendering
    // ====================================================================

    function renderGrid(documents, append = false) {
        if (!$grid) return;

        if (!append) {
            $grid.innerHTML = '';
        }

        // Remove existing empty state if any
        const existingEmpty = $grid.querySelector('.col-span-full.py-16');
        if (existingEmpty) existingEmpty.remove();

        if (documents.length === 0 && !append) {
            const isSearch = currentSearch.trim().length > 0;
            $grid.innerHTML = `
                <div class="col-span-full py-16 text-center">
                    <div class="neu-empty-icon w-20 h-20 mx-auto flex items-center justify-center mb-5">
                        <span class="material-symbols-outlined text-[40px] text-[#a09cb0]">${isSearch ? 'search_off' : 'folder_off'}</span>
                    </div>
                    <h4 class="text-[18px] font-bold text-[#1a1b21] mb-1">${isSearch ? 'No results found' : 'No documents yet'}</h4>
                    <p class="text-[14px] text-[#5e5c70] max-w-sm mx-auto">${isSearch ? 'Try adjusting your search terms or clear the filter.' : 'Click "New Document" to upload or create your first document.'}</p>
                    ${!isSearch ? `
                    <button onclick="document.getElementById('open-upload-btn').click()"
                        class="mt-5 h-11 px-6 rounded-2xl neu-btn-primary font-semibold text-[14px] inline-flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">add</span>
                        Create Document
                    </button>` : ''}
                </div>
            `;
            if ($countText) {
                $countText.textContent = `0 items in your workspace`;
            }
            return;
        }

        // If appending, we need to handle the HTML properly
        if (append) {
            const html = documents.map((doc, i) => {
                const style = getCategoryStyle(doc.category);
                return `
                    <div class="neu-card p-5 flex flex-col justify-between cursor-pointer relative group card-enter"
                         style="animation-delay: ${i * 40}ms"
                         data-doc-id="${doc.id}">
                        <div>
                            <div class="flex items-start justify-between mb-3">
                                <div class="w-12 h-12 rounded-2xl neu-card-icon flex items-center justify-center ${style.color} ${style.bg}">
                                    <span class="material-symbols-outlined text-[22px]">${style.icon}</span>
                                </div>
                                <button class="doc-options-btn neu-card-action w-8 h-8 flex items-center justify-center text-[#a09cb0] hover:text-[#593bce]"
                                        title="More options" data-doc-id="${doc.id}">
                                    <span class="material-symbols-outlined text-[18px]">more_vert</span>
                                </button>
                            </div>
                            <div>
                                <h4 class="text-[16px] font-bold text-[#1a1b21] truncate group-hover:text-[#593bce] transition-colors"
                                    title="${escapeHtml(doc.title)}">${escapeHtml(doc.title)}</h4>
                                <p class="text-[13px] text-[#5e5c70] truncate mt-0.5">
                                    by ${escapeHtml(doc.author || 'You')}${doc.fileName ? ' &middot; ' + escapeHtml(doc.fileName) : ''}
                                </p>
                            </div>
                        </div>
                        <div class="mt-5 pt-3 flex items-center justify-between border-t border-[#e2e2e9]/50">
                            <span class="text-[12px] text-[#a09cb0] font-medium">${escapeHtml(doc.date || 'Recent')}</span>
                            <span class="text-[12px] font-semibold text-[#593bce] bg-[#593bce]/8 px-2.5 py-0.5 rounded-xl">${escapeHtml(doc.size || '1.0 MB')}</span>
                        </div>
                    </div>
                `;
            }).join('');
            $grid.insertAdjacentHTML('beforeend', html);
        } else {
            const html = documents.map((doc, i) => {
                const style = getCategoryStyle(doc.category);
                return `
                    <div class="neu-card p-5 flex flex-col justify-between cursor-pointer relative group card-enter"
                         style="animation-delay: ${i * 40}ms"
                         data-doc-id="${doc.id}">
                        <div>
                            <div class="flex items-start justify-between mb-3">
                                <div class="w-12 h-12 rounded-2xl neu-card-icon flex items-center justify-center ${style.color} ${style.bg}">
                                    <span class="material-symbols-outlined text-[22px]">${style.icon}</span>
                                </div>
                                <button class="doc-options-btn neu-card-action w-8 h-8 flex items-center justify-center text-[#a09cb0] hover:text-[#593bce]"
                                        title="More options" data-doc-id="${doc.id}">
                                    <span class="material-symbols-outlined text-[18px]">more_vert</span>
                                </button>
                            </div>
                            <div>
                                <h4 class="text-[16px] font-bold text-[#1a1b21] truncate group-hover:text-[#593bce] transition-colors"
                                    title="${escapeHtml(doc.title)}">${escapeHtml(doc.title)}</h4>
                                <p class="text-[13px] text-[#5e5c70] truncate mt-0.5">
                                    by ${escapeHtml(doc.author || 'You')}${doc.fileName ? ' &middot; ' + escapeHtml(doc.fileName) : ''}
                                </p>
                            </div>
                        </div>
                        <div class="mt-5 pt-3 flex items-center justify-between border-t border-[#e2e2e9]/50">
                            <span class="text-[12px] text-[#a09cb0] font-medium">${escapeHtml(doc.date || 'Recent')}</span>
                            <span class="text-[12px] font-semibold text-[#593bce] bg-[#593bce]/8 px-2.5 py-0.5 rounded-xl">${escapeHtml(doc.size || '1.0 MB')}</span>
                        </div>
                    </div>
                `;
            }).join('');
            $grid.innerHTML = html;
        }

        if ($countText) {
            $countText.textContent = `${totalDocuments} item${totalDocuments !== 1 ? 's' : ''} in your workspace`;
        }

        // Card click -> navigate to document
        $grid.querySelectorAll('[data-doc-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const id = card.dataset.docId;
                window.location.href = `../Document/document.html?id=${id}`;
            });
        });

        // Options button (three dots)
        $grid.querySelectorAll('.doc-options-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.docId;
                showDocOptionsMenu(e, id);
            });
        });
    }

    // ====================================================================
    // Document Options Menu (Three Dots)
    // ====================================================================

    function showDocOptionsMenu(event, docId) {
        selectedDocIdForMenu = docId;
        const rect = event.currentTarget.getBoundingClientRect();

        if ($docOptionsMenu) {
            // Position the menu
            let left = rect.left + window.scrollX;
            let top = rect.bottom + window.scrollY + 4;

            // Ensure menu stays within viewport
            const menuWidth = 160;
            const menuHeight = 80;
            if (left + menuWidth > window.innerWidth) {
                left = window.innerWidth - menuWidth - 10;
            }
            if (top + menuHeight > window.innerHeight + window.scrollY) {
                top = rect.top + window.scrollY - menuHeight - 4;
            }

            $docOptionsMenu.style.left = left + 'px';
            $docOptionsMenu.style.top = top + 'px';
            $docOptionsMenu.classList.remove('hidden');
        }
    }

    function hideDocOptionsMenu() {
        if ($docOptionsMenu) {
            $docOptionsMenu.classList.add('hidden');
            selectedDocIdForMenu = null;
        }
    }

    // ====================================================================
    // Modal Controls
    // ====================================================================

    function openModal() {
        if (!$modal) return;
        $modal.classList.remove('hidden');
        const titleInp = document.getElementById('doc-title-input');
        if (titleInp) titleInp.focus();
        const authorInp = document.getElementById('doc-author-input');
        if (authorInp && !authorInp.value) {
            authorInp.value = localStorage.getItem('neuronex_name') || '';
        }
    }

    function closeModal() {
        if (!$modal) return;
        $modal.classList.add('hidden');
        if ($form) $form.reset();
        resetFileZone();
        $modal._uploading = false;
    }

    function resetFileZone() {
        selectedFile = null;
        if ($dropZoneDefault) $dropZoneDefault.classList.remove('hidden');
        if ($dropZoneFile) $dropZoneFile.classList.add('hidden');
        if ($dropZone) {
            $dropZone.classList.remove('neu-dropzone-active', 'neu-dropzone-hasfile');
        }
        if ($progressContainer) $progressContainer.classList.add('hidden');
        if ($progressBar) $progressBar.style.width = '0%';
        if ($progressText) $progressText.textContent = '0%';
    }

    function selectFile(file) {
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            showToast(`File exceeds ${MAX_FILE_SIZE_MB} MB limit`, 'error');
            return;
        }

        selectedFile = file;

        if ($dropZoneDefault) $dropZoneDefault.classList.add('hidden');
        if ($dropZoneFile) $dropZoneFile.classList.remove('hidden');
        if ($dropZone) {
            $dropZone.classList.add('neu-dropzone-hasfile');
            $dropZone.classList.remove('neu-dropzone-active');
        }

        if ($fileNameDisplay) $fileNameDisplay.textContent = file.name;
        if ($fileSizeDisplay) $fileSizeDisplay.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
        if ($fileTypeIcon) $fileTypeIcon.textContent = getFileIcon(file.name);

        // Auto-fill title
        const titleInp = document.getElementById('doc-title-input');
        if (titleInp && !titleInp.value) {
            titleInp.value = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        }

        // Auto-detect category
        const typeSelect = document.getElementById('doc-type-input');
        if (typeSelect) {
            const detected = getCategoryFromFile(file.name);
            typeSelect.value = detected;
        }
    }

    // ====================================================================
    // Upload Progress Simulation
    // ====================================================================

    function simulateUpload(callback) {
        if (!$progressContainer || !$progressBar || !$progressText) {
            callback();
            return;
        }

        $progressContainer.classList.remove('hidden');
        let progress = 0;
        const steps = [10, 25, 45, 60, 78, 90, 100];
        let stepIndex = 0;

        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                progress = steps[stepIndex];
                $progressBar.style.width = progress + '%';
                $progressText.textContent = progress + '%';
                stepIndex++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    $progressContainer.classList.add('hidden');
                    $progressBar.style.width = '0%';
                    $progressText.textContent = '0%';
                    callback();
                }, 200);
            }
        }, 120);
    }

    // ====================================================================
    // Sort Dropdown
    // ====================================================================

    function initSortDropdown() {
        if (!$sortToggleBtn || !$sortDropdownMenu) return;

        $sortToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !$sortDropdownMenu.classList.contains('hidden');
            $sortDropdownMenu.classList.toggle('hidden');
            if ($sortChevron) $sortChevron.style.transform = isOpen ? '' : 'rotate(180deg)';
        });

        $sortDropdownMenu.querySelectorAll('[data-sort]').forEach(btn => {
            btn.addEventListener('click', () => {
                currentSort = btn.dataset.sort;
                if ($sortLabel) $sortLabel.textContent = btn.textContent.trim();
                $sortDropdownMenu.querySelectorAll('[data-sort]').forEach(b => {
                    b.classList.remove('neu-dropdown-item-active');
                    b.classList.add('text-[#5e5c70]');
                });
                btn.classList.add('neu-dropdown-item-active');
                btn.classList.remove('text-[#5e5c70]');
                $sortDropdownMenu.classList.add('hidden');
                if ($sortChevron) $sortChevron.style.transform = '';
                fetchDocuments();
            });
        });

        document.addEventListener('click', () => {
            $sortDropdownMenu.classList.add('hidden');
            if ($sortChevron) $sortChevron.style.transform = '';
        });
    }

    // ====================================================================
    // Init
    // ====================================================================

    function initApp() {
        // Cache DOM
        $grid = document.getElementById('documents-grid');
        $countText = document.getElementById('doc-count-text');
        $searchInput = document.getElementById('doc-search-input');
        $clearSearchBtn = document.getElementById('clear-search-btn');
        $modal = document.getElementById('create-doc-modal');
        $openBtn = document.getElementById('open-upload-btn');
        $closeBtn = document.getElementById('close-create-doc-btn');
        $cancelBtn = document.getElementById('cancel-doc-btn');
        $form = document.getElementById('create-doc-form');
        $dropZone = document.getElementById('file-drop-zone');
        $fileInput = document.getElementById('doc-file-input');
        $dropZoneDefault = document.getElementById('drop-zone-default');
        $dropZoneFile = document.getElementById('drop-zone-file');
        $fileNameDisplay = document.getElementById('file-name-display');
        $fileSizeDisplay = document.getElementById('file-size-display');
        $fileTypeIcon = document.getElementById('file-type-icon');
        $removeFileBtn = document.getElementById('remove-file-btn');
        $progressContainer = document.getElementById('upload-progress-container');
        $progressBar = document.getElementById('upload-progress-bar');
        $progressText = document.getElementById('upload-progress-text');
        $sortToggleBtn = document.getElementById('sort-toggle-btn');
        $sortDropdownMenu = document.getElementById('sort-dropdown-menu');
        $sortLabel = document.getElementById('sort-label');
        $sortChevron = document.getElementById('sort-chevron');
        $toastContainer = document.getElementById('toast-container');
        $docOptionsMenu = document.getElementById('doc-options-menu');
        $docOptionSave = document.getElementById('doc-option-save');
        $docOptionDelete = document.getElementById('doc-option-delete');
        $loadMoreContainer = document.getElementById('load-more-container');

        // Load More button
        $loadMoreBtn = document.getElementById('load-more-btn');
        if ($loadMoreBtn) {
            $loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                fetchDocuments(true);
            });
        }

        // Initial render
        fetchDocuments();
        initSortDropdown();

        // --- Search ---
        if ($searchInput) {
            let debounceTimer;
            $searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    currentSearch = e.target.value;
                    if ($clearSearchBtn) $clearSearchBtn.classList.toggle('hidden', !currentSearch);
                    fetchDocuments();
                }, 200);
            });
        }

        if ($clearSearchBtn) {
            $clearSearchBtn.addEventListener('click', () => {
                if ($searchInput) $searchInput.value = '';
                currentSearch = '';
                $clearSearchBtn.classList.add('hidden');
                fetchDocuments();
                $searchInput && $searchInput.focus();
            });
        }

        // --- Mobile search ---
        const mobileSearchBtn = document.getElementById('mobile-search-btn');
        if (mobileSearchBtn && $searchInput) {
            mobileSearchBtn.addEventListener('click', () => {
                const searchWrapper = $searchInput.closest('.hidden');
                if (searchWrapper) searchWrapper.classList.remove('hidden');
                $searchInput.focus();
            });
        }

        // --- Filter Pills ---
        const filterPills = document.querySelectorAll('.filter-pill');
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                filterPills.forEach(p => {
                    p.className = p.className.replace('neu-pill-active', 'neu-pill').replace('font-semibold', 'font-medium');
                });
                pill.className = pill.className.replace('neu-pill', 'neu-pill-active').replace('font-medium', 'font-semibold');
                currentCategory = pill.dataset.cat;
                fetchDocuments();
            });
        });

        // --- Modal ---
        if ($openBtn) $openBtn.addEventListener('click', openModal);
        if ($closeBtn) $closeBtn.addEventListener('click', closeModal);
        if ($cancelBtn) $cancelBtn.addEventListener('click', closeModal);
        if ($modal) {
            $modal.addEventListener('click', (e) => {
                if (e.target === $modal) closeModal();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && $modal && !$modal.classList.contains('hidden')) {
                closeModal();
            }
        });

        // --- File Drop Zone ---
        if ($dropZone && $fileInput) {
            $dropZone.addEventListener('click', () => $fileInput.click());

            $fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    selectFile(e.target.files[0]);
                }
            });

            ['dragenter', 'dragover'].forEach(evt => {
                $dropZone.addEventListener(evt, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    $dropZone.classList.add('neu-dropzone-active');
                });
            });

            ['dragleave', 'drop'].forEach(evt => {
                $dropZone.addEventListener(evt, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    $dropZone.classList.remove('neu-dropzone-active');
                });
            });

            $dropZone.addEventListener('drop', (e) => {
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    selectFile(e.dataTransfer.files[0]);
                }
            });
        }

        if ($removeFileBtn) {
            $removeFileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                resetFileZone();
                if ($fileInput) $fileInput.value = '';
            });
        }

        // --- Document Options Menu ---
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if ($docOptionsMenu && !$docOptionsMenu.contains(e.target)) {
                hideDocOptionsMenu();
            }
        });

        // Save option
        if ($docOptionSave) {
            $docOptionSave.addEventListener('click', () => {
                if (selectedDocIdForMenu) {
                    const doc = allDocuments.find(d => d.id === selectedDocIdForMenu);
                    if (doc) {
                        saveToSavedItems(doc);
                        showToast(`"${doc.title}" saved to bookmarks`);
                        hideDocOptionsMenu();
                    }
                }
            });
        }

        // Delete option
        if ($docOptionDelete) {
            $docOptionDelete.addEventListener('click', async () => {
                if (selectedDocIdForMenu) {
                    const doc = allDocuments.find(d => d.id === selectedDocIdForMenu);
                    const card = $grid.querySelector(`[data-doc-id="${selectedDocIdForMenu}"]`);

                    if (doc && confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
                        if (card) {
                            card.classList.add('card-exit');
                            try {
                                await deleteDocumentAPI(selectedDocIdForMenu);
                                setTimeout(() => {
                                    allDocuments = allDocuments.filter(d => d.id !== selectedDocIdForMenu);
                                    totalDocuments--;
                                    filteredDocuments = allDocuments;
                                    renderGrid(filteredDocuments, false);
                                    hideDocOptionsMenu();
                                    showToast(`"${doc.title}" deleted`);
                                }, 250);
                            } catch (error) {
                                card.classList.remove('card-exit');
                                showToast(error.message, 'error');
                            }
                        }
                    }
                    hideDocOptionsMenu();
                }
            });
        }

        // --- Form Submit ---
        if ($form) {
            $form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if ($modal && $modal._uploading) return;

                const title = document.getElementById('doc-title-input').value.trim();
                const category = document.getElementById('doc-type-input').value;
                const author = document.getElementById('doc-author-input').value.trim() || 'You';
                const content = document.getElementById('doc-content-input').value.trim();

                if (!title) {
                    showToast('Please enter a document title', 'error');
                    return;
                }

                if ($modal) $modal._uploading = true;
                const submitBtn = document.getElementById('submit-doc-btn');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">sync</span> Creating...';
                }

                const finishCreate = async () => {
                    const fileSize = selectedFile ? selectedFile.size : Math.floor(Math.random() * 3 * 1024 * 1024 + 0.5 * 1024 * 1024);

                    const documentData = {
                        workspace_id: parseInt(workspaceId),
                        title: title,
                        author: author,
                        category: category,
                        file_name: selectedFile ? selectedFile.name : '',
                        file_type: selectedFile ? (selectedFile.type || '') : '',
                        file_size: fileSize,
                        content: content || 'Document created in workspace.'
                    };

                    try {
                        const newDoc = await createDocumentAPI(documentData);
                        closeModal();
                        fetchDocuments();
                        showToast(`"${title}" created successfully`);
                    } catch (error) {
                        showToast(error.message, 'error');
                    } finally {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">add</span> Create Document';
                        }
                        if ($modal) $modal._uploading = false;
                    }
                };

                if (selectedFile) {
                    simulateUpload(finishCreate);
                } else {
                    await finishCreate();
                }
            });
        }
    }

    // ====================================================================
    // Dispatch Init
    // ====================================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    // ====================================================================
    // Session Auth Check
    // ====================================================================
    (async function checkSession() {
        try {
            const response = await fetch(API_BASE + '/api/me', {
                headers: { 'X-Current-User-Dummy-ID': dummyId }
            });
            if (response.status === 401) {
                window.location.replace('../Create_account/create.html');
            }
        } catch (err) {
            console.warn('Session check skipped:', err);
        }
    })();
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
