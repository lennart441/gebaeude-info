// Hole die Hausdaten aus localStorage
const row = JSON.parse(localStorage.getItem('selectedHouse') || '{}');
let allData = [];
try {
  allData = JSON.parse(localStorage.getItem('allData') || '[]');
} catch(e) {
  allData = [];
}
// Finde alle Hausnummern der Straße (Fallback falls keine Hausnummern gefunden werden)
let street = row['Straße'] || '';
let houses = allData.filter(r => r['Straße'] && r['Straße'].trim() === street.trim());
houses = houses.sort((a, b) => (a['Hausnummer'] || '').localeCompare(b['Hausnummer'] || '', undefined, {numeric: true, sensitivity: 'base'}));
if (!houses.length && row['Hausnummer']) {
  houses = [row];
}
function renderHouseList() {
  const container = document.getElementById('house-list');
  container.innerHTML = '';
  houses.forEach(h => {
    const hausnummer = h['Hausnummer'] || '';
    const btn = document.createElement('button');
    btn.className = 'house-btn' + (hausnummer === row['Hausnummer'] ? ' selected' : '');
    btn.textContent = hausnummer || '?';
    btn.onclick = function() {
      localStorage.setItem('selectedHouse', JSON.stringify(h));
      window.location.reload();
    };
    container.appendChild(btn);
  });
  if (!houses.length) {
    container.innerHTML = '<span style="color:#888;">Keine Hausnummern gefunden</span>';
  }
}
function renderCategories(row) {
  const categories = [
    { name: 'Kontakt', fields: ['Name', 'Telefonnummer', 'Email', 'Wollen Sie eine Kontaktperson für den Notfall angeben?', 'Name der ersten Kontaktperson', 'Telefonnummer der ersten Kontaktperson', 'Weitere Information zur Kontaktperson', 'zweite Kontaktperson angeben?', 'Name der zweiten Kontaktperson', 'Telefonnummer der zweiten Kontaktperson', 'Weitere Information zur zweiten Kontaktperson'] },
    { name: 'Gebäude', fields: ['Hausart', 'Andere Hausart', 'Wir heizen mit:', 'alternative Heitzart:', 'Standort der Heizung', 'Wo befindet sich das Pellets Lager?', 'Standort Öl Tank', 'Wie viele Personen wohnen hier?', 'Wir haben Haustiere', 'Welche und wie viele?'] },
    { name: 'Strom, Gas & Solar', fields: ['Standort Gas-Absperrventil', 'Wo befindet sich der Stromanschluss / Sicherungskasten?', 'Wir haben eine Solaranlage', 'Wo befindet sich der Wechselrichter?', 'Solaranlage mit Akku?', 'Wo befindet sich der Akku?'] },
    { name: 'Gefahren & Hinweise', fields: ['Weitere Gefahren?', 'Standort dieser Gefahren', 'Weitere Angaben'] },
    { name: 'Rechtliches', fields: ['Ich bin mir bewusst, dass alle Angaben freiwillig sind!', 'Ich bin damit einverstanden, dass die Feuerwehr Stocksee Zugriff auf die hier angegebenen Informationen hat.', 'Ich habe die Datenschutzerklärung gelesen und akzeptiere diese.'] },
    { name: 'Sonstiges', fields: ['created_at', 'Das Gebäude befindet sich in Stocksee', 'Alternativer Straßenname'] }
  ];
  let html = '<div class="info-list">';
  categories.forEach(cat => {
    const filled = cat.fields.filter(f => row[f] && row[f].trim() && row[f].trim() !== 'FALSE');
    if (filled.length) {
      html += `<h3>${cat.name}</h3>`;
      filled.forEach(f => {
        html += `<div class="info-row"><span class="info-key">${f}:</span> <span class="info-value">${row[f]}</span></div>`;
      });
    }
  });
  html += '</div>';
  return html;
}
document.getElementById('details-title').textContent = `Details für Haus ${row['Hausnummer'] || ''}, ${row['Straße'] || ''}`;
document.getElementById('details-content').innerHTML = renderCategories(row);
renderHouseList();
