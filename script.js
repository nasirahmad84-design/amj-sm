const prayers = window.AMJTracker?.prayers ?? [];
const groups = window.AMJTracker?.groups ?? [];

const els = {
  timeNow: document.getElementById('timeNow'),
  currentPrayer: document.getElementById('currentPrayer'),
  groupSelector: document.getElementById('groupSelector'),
  selectedGroup: document.getElementById('selectedGroup'),
  prayerGrid: document.getElementById('prayerGrid'),
  prayerSelect: document.getElementById('prayerSelect'),
  countInput: document.getElementById('countInput'),
  entryForm: document.getElementById('entryForm'),
  entryList: document.getElementById('entryList'),
  clearEntries: document.getElementById('clearEntries'),
  tabs: document.querySelectorAll('.tab'),
  panels: document.querySelectorAll('.tab-panel'),
  rangeSelect: document.getElementById('rangeSelect'),
  referenceDate: document.getElementById('referenceDate'),
  statsSummary: document.getElementById('statsSummary'),
  exportPdf: document.getElementById('exportPdf')
};

let selectedGroup = null;
let entriesToday = [];
let summaryData = {};
let rangeLabel = '';

function getTodayISO(date = new Date()) {
  return date.toISOString().split('T')[0];
}

function setActiveGroup(group) {
  selectedGroup = group;
  els.selectedGroup.textContent = group ? `Ausgewählt: ${group}` : 'Keine Auswahl';
  els.groupSelector?.querySelectorAll('.group-card').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.group === group);
  });
}

function renderPrayerCards() {
  if (!els.prayerGrid) return;
  els.prayerGrid.innerHTML = '';
  prayers.forEach((prayer) => {
    const card = document.createElement('div');
    card.className = 'prayer-card';
    card.dataset.prayer = prayer.id;
    card.innerHTML = `
      <span class="tag">${prayer.label}</span>
      <div class="name">${prayer.name}</div>
      <div class="time">${prayer.time} Uhr</div>
      <small>${prayer.id === 'jumma' ? 'Nur freitags' : 'Tägliches Gebet'}</small>
    `;
    els.prayerGrid.appendChild(card);
  });
}

function populatePrayerSelect() {
  if (!els.prayerSelect) return;
  els.prayerSelect.innerHTML = prayers
    .map((p) => `<option value="${p.id}">${p.name} (${p.time} Uhr)</option>`)
    .join('');
}

function formatTime(date) {
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function determineCurrentPrayer() {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const sorted = [...prayers]
    .filter((p) => p.id !== 'jumma')
    .map((p) => {
      const [h, m] = p.time.split(':').map(Number);
      return { ...p, minutes: h * 60 + m };
    })
    .sort((a, b) => a.minutes - b.minutes);

  let current = sorted[sorted.length - 1];
  for (const prayer of sorted) {
    if (minutesNow < prayer.minutes) {
      current = prayer;
      break;
    }
    current = prayer;
  }

  return current;
}

function updateClock() {
  if (!els.timeNow || !els.currentPrayer) return;
  const now = new Date();
  els.timeNow.textContent = formatTime(now);
  const current = determineCurrentPrayer();
  if (current) {
    els.currentPrayer.textContent = `Aktuelles Gebet: ${current.name} um ${current.time} Uhr`;
    highlightCurrentPrayer(current.id);
  }
}

function highlightCurrentPrayer(currentId) {
  document.querySelectorAll('.prayer-card').forEach((card) => {
    card.classList.toggle('highlight', card.dataset.prayer === currentId);
  });
  Array.from(els.prayerSelect?.options ?? []).forEach((opt) => {
    if (opt.value === currentId) {
      els.prayerSelect.value = currentId;
    }
  });
}

function renderEntries() {
  if (!els.entryList) return;
  els.entryList.innerHTML = '';

  if (!entriesToday.length) {
    els.entryList.innerHTML = '<li class="empty">Noch keine Einträge für heute.</li>';
    return;
  }

  entriesToday.forEach((entry) => {
    const li = document.createElement('li');
    li.className = 'entry-card';
    const prayer = prayers.find((p) => p.id === entry.prayer);
    li.innerHTML = `
      <div class="entry-meta">
        <span class="dot"></span>
        <div>
          <div class="title">${entry.attendees} Besucher · ${prayer?.name ?? entry.prayer}</div>
          <div class="sub">${entry.age_group} · ${entry.entry_time ?? ''}</div>
        </div>
      </div>
      <span class="sub">${entry.entry_date}</span>
    `;
    els.entryList.appendChild(li);
  });
}

function attachGroupHandlers() {
  els.groupSelector?.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-group]');
    if (!button) return;
    setActiveGroup(button.dataset.group);
  });
}

function handleEntrySubmit(e) {
  e.preventDefault();
  if (!selectedGroup) {
    alert('Bitte wähle zuerst eine Altersgruppe.');
    return;
  }
  const prayerId = els.prayerSelect.value;
  const count = Number(els.countInput.value);
  if (!count || count < 1) return;

  const now = new Date();
  const payload = {
    prayerId,
    ageGroup: selectedGroup,
    count,
    entryDate: getTodayISO(now)
  };
  saveEntry(payload);
  els.countInput.value = '';
}

