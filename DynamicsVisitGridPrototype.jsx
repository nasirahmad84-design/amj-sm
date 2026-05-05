import React from "react";

const rows = [
  { id: "V-0595", stage: "Planned", customer: "Aral", type: "Ship2Tank", incident: "Barge Receipt", date: "5/5/2026 11:13 AM" },
  { id: "V-0594", stage: "Planned", customer: "Aral", type: "Ship2Tank", incident: "Barge Receipt", date: "5/5/2026 9:52 AM" },
  { id: "V-0593", stage: "Planned", customer: "Aral", type: "Ship2Tank", incident: "Barge Receipt", date: "5/5/2026 9:47 AM" },
  { id: "V-0592", stage: "Planned", customer: "Aral", type: "Ship2Tank", incident: "Barge Receipt", date: "5/5/2026 9:43 AM" },
  { id: "V-0591", stage: "Planned", customer: "Aral", type: "Ship2Tank", incident: "Barge Receipt", date: "5/4/2026 1:12 PM" },
  { id: "V-0590", stage: "Planned", customer: "Aral", type: "Ship2Tank", incident: "Barge Receipt", date: "4/29/2026 7:47 PM" },
];

const icon = {
  search: "🔎",
  bell: "◷",
  gear: "⚙",
  help: "?",
  chevron: "⌄",
  filter: "⛃",
};

export default function App() {
  return (
    <div style={styles.page}>
      <style>{css}</style>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.msDots}>⋮⋮</div>
          <span style={styles.headerBrand}>Dynamics 365</span>
          <div style={styles.headerDivider} />
          <span style={styles.headerApp}>OpenTAS 365</span>
        </div>
        <div style={styles.headerCenter}>
          <div style={styles.searchShell}><span style={styles.searchIcon}>{icon.search}</span>Search</div>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.env}>SANDBOX</span>
          <span style={styles.topIcon}>◌</span>
          <span style={styles.topIcon}>＋</span>
          <span style={styles.topIcon}>◔</span>
          <span style={styles.topIcon}>{icon.gear}</span>
          <span style={styles.topIcon}>{icon.help}</span>
          <button style={styles.copilot}>Copilot</button>
          <div style={styles.avatar}>A</div>
        </div>
      </header>

      <div style={styles.body}>
        <aside style={styles.sidebar}>
          <div style={styles.sideTop}>☰</div>
          <NavSection title="Home" items={["Home", "Recent", "Pinned"]} />
          <NavSection
            title="Operations"
            items={["Terminal View", "Visit", "Visit Details", "Work Order", "Resource Booking", "Measurement"]}
            active="Visit"
          />
          <NavSection title="Inventory" items={["Inventory", "Inventory Journals", "Product Stocks", "Inventory Transfers"]} />
          <NavSection title="Scheduling" items={[]} collapsed />
          <div style={styles.sideFooter}>Operations</div>
        </aside>

        <main style={styles.main}>
          <section style={styles.gridShell}>
            <div style={styles.gridHeader}>
              <div style={styles.titleRow}>
                <span style={styles.title}>Active Visits</span>
              </div>
              <div style={styles.commandBar}>
                {[
                  "Focused view",
                  "Show Chart",
                  "New",
                  "Delete",
                  "Refresh",
                  "Visualize this view",
                  "Email a Link",
                  "More (...)",
                ].map((cmd) => (
                  <button key={cmd} style={styles.commandBtn}>{cmd}</button>
                ))}
              </div>
              <div style={styles.utilityRow}>
                <div style={styles.quickFind}><span style={styles.searchIcon}>{icon.search}</span>Ask about data in this table.</div>
                <button style={styles.filterChip}>Status: Active ✕</button>
                <button style={styles.visualizeBtn}>Visualize</button>
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.checkboxCol}><input type="checkbox" /></th>
                    <th>Name ↓</th>
                    <th>Visit Stage ⌄</th>
                    <th>Customer ⌄</th>
                    <th>Work Order Type ⌄</th>
                    <th>Incident Type ⌄</th>
                    <th>Created On ⌄</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="dyn-row">
                      <td style={styles.checkboxCol}><input type="checkbox" /></td>
                      <td><a href="#" style={styles.link}>{r.id}</a></td>
                      <td>{r.stage}</td>
                      <td><a href="#" style={styles.link}>{r.customer}</a></td>
                      <td><a href="#" style={styles.link}>{r.type}</a></td>
                      <td><a href="#" style={styles.link}>{r.incident}</a></td>
                      <td>{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={styles.footer}>Rows: 595</div>
          </section>
        </main>
      </div>
    </div>
  );
}

