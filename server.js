const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'workshop_registrations.db'));
db.prepare(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    workshop TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    answers TEXT NOT NULL
  )
`).run();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const buildTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = buildTransporter();

app.post('/api/registrations', (req, res) => {
  const { workshop, fullName, email, phone, organization, answers } = req.body;

  if (!workshop || !fullName || !email || !answers) {
    return res.status(400).json({ message: 'Bitte füllen Sie alle Pflichtfelder aus.' });
  }

  const insert = db.prepare(`
    INSERT INTO registrations (workshop, full_name, email, phone, organization, answers)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    workshop,
    fullName,
    email,
    phone || '',
    organization || '',
    JSON.stringify(answers)
  );

  if (transporter) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    const answerLines = Object.entries(answers)
      .map(([question, response]) => `${question}: ${response}`)
      .join('\n');

    const message = {
      from: `AMJ Social Media Workshops <${process.env.SMTP_USER}>`,
      to: [email, adminEmail].filter(Boolean).join(', '),
      subject: `Neue Anmeldung: ${workshop}`,
      text: `Salam ${fullName},\n\nVielen Dank für Ihr Interesse am Workshop "${workshop}".\n\nZusammenfassung Ihrer Angaben:\n${answerLines}\n\nWir melden uns zeitnah bei Ihnen.\n\nWassalam,\nAhmadiyya Muslim Jamaat Social Media Team`
    };

    transporter.sendMail(message).catch((err) => {
      console.error('Fehler beim Versenden der E-Mail:', err.message);
    });
  } else {
    console.info('SMTP-Daten nicht gesetzt. Anmeldung wurde gespeichert, aber keine E-Mail versendet.');
  }

  res.status(201).json({
    id: result.lastInsertRowid,
    message: 'Vielen Dank! Wir haben Ihre Anfrage erhalten.'
  });
});

app.get('/api/registrations/export', (req, res) => {
  const rows = db.prepare('SELECT * FROM registrations ORDER BY created_at DESC').all();

  const csvHeader = 'id,created_at,workshop,full_name,email,phone,organization,answers\n';
  const csvBody = rows
    .map((row) => {
      const answers = JSON.stringify(JSON.parse(row.answers));
      return [row.id, row.created_at, row.workshop, row.full_name, row.email, row.phone, row.organization, answers]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',');
    })
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
  res.send(csvHeader + csvBody);
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
