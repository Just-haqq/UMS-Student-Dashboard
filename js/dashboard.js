document.addEventListener('DOMContentLoaded', async () => {
    UMS.bindTheme();
    const user = await UMS.requireAuth();
    const data = await UMS.api('/api/dashboard');

    /* ── Greeting ── */
    const greetEl = document.getElementById('dash-greeting');
    if (greetEl) {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        const firstName = user.name.split(' ')[0];
        const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        greetEl.innerHTML = `
            <div style="margin-bottom:1.6rem;padding:1.3rem 1.5rem;background:linear-gradient(135deg,rgba(61,90,241,.09),rgba(34,200,138,.08)),var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-sm);display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
                <div>
                    <div style="font-family:'DM Serif Display',serif;font-size:1.45rem;color:var(--text);letter-spacing:-.02em">${greeting}, ${firstName}.</div>
                    <div style="font-size:.8rem;color:var(--text-dim);margin-top:.25rem">${today} &nbsp;·&nbsp; ${user.program}, ${user.level}</div>
                </div>
                <div style="display:flex;gap:.5rem;flex-shrink:0;">
                    <a href="exam.html" style="display:inline-flex;align-items:center;gap:.35rem;padding:.55rem .9rem;background:rgba(61,90,241,.09);color:var(--primary);border:1px solid rgba(61,90,241,.14);border-radius:10px;font-size:.76rem;font-weight:700;text-decoration:none;transition:all .2s;" onmouseover="this.style.background='rgba(61,90,241,.16)'" onmouseout="this.style.background='rgba(61,90,241,.09)'">
                        <span class="material-icons-sharp" style="font-size:1rem">event</span>Exams
                    </a>
                    <a href="timetable.html" style="display:inline-flex;align-items:center;gap:.35rem;padding:.55rem .9rem;background:rgba(34,200,138,.08);color:#16a870;border:1px solid rgba(34,200,138,.14);border-radius:10px;font-size:.76rem;font-weight:700;text-decoration:none;transition:all .2s;" onmouseover="this.style.background='rgba(34,200,138,.15)'" onmouseout="this.style.background='rgba(34,200,138,.08)'">
                        <span class="material-icons-sharp" style="font-size:1rem">calendar_today</span>Schedule
                    </a>
                </div>
            </div>
        `;
    }

    /* ── Attendance cards ── */
    const R = 32;
    const C = 2 * Math.PI * R;
    const card = (s) => {
        const fill = (s.pct / 100) * C;
        const statusColor = s.pct >= 85 ? '#22c88a' : s.pct >= 70 ? '#f5a623' : '#e85d75';
        const statusLabel = s.pct >= 85 ? 'Good' : s.pct >= 70 ? 'Moderate' : 'Low';
        return `<div class="att-card">
            <div class="att-label" style="color:${s.color}">
                <span class="material-icons-sharp" style="color:${s.color};font-size:.95rem">${s.icon}</span>
            </div>
            <div class="att-name">${s.name}</div>
            <div class="att-score">${s.score}</div>
            <div class="donut">
                <svg viewBox="0 0 78 78">
                    <circle class="d-track" cx="39" cy="39" r="${R}"></circle>
                    <circle class="d-fill" cx="39" cy="39" r="${R}" stroke="${s.color}" stroke-dasharray="0 ${C}" data-fill="${fill}"></circle>
                </svg>
                <div class="donut-label" style="color:${s.color}">${s.pct}%</div>
            </div>
            <div class="att-last" style="color:${statusColor};font-weight:600;font-size:.7rem">${statusLabel}</div>
        </div>`;
    };
    document.getElementById('att-grid').innerHTML = data.attendance.map(card).join('');

    /* Animate donuts after paint */
    requestAnimationFrame(() => {
        document.querySelectorAll('.d-fill').forEach((el) => {
            const fill = Number(el.dataset.fill);
            setTimeout(() => {
                el.style.strokeDasharray = `${fill} ${C - fill}`;
            }, 80);
        });
    });

    /* ── Announcements ── */
    const announcements = document.getElementById('announcements-list');
    if (announcements) {
        announcements.innerHTML = data.announcements.map((item) => `
            <div class="ann-row">
                <div class="ann-dot" style="background:${item.color}"></div>
                <div>
                    <div class="ann-txt">${item.title}</div>
                    <div class="ann-time">${item.time}</div>
                </div>
            </div>
        `).join('');
    }

    /* ── Lecturer preview ── */
    const lecturers = document.getElementById('lecturer-preview');
    if (lecturers) {
        lecturers.innerHTML = data.lecturers.map((item) => `
            <div class="lec-row" onclick="location.href='lecturers.html'" title="View all lecturers">
                <div class="lec-av" style="background:${item.bg}22;color:${item.bg};border:2px solid ${item.bg}33">${item.av}</div>
                <div>
                    <div class="lec-name">${item.name}</div>
                    <div class="lec-sub">${item.dept}</div>
                </div>
                <div class="lec-more"><span class="material-icons-sharp" style="font-size:1.1rem">chevron_right</span></div>
            </div>
        `).join('');
    }

    /* ── Shared Resources preview ── */
    const resourcePreview = document.getElementById('resource-preview');
    if (resourcePreview) {
        resourcePreview.innerHTML = `
            ${data.sharedResources.map((item) => `
                <div class="resource-row">
                    <div class="resource-icon"><span class="material-icons-sharp">${item.icon}</span></div>
                    <div class="resource-main">
                        <div class="resource-top">
                            <div class="resource-name">${item.title}</div>
                            <span class="resource-badge">${item.type}</span>
                        </div>
                        <div class="resource-meta">${item.course} &middot; ${item.lecturer}<br>${item.uploaded}</div>
                        <a class="resource-open" href="resources.html">
                            Open hub<span class="material-icons-sharp" style="font-size:.95rem">arrow_forward</span>
                        </a>
                    </div>
                </div>
            `).join('')}
            <div class="resource-footer">
                <p>${user.role === 'lecturer' ? 'Upload new slides or assignment files from the shared resources hub.' : 'Lecturers can share slides, notes and assignment files from one place.'}</p>
                <a href="resources.html"><span class="material-icons-sharp" style="font-size:1rem">folder</span>View all</a>
            </div>
        `;
    }

    /* ── Timetable ── */
    const tt = data.timetable;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    let day = today;

    function getMinutes(timeStr) {
        if (!timeStr || timeStr === '-') return -1;
        const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!m) return -1;
        let h = parseInt(m[1]);
        if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
        if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + parseInt(m[2]);
    }

    function renderTT() {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        document.getElementById('tt-title').textContent = day === today ? "Today's Timetable" : `${days[day]}'s Timetable`;
        const rows = tt[day];
        document.getElementById('tt-body').innerHTML = rows.map((row, idx) => {
            const rowMins = getMinutes(row.t);
            const nextMins = idx + 1 < rows.length ? getMinutes(rows[idx + 1].t) : rowMins + 60;
            let rowStyle = '';
            if (day === today && rowMins >= 0) {
                if (currentMins >= rowMins && currentMins < nextMins) {
                    rowStyle = ' class="current-class"';
                } else if (rowMins < currentMins) {
                    rowStyle = ' style="opacity:.55"';
                }
            }
            return `<tr${rowStyle}>
                <td>${row.t}</td><td>${row.r}</td>
                <td><strong>${row.s}</strong></td>
                <td>${row.l ? `<span class="pill pill-${row.l.toLowerCase()}">${row.l}</span>` : ''}</td>
            </tr>`;
        }).join('');
    }

    document.getElementById('nextDay').onclick = () => { day = (day + 1) % 7; renderTT(); };
    document.getElementById('prevDay').onclick = () => { day = (day + 6) % 7; renderTT(); };
    renderTT();
});