function attachFormHandlers() {
  els.entryForm?.addEventListener('submit', handleEntrySubmit);
  els.clearEntries?.addEventListener('click', () => {
    if (!confirm('Sollen die heutigen Einträge wirklich entfernt werden?')) return;
    deleteTodayEntries();
  });
}

function attachTabHandlers() {
  els.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      els.tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      els.panels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === `tab-${tab.dataset.tab}`);
      });
    });
  });
}

function setDefaultDate() {
  if (els.referenceDate) {
    els.referenceDate.value = getTodayISO();
  }
}

function getRangeBounds(reference, mode) {
  const date = new Date(reference);
  if (Number.isNaN(date.getTime())) return null;

  if (mode === 'day') {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end, label: date.toLocaleDateString('de-DE') };
  }

  if (mode === 'week') {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(date);
    start.setDate(date.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const formatter = new Intl.DateTimeFormat('de-DE');
    return { start, end, label: `${formatter.format(start)} – ${formatter.format(end)}` };
  }

  if (mode === 'month') {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const formatter = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
    return { start, end, label: formatter.format(start) };
  }

  return null;
}

function renderStats() {
  const rangeMode = els.rangeSelect?.value;
  const range = getRangeBounds(els.referenceDate?.value, rangeMode);
  if (!range || !els.statsSummary) return;
  els.statsSummary.innerHTML = '';

  prayers.forEach((prayer) => {
    const info = summaryData[prayer.id] ?? { total: 0, groups: {} };
    const detail = groups.map((g) => `${g}: ${info.groups?.[g] ?? 0} Besucher`).join(' · ');
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <h3>${prayer.name}</h3>
      <div class="total">${info.total ?? 0}</div>
      <div class="detail">${detail}</div>
      <div class="detail">Zeitraum: ${rangeLabel || range.label}</div>
    `;
    els.statsSummary.appendChild(card);
  });
}

function attachDashboardHandlers() {
  els.rangeSelect?.addEventListener('change', refreshData);
  els.referenceDate?.addEventListener('change', refreshData);
  els.exportPdf?.addEventListener('click', exportStatsToPDF);
}

function exportStatsToPDF() {
  const rangeMode = els.rangeSelect?.value;
  const range = getRangeBounds(els.referenceDate?.value, rangeMode);
  if (!range || !window.jspdf) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.text('Gebetstracker AMJ Nidda – Statistik', 14, 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`Zeitraum: ${rangeLabel || range.label} (${rangeMode})`, 14, 26);
  doc.text(`Exportiert am ${new Date().toLocaleString('de-DE')}`, 14, 34);

  let y = 46;
  prayers.forEach((prayer) => {
    const info = summaryData[prayer.id] ?? { total: 0, groups: {} };
    doc.setFont('helvetica', 'bold');
    doc.text(prayer.name, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gesamt: ${info.total ?? 0} Besucher`, 14, y + 8);
    doc.text(
      groups.map((g) => `${g}: ${info.groups?.[g] ?? 0} Besucher`).join(' · '),
      14,
      y + 16
    );
    y += 24;
  });

  doc.save(`gebetstracker-statistik-${rangeMode}.pdf`);
}

async function saveEntry(payload) {
  const body = new URLSearchParams({
    action: 'amj_save_entry',
    nonce: window.AMJTracker.nonce,
    ...payload,
  });

  const res = await fetch(window.AMJTracker.ajaxUrl, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  if (!data.success) {
    alert(data.data?.message ?? 'Eintrag konnte nicht gespeichert werden.');
    return;
  }
  await refreshData();
}

async function deleteTodayEntries() {
  const today = getTodayISO();
  const res = await fetch(window.AMJTracker.ajaxUrl, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'amj_delete_today',
      nonce: window.AMJTracker.nonce,
      entryDate: today,
    }),
  });

  const data = await res.json();
  if (!data.success) {
    alert(data.data?.message ?? 'Löschen nicht möglich.');
    return;
  }
  await refreshData();
}

async function refreshData() {
  const rangeMode = els.rangeSelect?.value || 'day';
  const referenceDate = els.referenceDate?.value || getTodayISO();
  const params = new URLSearchParams({
    action: 'amj_get_entries',
    nonce: window.AMJTracker.nonce,
    range: rangeMode,
    reference: referenceDate,
  });

  const res = await fetch(`${window.AMJTracker.ajaxUrl}?${params.toString()}`, {
    credentials: 'same-origin',
  });
  const data = await res.json();
  if (!data.success) {
    console.error(data.data?.message || 'Fehler beim Laden der Einträge');
    return;
  }

  entriesToday = data.data.todayEntries ?? [];
  summaryData = data.data.summary ?? {};
  rangeLabel = data.data.rangeLabel ?? '';
  renderEntries();
  renderStats();
}

function init() {
  if (!window.AMJTracker) {
    console.warn('AMJTracker Daten nicht gefunden.');
    return;
  }
  renderPrayerCards();
  populatePrayerSelect();
  attachGroupHandlers();
  attachFormHandlers();
  attachTabHandlers();
  attachDashboardHandlers();
  setDefaultDate();
  refreshData();
  updateClock();
  setInterval(updateClock, 1000 * 30);
}

init();
