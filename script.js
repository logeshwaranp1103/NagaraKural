let issues = JSON.parse(localStorage.getItem('nk_issues')) || [];
if (issues.some(i => ['1','2','3'].includes(i.id))) {
    issues = issues.filter(i => !['1','2','3'].includes(i.id));
    localStorage.setItem('nk_issues', JSON.stringify(issues));
}
let upvoted = JSON.parse(localStorage.getItem('nk_upvotes')) || [];
let lang  = localStorage.getItem('nk_lang')  || 'en';
let theme = localStorage.getItem('nk_theme') || 'light';
let currentFilter = 'all';

// Fix automatic scrolling on refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

const i18n = {
    en: {
        appName:"Nagarakural", pageEyebrow:"Civic Action", reportTitle:"Report an Issue",
        communityEyebrow:"Community", personalEyebrow:"Personal",
        uploadPhoto:"Photo", tapToUpload:"Tap to upload photo",
        category:"Category", catRoad:"Road", catGarbage:"Garbage",
        catWater:"Water", catStreetlight:"Streetlight", catDrain:"Drain",
        location:"Location", autoDetect:"Auto GPS", locPlaceholder:"Enter landmark or area name",
        description:"Description", descPlaceholder:"Describe the issue in detail...",
        submitBtn:"Submit Report", allReportsTitle:"All Reports", myReportsTitle:"My Reports",
        navReport:"Report", navAllReports:"All Reports", navMyReports:"My Reports",
        filterAll:"All", filterPending:"Pending", filterResolved:"Resolved",
        today:"Today", daysAgo:"days ago", daysIgn:"days ignored",
        alertSent:"Alert sent to ward councillor!", markRes:"Mark as Resolved",
        stPending:"Pending", stProgress:"In Progress", stResolved:"Resolved",
        noReports:"No reports yet", noMyReports:"You haven't reported anything yet",
        successMsg:"Issue reported!", upvoteAdded:"Upvoted!", upvoteRemoved:"Upvote removed",
        resolvedMsg:"Marked as resolved!", pleasePhoto:"Please upload a photo first",
        pleaseLoc:"Please enter a location", afterPhoto:"After photo", deleteBtn:"Delete", pinPrompt:"Enter PIN to delete:", invalidPin:"Incorrect PIN!", cancelBtn:"Cancel"
    },
    ta: {
        appName:"நகரக்குரல்", pageEyebrow:"குடிமை நடவடிக்கை", reportTitle:"புகாரளி",
        communityEyebrow:"சமூகம்", personalEyebrow:"தனிப்பட்டது",
        uploadPhoto:"புகைப்படம்", tapToUpload:"புகைப்படத்தை பதிவேற்று",
        category:"வகை", catRoad:"சாலை", catGarbage:"குப்பை",
        catWater:"குடிநீர்", catStreetlight:"தெரு விளக்கு", catDrain:"வடிகால்",
        location:"இடம்", autoDetect:"GPS கண்டறி", locPlaceholder:"இடத்தின் பெயரை உள்ளிடவும்",
        description:"விவரம்", descPlaceholder:"கூடுதல் விவரங்கள்...",
        submitBtn:"சமர்ப்பி", allReportsTitle:"அனைத்து புகார்கள்", myReportsTitle:"என் புகார்கள்",
        navReport:"புகாரளி", navAllReports:"அனைத்து", navMyReports:"என் புகார்கள்",
        filterAll:"அனைத்தும்", filterPending:"நிலுவை", filterResolved:"தீர்வு",
        today:"இன்று", daysAgo:"நாட்களுக்கு முன்", daysIgn:"நாட்கள் கவனிக்கப்படவில்லை",
        alertSent:"கவுன்சிலருக்கு எச்சரிக்கை அனுப்பப்பட்டது!", markRes:"தீர்க்கப்பட்டதாகக் குறி",
        stPending:"நிலுவையில்", stProgress:"விசாரணையில்", stResolved:"தீர்க்கப்பட்டது",
        noReports:"புகார்கள் இல்லை", noMyReports:"நீங்கள் இன்னும் புகார் செய்யவில்லை",
        successMsg:"புகார் சமர்ப்பிக்கப்பட்டது!", upvoteAdded:"ஆதரவு!", upvoteRemoved:"ஆதரவு நீக்கப்பட்டது",
        resolvedMsg:"தீர்க்கப்பட்டதாக குறிக்கப்பட்டது!", pleasePhoto:"முதலில் புகைப்படம் பதிவேற்றவும்",
        pleaseLoc:"இடத்தை உள்ளிடவும்", afterPhoto:"பிறகு புகைப்படம்", deleteBtn:"நீக்கு", pinPrompt:"நீக்க PIN ஐ உள்ளிடவும்:", invalidPin:"தவறான PIN!", cancelBtn:"ரத்து"
    }
};

