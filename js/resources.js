let activeFilter = 'all';
let resources = [];
let currentUser = null;

function formatDueDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function setFilter(btn) {
    document.querySelectorAll('.filter-btn').forEach((el) => el.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderResources();
}

function renderStats(items) {
    const assignments = items.filter((item) => item.type === 'Assignment').length;
    const slides = items.filter((item) => item.type === 'Slides').length;
    const latest = items[0] ? items[0].uploaded : 'No uploads yet';
    document.getElementById('stats').innerHTML = `
        <div class="stats-card"><div class="stats-icon ic-blue"><span class="material-icons-sharp">folder</span></div><div><div class="stats-val">${items.length}</div><div class="stats-lbl">Total shared files</div></div></div>
        <div class="stats-card"><div class="stats-icon ic-green"><span class="material-icons-sharp">slideshow</span></div><div><div class="stats-val">${slides}</div><div class="stats-lbl">Lecture slide decks</div></div></div>
        <div class="stats-card"><div class="stats-icon ic-orange"><span class="material-icons-sharp">assignment</span></div><div><div class="stats-val">${assignments}</div><div class="stats-lbl">Assignments available</div></div></div>
        <div class="stats-card"><div class="stats-icon ic-pink"><span class="material-icons-sharp">history</span></div><div><div class="stats-val">${latest}</div><div class="stats-lbl">Latest activity</div></div></div>
    `;
}

function renderResources() {
    const q = document.getElementById('search-input').value.trim().toLowerCase();
    renderStats(resources);
    const filtered = resources.filter((item) => {
        const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
        const haystack = `${item.title} ${item.lecturer} ${item.course} ${item.description}`.toLowerCase();
        return matchesFilter && (!q || haystack.includes(q));
    });
    const grid = document.getElementById('resource-grid');
    const empty = document.getElementById('empty-state');
    if (!filtered.length) {
        grid.innerHTML = '';
        empty.classList.add('show');
        return;
    }
    empty.classList.remove('show');
    grid.innerHTML = filtered.map((item) => `
        <article class="resource-card">
            <div class="resource-top">
                <div class="resource-file">
                    <div class="file-icon"><span class="material-icons-sharp">${item.icon}</span></div>
                    <div>
                        <div class="resource-title">${item.title}</div>
                        <div class="resource-author">${item.lecturer} &middot; ${item.uploaded}<br>${item.fileName}</div>
                    </div>
                </div>
                <span class="type-badge">${item.type}</span>
            </div>
            <div class="course-row">
                <span class="course-chip"><span class="material-icons-sharp" style="font-size:.85rem">school</span>${item.course}</span>
                <span class="meta-chip"><span class="material-icons-sharp" style="font-size:.85rem">data_usage</span>${item.size}</span>
            </div>
            <div class="resource-copy">${item.description}</div>
            ${item.type === 'Assignment' ? `<div class="assignment-box"><strong>Assignment deadline</strong><span>${formatDueDate(item.dueDate) || 'Deadline not specified yet'}</span></div>` : ''}
            <div class="resource-actions">
                <button class="mini-btn primary" onclick="downloadResource('${item.id}')"><span class="material-icons-sharp" style="font-size:.95rem">download</span>Download</button>
                <button class="mini-btn" onclick="previewResource('${item.id}')"><span class="material-icons-sharp" style="font-size:.95rem">visibility</span>Preview</button>
            </div>
        </article>
    `).join('');
}

function openShareModal() {
    if (currentUser && currentUser.role !== 'lecturer') {
        UMS.toast('Only lecturers can upload resources.', 'warning');
        return;
    }
    document.getElementById('share-modal').classList.add('open');
}

function closeShareModal() {
    document.getElementById('share-modal').classList.remove('open');
    document.getElementById('share-form').reset();
    const lecturerField = document.getElementById('res-lecturer');
    if (lecturerField && currentUser) lecturerField.value = currentUser.name;
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        if (!file) { resolve(''); return; }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function previewResource(id) {
    const item = resources.find((resource) => resource.id === id);
    if (!item) return;
    if (item.filePath) { window.open(item.filePath, '_blank', 'noopener'); return; }
    UMS.toast(`No uploaded file attached to "${item.title}" yet.`, 'warning');
}

async function downloadResource(id) {
    const item = resources.find((resource) => resource.id === id);
    if (!item) return;
    if (item.filePath) { window.open(item.filePath, '_blank', 'noopener'); return; }
    UMS.toast(`No uploaded file attached to "${item.title}" yet.`, 'warning');
}

document.addEventListener('DOMContentLoaded', async () => {
    UMS.bindTheme();
    currentUser = await UMS.requireAuth();
    const response = await UMS.api('/api/resources');
    resources = response.resources;
    renderResources();

    const lecturerField = document.getElementById('res-lecturer');
    if (lecturerField) {
        lecturerField.value = currentUser.name;
        lecturerField.readOnly = true;
    }

    document.querySelectorAll('[data-upload-label]').forEach((el) => {
        el.textContent = currentUser.role === 'lecturer' ? 'Share a file' : 'Browse resources';
    });
    document.querySelectorAll('[data-lecturer-copy]').forEach((el) => {
        el.textContent = currentUser.role === 'lecturer'
            ? 'Upload real files, slides and assignments for students through this shared hub.'
            : 'Browse lecturer-shared files without interrupting your existing dashboard pages.';
    });

    document.getElementById('share-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const file = document.getElementById('res-upload').files[0];
        const submitBtn = event.target.querySelector('[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving…'; }

        try {
            const payload = {
                title: formData.get('title'),
                type: formData.get('type'),
                course: formData.get('course'),
                description: formData.get('description'),
                dueDate: formData.get('dueDate'),
                fileName: file ? file.name : formData.get('fileName'),
                fileData: await fileToDataUrl(file),
                size: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : formData.get('size')
            };
            const saved = await UMS.api('/api/resources', { method: 'POST', body: payload });
            resources.unshift(saved.resource);
            closeShareModal();
            renderResources();
            UMS.toast('Resource shared successfully!', 'success');
        } catch (error) {
            UMS.toast(error.message, 'error');
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save resource'; }
        }
    });

    document.addEventListener('click', (event) => {
        if (event.target.id === 'share-modal') closeShareModal();
    });
});