function NavSection({ title, items, active, collapsed }) {
  return (
    <div style={styles.navSection}>
      <div style={styles.navTitle}>{title}{collapsed ? "" : ""}</div>
      {!collapsed && items.map((item) => (
        <div key={item} style={item === active ? styles.navItemActive : styles.navItem}>{item}</div>
      ))}
    </div>
  );
}

const css = `
  .dyn-row:hover { background: #f5f5f5; }
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    border: 1px solid #8a8886;
    accent-color: #0f6cbd;
  }
`;

const styles = {
  page: { fontFamily: "Segoe UI, Arial, sans-serif", background: "#F3F4F6", color: "#323130", height: "100vh", overflow: "hidden" },
  header: { height: 56, background: "#0B2A4A", color: "#fff", display: "flex", alignItems: "center", padding: "0 12px", justifyContent: "space-between" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12, minWidth: 320 },
  msDots: { fontSize: 14, opacity: 0.9 },
  headerBrand: { fontSize: 28, fontWeight: 300 },
  headerDivider: { width: 1, height: 24, background: "rgba(255,255,255,.4)" },
  headerApp: { fontSize: 24, fontWeight: 300 },
  headerCenter: { flex: 1, display: "flex", justifyContent: "center" },
  searchShell: { width: 470, height: 36, background: "#f3f2f1", color: "#605e5c", border: "1px solid #8a8886", display: "flex", alignItems: "center", padding: "0 12px", fontSize: 22 },
  searchIcon: { marginRight: 8, fontSize: 14 },
  headerRight: { display: "flex", alignItems: "center", gap: 14 },
  env: { fontSize: 20, letterSpacing: 1 },
  topIcon: { fontSize: 18 },
  copilot: { border: "1px solid #f1b800", background: "#0f2d4d", color: "#fff", borderRadius: 4, padding: "6px 12px" },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#c8c6c4", color: "#222", display: "grid", placeItems: "center", fontWeight: 600 },
  body: { display: "flex", height: "calc(100vh - 56px)" },
  sidebar: { width: 200, background: "#dcdcdc", borderRight: "1px solid #c8c6c4", display: "flex", flexDirection: "column" },
  sideTop: { height: 40, display: "flex", alignItems: "center", paddingLeft: 12, color: "#605e5c" },
  navSection: { paddingTop: 6 },
  navTitle: { fontWeight: 600, fontSize: 25, padding: "8px 18px" },
  navItem: { fontSize: 27, padding: "8px 18px", color: "#323130" },
  navItemActive: { fontSize: 27, padding: "8px 18px", background: "#ececec", borderLeft: "3px solid #0f6cbd" },
  sideFooter: { marginTop: "auto", borderTop: "1px solid #c8c6c4", padding: 12, fontWeight: 600 },
  main: { flex: 1, padding: 14, overflow: "hidden" },
  gridShell: { background: "#fff", border: "1px solid #e0e0e0", borderRadius: 6, height: "100%", display: "flex", flexDirection: "column", boxShadow: "0 1px 2px rgba(0,0,0,.08)" },
  gridHeader: { borderBottom: "1px solid #e0e0e0" },
  titleRow: { padding: "14px 16px 6px", fontSize: 35, fontWeight: 600 },
  title: {},
  commandBar: { display: "flex", gap: 4, padding: "0 8px 10px", borderBottom: "1px solid #e0e0e0", flexWrap: "wrap" },
  commandBtn: { background: "transparent", border: "none", padding: "8px 10px", color: "#323130", fontSize: 24 },
  utilityRow: { display: "flex", alignItems: "center", gap: 10, padding: 10 },
  quickFind: { flex: 1, border: "1px solid #c8c6c4", borderRadius: 2, height: 34, display: "flex", alignItems: "center", padding: "0 10px", color: "#605e5c", fontSize: 21 },
  filterChip: { height: 34, borderRadius: 14, border: "1px solid #c8c6c4", background: "#f3f2f1", padding: "0 12px", fontSize: 22 },
  visualizeBtn: { marginLeft: "auto", height: 34, border: "1px solid #605eff", borderRadius: 4, background: "#fff", padding: "0 16px" },
  tableWrap: { overflow: "auto", flex: 1, padding: "10px 22px 0" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 27 },
  checkboxCol: { width: 40 },
  link: { color: "#0F6CBD", textDecoration: "none" },
  footer: { borderTop: "1px solid #e0e0e0", padding: "10px 16px", fontSize: 28 },
};