function t(k) { return i18n[lang][k] || k; }

function applyLang() {
    document.querySelectorAll('[data-key]').forEach(el => {
        const k = el.getAttribute('data-key');
        el.innerText = t(k);
    });
    document.querySelectorAll('[data-ph]').forEach(el => {
        el.setAttribute('placeholder', t(el.getAttribute('data-ph')));
    });
    document.getElementById('langToggle').innerText = lang === 'en' ? 'தமிழ்' : 'English';
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = 'Nagarakural-logo.png';
    const linkIcon = document.querySelector('link[rel="icon"]');
    if (linkIcon) linkIcon.href = icon;
    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleIcon) appleIcon.href = icon;
}

document.getElementById('langToggle').onclick = () => {
    lang = lang === 'en' ? 'ta' : 'en';
    localStorage.setItem('nk_lang', lang);
    applyLang();
    renderViews();
};

document.getElementById('themeToggle').onclick = () => {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('nk_theme', theme);
    applyTheme();
};

function showToast(msg) {
    const el = document.getElementById('toast');
    el.innerText = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
}

function switchTab(id) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + id).classList.add('active');
    document.querySelectorAll('.page-container').forEach(el => el.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    renderViews();
}

function filterReports(filter, btn) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderViews();
}

let base64Img = null;
const photoInput = document.getElementById('issuePhoto');
if (photoInput) {
    photoInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > 800) { h = Math.round((h * 800) / w); w = 800; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                base64Img = canvas.toDataURL('image/jpeg', 0.75);
                document.getElementById('photoPreview').src = base64Img;
                document.getElementById('photoPreview').style.display = 'block';
                document.getElementById('photoPlaceholder').style.display = 'none';
                document.getElementById('photoUploadArea').classList.add('has-image');
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };
}

function detectLocation() {
    const btn = document.querySelector('.gps-btn');
    const span = btn.querySelector('span');
    const orig = span.innerText;
    span.innerText = '...';
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
        pos => {
            document.getElementById('issueLocation').value =
                'Lat: ' + pos.coords.latitude.toFixed(5) + ', Lng: ' + pos.coords.longitude.toFixed(5);
            span.innerText = orig;
            btn.disabled = false;
        },
        () => {
            document.getElementById('issueLocation').value = '12, Bharathi Street, Central Zone';
            span.innerText = orig;
            btn.disabled = false;
        }
    );
}

function getSelectedCategory() {
    const checked = document.querySelector('input[name="category"]:checked');
    return checked ? checked.value : 'Road';
}

function submitReport() {
    const cat = getSelectedCategory();
    const loc = document.getElementById('issueLocation').value.trim();
    const desc = document.getElementById('issueDesc').value.trim();
    if (!base64Img) { showToast(t('pleasePhoto')); return; }
    if (!loc) { showToast(t('pleaseLoc')); return; }
    const issue = {
        id: Date.now().toString(),
        photo: base64Img,
        category: cat,
        location: loc,
        desc: desc,
        status: 'Pending',
        upvotes: 1,
        timestamp: Date.now(),
        isMine: true
    };
    issues.unshift(issue);
    upvoted.push(issue.id);
    localStorage.setItem('nk_issues', JSON.stringify(issues));
    localStorage.setItem('nk_upvotes', JSON.stringify(upvoted));
    showToast(t('successMsg'));
    setTimeout(() => location.reload(), 1200);
}

function toggleUpvote(id) {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;
    const idx = upvoted.indexOf(id);
    if (idx > -1) {
        upvoted.splice(idx, 1);
        issue.upvotes = Math.max(0, issue.upvotes - 1);
        showToast(t('upvoteRemoved'));
    } else {
        upvoted.push(id);
        issue.upvotes++;
        showToast(t('upvoteAdded'));
    }
    localStorage.setItem('nk_issues', JSON.stringify(issues));
    localStorage.setItem('nk_upvotes', JSON.stringify(upvoted));
    renderViews();
}

function shareAction(cat, loc) {
    const text = `Nagarakural: Issue reported for ${cat} at ${loc}. Join the community to fix civic issues!`;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

function markRes(id) {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = e => {
        if (!e.target.files[0]) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const issue = issues.find(i => i.id === id);
            issue.status = 'Resolved';
            issue.afterPhoto = ev.target.result;
            localStorage.setItem('nk_issues', JSON.stringify(issues));
            showToast(t('resolvedMsg'));
            renderViews();
        };
        reader.readAsDataURL(e.target.files[0]);
    };
    input.click();
}

let reportToDelete = null;

function deleteReport(id) {
    reportToDelete = id;
    const pinInput = document.getElementById('deletePinInput');
    pinInput.value = '';
    document.getElementById('deleteModal').classList.add('show');
    setTimeout(() => pinInput.focus(), 100);
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    reportToDelete = null;
}

