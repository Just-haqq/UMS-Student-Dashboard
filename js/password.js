function toggle(id, el) {
    const input = document.getElementById(id);
    const hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    el.textContent = hidden ? 'visibility' : 'visibility_off';
}

function strength(value) {
    const segs = [1, 2, 3, 4].map((i) => document.getElementById(`s${i}`));
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    const colors = ['#e85d75', '#f5a623', '#3d5af1', '#22c88a'];
    segs.forEach((el, index) => {
        el.style.background = index < score ? colors[Math.min(score - 1, 3)] : 'var(--surface3)';
    });
}

async function save() {
    const currentPassword = document.getElementById('cur').value;
    const newPassword = document.getElementById('np').value;
    const confirmPassword = document.getElementById('cp').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        UMS.toast('Please fill all fields.', 'warning');
        return;
    }
    if (newPassword !== confirmPassword) {
        UMS.toast('New passwords do not match.', 'error');
        return;
    }
    if (newPassword.length < 8) {
        UMS.toast('Password must be at least 8 characters.', 'warning');
        return;
    }

    const saveBtn = document.querySelector('.btn-main');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

    try {
        await UMS.api('/api/users/password', {
            method: 'POST',
            body: { currentPassword, newPassword }
        });
        const toast = document.getElementById('toast');
        if (toast) { toast.style.display = 'flex'; setTimeout(() => { toast.style.display = 'none'; }, 3500); }
        UMS.toast('Password changed successfully!', 'success');
        document.getElementById('cur').value = '';
        document.getElementById('np').value = '';
        document.getElementById('cp').value = '';
        strength('');
    } catch (error) {
        UMS.toast(error.message, 'error');
    } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Password'; }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    UMS.bindTheme();
    await UMS.requireAuth();

    /* Allow Enter key to submit */
    ['cur', 'np', 'cp'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
    });
});
