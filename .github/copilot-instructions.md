# Copilot Instructions for Gebäude-Info Webanwendung

## Projektüberblick
- Die Anwendung ist eine reine HTML/CSS/JavaScript-App zur Anzeige von Hausdaten für die Feuerwehr.
- Datenquelle ist eine CSV-Datei (`data.csv`), die im selben Verzeichnis wie die Anwendung liegt und direkt im Frontend geladen wird.
- Die App ist für Tablets und Desktop optimiert, mit Fokus auf schnelle Bedienung und Übersichtlichkeit im Einsatz.

## Architektur & Komponenten
- **index.html**: Einstiegspunkt, enthält alle UI-Elemente (Suchfeld, Filter, Listen, Detailansicht).
- **app.js**: Enthält die gesamte Logik:
  - CSV-Parsing (keine externen Libraries)
  - Datenfilterung (Suche, Haustyp, Heizart)
  - Favoritenfunktion (Local Storage)
  - Navigation (Straßenliste, Hausnummernliste, Detailansicht)
  - Druckansicht und mobile Optimierung
- **style.css**: Layout und Responsive Design, inkl. Druckansicht.
- **.gitignore**: Schließt alle `.csv`-Dateien aus dem Git-Tracking aus.

## Entwickler-Workflows
- **Build/Deploy:** Keine Build-Tools nötig. Einfaches Kopieren der Dateien auf den Webserver (z.B. Apache2).
- **Debugging:** Änderungen an JS/HTML/CSS sind sofort nach Neuladen im Browser sichtbar.
- **Datenpflege:** CSV-Datei kann direkt editiert werden. Spaltennamen müssen mit den im Code verwendeten Feldern übereinstimmen.
- **Favoriten:** Werden im Local Storage des Browsers gespeichert.

## Konventionen & Patterns
- **Kategorien:** Detailansicht gruppiert Felder in Kategorien (Kontakt, Gebäude, Strom/Gas/Solar, Gefahren, Rechtliches, Sonstiges).
- **Nur ausgefüllte Felder:** Es werden nur Felder angezeigt, die tatsächlich Werte enthalten.
- **Navigation:** Listen und Detailansicht sind klar getrennt; Navigation erfolgt über Buttons und Listen.
- **Keine externen Abhängigkeiten:** Alles ist Vanilla JS/HTML/CSS.
- **Druckansicht:** Button in der Detailansicht, CSS optimiert für Ausdruck.

## Integration & Erweiterung
- **Webserver:** Für Zugangsschutz empfiehlt sich HTTP Basic Auth über Apache2 (siehe README).
- **Erweiterungen:** Neue Felder/Kategorien können direkt in `app.js` ergänzt werden.
- **Mobile/Tablet:** Layout ist für Touch optimiert, aber auch auf Desktop nutzbar.

## Beispiel für neue Kategorie
```js
// In app.js, Funktion renderCategories:
{
  name: 'Neue Kategorie',
  fields: ['NeuesFeld1', 'NeuesFeld2']
}
```

## Wichtige Dateien
- `index.html`, `app.js`, `style.css`, `.gitignore`, `README.md`, `.github/copilot-instructions.md`

---
Bitte Feedback geben, falls wichtige Workflows, Konventionen oder Integrationspunkte fehlen oder unklar sind!
