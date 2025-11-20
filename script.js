const prayers = [
  { id: 'fajr', name: 'Fajr', time: '06:30', label: 'Morgen' },
  { id: 'zohr', name: 'Zohr', time: '13:30', label: 'Mittag' },
  { id: 'assr', name: 'Assr', time: '13:30', label: 'Nachmittag' },
  { id: 'maghrib', name: 'Maghrib', time: '16:50', label: 'Abend' },
  { id: 'isha', name: 'Isha', time: '19:00', label: 'Nacht' },
  { id: 'jumma', name: 'Jumma', time: '13:15', label: 'Freitag' }
];

const groups = ['Atfal', 'Khuddam', 'Ansar'];

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

const STORAGE_KEY = 'amj-prayer-entries-v1';
let selectedGroup = null;

function getTodayISO(date = new Date()) {
  return date.toISOString().split('T')[0];
}

function loadEntries() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

let entries = loadEntries();

function setActiveGroup(group) {
  selectedGroup = group;
  els.selectedGroup.textContent = group ? `Ausgewählt: ${group}` : 'Keine Auswahl';
  els.groupSelector.querySelectorAll('.group-card').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.group === group);
  });
}

function renderPrayerCards() {
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
  const now = new Date();
  els.timeNow.textContent = formatTime(now);
  const current = determineCurrentPrayer();
  els.currentPrayer.textContent = `Aktuelles Gebet: ${current.name} um ${current.time} Uhr`;
  highlightCurrentPrayer(current.id);
}

function highlightCurrentPrayer(currentId) {
  document.querySelectorAll('.prayer-card').forEach((card) => {
    card.classList.toggle('highlight', card.dataset.prayer === currentId);
  });
  Array.from(els.prayerSelect.options).forEach((opt) => {
    if (opt.value === currentId) {
      els.prayerSelect.value = currentId;
    }
  });
}

function renderEntries() {
  const today = getTodayISO();
  const todaysEntries = entries.filter((e) => e.date === today);
  els.entryList.innerHTML = '';

  if (!todaysEntries.length) {
    els.entryList.innerHTML = '<li class="empty">Noch keine Einträge für heute.</li>';
    return;
  }

  todaysEntries
    .slice()
    .reverse()
    .forEach((entry) => {
      const li = document.createElement('li');
      li.className = 'entry-card';
      const prayer = prayers.find((p) => p.id === entry.prayerId);
      li.innerHTML = `
        <div class="entry-meta">
          <span class="dot"></span>
          <div>
            <div class="title">${entry.count} Besucher · ${prayer?.name ?? entry.prayerId}</div>
            <div class="sub">${entry.group} · ${entry.time}</div>
          </div>
        </div>
        <span class="sub">${entry.date}</span>
      `;
      els.entryList.appendChild(li);
    });
}

function addEntry(data) {
  entries.push(data);
  saveEntries(entries);
  renderEntries();
  updateStats();
}

function attachGroupHandlers() {
  els.groupSelector.addEventListener('click', (e) => {
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
  addEntry({
    prayerId,
    group: selectedGroup,
    count,
    time: formatTime(now),
    date: getTodayISO(now),
    timestamp: now.toISOString()
  });
  els.countInput.value = '';
}

function attachFormHandlers() {
  els.entryForm.addEventListener('submit', handleEntrySubmit);
  els.clearEntries.addEventListener('click', () => {
    const today = getTodayISO();
    entries = entries.filter((e) => e.date !== today);
    saveEntries(entries);
    renderEntries();
    updateStats();
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
  els.referenceDate.value = getTodayISO();
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
    const diff = (day === 0 ? -6 : 1 - day); // Monday as first day
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

function filterEntriesByRange(range) {
  if (!range) return [];
  return entries.filter((entry) => {
    const ts = new Date(entry.timestamp).getTime();
    return ts >= range.start.getTime() && ts <= range.end.getTime();
  });
}

function summarizeByPrayer(range) {
  const filtered = filterEntriesByRange(range);
  const summary = prayers.reduce((acc, prayer) => {
    acc[prayer.id] = { total: 0, groups: {} };
    groups.forEach((g) => (acc[prayer.id].groups[g] = 0));
    return acc;
  }, {});

  filtered.forEach((entry) => {
    const bucket = summary[entry.prayerId];
    if (bucket) {
      bucket.total += entry.count;
      bucket.groups[entry.group] += entry.count;
    }
  });

  return summary;
}

function renderStats() {
  const rangeMode = els.rangeSelect.value;
  const range = getRangeBounds(els.referenceDate.value, rangeMode);
  if (!range) return;
  const summary = summarizeByPrayer(range);
  els.statsSummary.innerHTML = '';

  prayers.forEach((prayer) => {
    const info = summary[prayer.id];
    const detail = groups
      .map((g) => `${g}: ${info.groups[g]} Besucher`)
      .join(' · ');
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <h3>${prayer.name}</h3>
      <div class="total">${info.total}</div>
      <div class="detail">${detail}</div>
      <div class="detail">Zeitraum: ${range.label}</div>
    `;
    els.statsSummary.appendChild(card);
  });
}

function updateStats() {
  renderStats();
}

function attachDashboardHandlers() {
  els.rangeSelect.addEventListener('change', renderStats);
  els.referenceDate.addEventListener('change', renderStats);
  els.exportPdf.addEventListener('click', exportStatsToPDF);
}

function exportStatsToPDF() {
  const rangeMode = els.rangeSelect.value;
  const range = getRangeBounds(els.referenceDate.value, rangeMode);
  if (!range) return;

  const summary = summarizeByPrayer(range);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.text('Gebetstracker AMJ Nidda – Statistik', 14, 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`Zeitraum: ${range.label} (${rangeMode})`, 14, 26);
  doc.text(`Exportiert am ${new Date().toLocaleString('de-DE')}`, 14, 34);

  let y = 46;
  prayers.forEach((prayer) => {
    const info = summary[prayer.id];
    doc.setFont('helvetica', 'bold');
    doc.text(prayer.name, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gesamt: ${info.total} Besucher`, 14, y + 8);
    doc.text(
      groups.map((g) => `${g}: ${info.groups[g]} Besucher`).join(' · '),
      14,
      y + 16
    );
    y += 24;
  });

  doc.save(`gebetstracker-statistik-${rangeMode}.pdf`);
}

function init() {
  renderPrayerCards();
  populatePrayerSelect();
  attachGroupHandlers();
  attachFormHandlers();
  attachTabHandlers();
  attachDashboardHandlers();
  renderEntries();
  setDefaultDate();
  renderStats();
  updateClock();
  setInterval(updateClock, 1000 * 30);
}

init();