function confirmDeleteReport() {
    const pin = document.getElementById('deletePinInput').value;
    if (pin !== '1701') {
        showToast(t('invalidPin'));
        return;
    }
    if (reportToDelete) {
        const idx = issues.findIndex(i => i.id === reportToDelete);
        if(idx > -1) {
            issues.splice(idx, 1);
            localStorage.setItem('nk_issues', JSON.stringify(issues));
            renderViews();
            showToast('Report deleted!');
        }
    }
    closeDeleteModal();
}

function getDaysTxt(iss) {
    const d = Math.floor((Date.now() - iss.timestamp) / 86400000);
    if (d === 0) return t('today');
    return d + ' ' + (iss.status === 'Resolved' ? t('daysAgo') : t('daysIgn'));
}

function getStatusBadgeClass(st) {
    return st === 'Pending' ? 'badge-pending' : st === 'In Progress' ? 'badge-progress' : 'badge-resolved';
}
function getStatusKey(st) {
    return st === 'Pending' ? 'stPending' : st === 'In Progress' ? 'stProgress' : 'stResolved';
}

const catEmoji = { Road:'🛣️', Garbage:'🗑️', Water:'💧', Streetlight:'💡', Drain:'🌊' };

function htmlCard(iss, noResBtn) {
    const hasVoted = upvoted.includes(iss.id);
    const stClass = getStatusBadgeClass(iss.status);
    const stLabel = t(getStatusKey(iss.status));
    const catLabel = t('cat' + iss.category);
    const emoji = catEmoji[iss.category] || '📍';

    return `
<div class="issue-card">
    <div class="card-img-wrap">
        <img src="${iss.photo}" class="card-img" loading="lazy" alt="${catLabel}">
        <div class="card-img-overlay"></div>
        <div class="card-badges">
            <span class="badge badge-cat">${emoji} ${catLabel}</span>
            <span class="badge ${stClass}"><span class="badge-dot"></span>${stLabel}</span>
        </div>
    </div>
    <div class="card-body">
        <div class="card-location">${iss.location}</div>
        <div class="card-meta">
            🗓 ${getDaysTxt(iss)}
            <span class="card-meta-dot"></span>
            👍 ${iss.upvotes} votes
        </div>
        ${iss.desc ? `<div class="card-desc">${iss.desc}</div>` : ''}
        ${iss.upvotes >= 25 ? `<div class="alert-banner">⚠️ ${t('alertSent')}</div>` : ''}
        ${iss.afterPhoto ? `
        <div class="after-photo-wrap">
            <div class="after-photo-label">✓ ${t('afterPhoto')}</div>
            <img src="${iss.afterPhoto}" class="after-photo" loading="lazy" alt="After">
        </div>` : ''}
        ${(iss.isMine && iss.status !== 'Resolved' && !noResBtn) ? `
        <div class="resolve-box">
            <button class="resolve-btn" onclick="markRes('${iss.id}')">✓ ${t('markRes')}</button>
        </div>` : ''}
        <div class="card-actions">
            <button class="action-btn ${hasVoted ? 'upvoted' : ''}" onclick="toggleUpvote('${iss.id}')">
                👍 ${iss.upvotes}
            </button>
            <button class="action-btn share" onclick="shareAction('${iss.category}','${iss.location}')">
                📤 Share
            </button>
            ${iss.isMine ? `
            <button class="action-btn" style="color:var(--red); border-color:var(--red-soft);" onclick="deleteReport('${iss.id}')">
                🗑️ ${t('deleteBtn')}
            </button>` : ''}
        </div>
    </div>
</div>`;
}

function renderViews() {
    const allEl = document.getElementById('allReportsList');
    if (allEl) {
        let filtered = currentFilter === 'all'
            ? issues
            : issues.filter(i => i.status === currentFilter);
        allEl.innerHTML = filtered.length
            ? filtered.map(i => htmlCard(i, true)).join('')
            : `<div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-title">${t('noReports')}</div>
                <div class="empty-sub">Be the first to report an issue</div>
               </div>`;
    }
    const myEl = document.getElementById('myReportsList');
    if (myEl) {
        const mine = issues.filter(i => i.isMine);
        myEl.innerHTML = mine.length
            ? mine.map(i => htmlCard(i, false)).join('')
            : `<div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-title">${t('noMyReports')}</div>
                <div class="empty-sub">Your submitted reports will appear here</div>
               </div>`;
    }
}

applyLang();
applyTheme();
renderViews();

// Web Splash Screen Dismissal
const splash = document.getElementById('web-splash');
if (splash) {
    const isElectron = navigator.userAgent.toLowerCase().includes('electron');
    if (isElectron) {
        // Remove instantly in desktop Electron app to avoid double loading screens
        splash.remove();
    } else {
        // Keep visible for 2.5 seconds on web, then fade out and remove
        setTimeout(() => {
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.remove();
            }, 500);
        }, 2500);
    }
}

