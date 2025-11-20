<div class="app-shell">
  <header class="top-bar">
    <div>
      <p class="eyebrow">Gebetstracker für AMJ Nidda</p>
      <h1>Besucher erfassen &amp; auswerten</h1>
    </div>
    <div class="status">
      <div id="timeNow" class="time">--:--</div>
      <div id="currentPrayer" class="current">Aktuelles Gebet wird geladen …</div>
    </div>
  </header>

  <div class="tabs">
    <button class="tab active" data-tab="home">Erfassung</button>
    <button class="tab" data-tab="dashboard">Dashboard</button>
  </div>

  <div class="tab-panel active" id="tab-home">
    <section class="card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Altersgruppe</p>
          <h2>Wähle eine Gruppe</h2>
          <p class="muted" id="selectedGroup">Keine Auswahl</p>
        </div>
      </div>
      <div class="group-grid" id="groupSelector">
        <button class="group-card" data-group="Atfal">
          <span class="title">Atfal</span>
          <span class="muted">Kinder</span>
        </button>
        <button class="group-card" data-group="Khuddam">
          <span class="title">Khuddam</span>
          <span class="muted">Jugend</span>
        </button>
        <button class="group-card" data-group="Ansar">
          <span class="title">Ansar</span>
          <span class="muted">Erwachsene</span>
        </button>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Gebetszeiten</p>
          <h2>Aktuelle Zeiten</h2>
        </div>
      </div>
      <div class="prayer-grid" id="prayerGrid"></div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Eintrag anlegen</p>
          <h2>Besucher pro Gebet</h2>
        </div>
      </div>
      <form id="entryForm" class="form-grid">
        <label>
          Gebet
          <select id="prayerSelect"></select>
        </label>
        <label>
          Anzahl Besucher
          <input id="countInput" type="number" min="1" inputmode="numeric" required />
        </label>
        <button type="submit" class="primary">Eintragen</button>
        <button type="button" class="ghost" id="clearEntries">Heutige Einträge leeren</button>
      </form>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Heute</p>
          <h2>Letzte Einträge</h2>
        </div>
      </div>
      <ul id="entryList" class="entry-list"></ul>
    </section>
  </div>

  <div class="tab-panel" id="tab-dashboard">
    <section class="card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Auswertung</p>
          <h2>Statistik &amp; Export</h2>
        </div>
        <div class="filters">
          <label>
            Zeitraum
            <select id="rangeSelect">
              <option value="day">Tag</option>
              <option value="week">Woche</option>
              <option value="month">Monat</option>
            </select>
          </label>
          <label>
            Referenz
            <input type="date" id="referenceDate" />
          </label>
          <button class="ghost" id="exportPdf">Als PDF exportieren</button>
        </div>
      </div>
      <div id="statsSummary" class="stats-grid"></div>
    </section>
  </div>
</div>
