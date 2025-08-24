// Minimal CSV parser
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].replace(/"/g, '').split(',');
  return lines.slice(1).map(line => {
    const values = line.match(/("[^"]*"|[^,]+)/g) || [];
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (values[i] || '').replace(/"/g, '').trim());
    return obj;
  });
}

let allData = [];
let currentStreet = null;
let currentHouse = null;
let currentView = 'street'; // street, houseList, house
let favorites = [];

const backBtn = document.getElementById('backBtn');
const searchInput = document.getElementById('searchInput');
const filterType = document.getElementById('filterType');
const filterHeat = document.getElementById('filterHeat');

function setBackBtn(text, cb) {
  backBtn.textContent = text;
  backBtn.style.display = 'inline-block';
  backBtn.onclick = cb;
}
function hideBackBtn() {
  backBtn.style.display = 'none';
  backBtn.onclick = null;
}

function renderStreetList(data) {
  currentView = 'street';
  hideBackBtn();
  let filtered = data;
  // Filter nach Haustyp
  if (filterType.value) filtered = filtered.filter(row => row['Hausart'] === filterType.value || row['Andere Hausart'] === filterType.value);
  // Filter nach Heizart
  if (filterHeat.value) filtered = filtered.filter(row => (row['Wir heizen mit:']||'').includes(filterHeat.value));
  // Suche
  if (searchInput.value.trim()) {
    const q = searchInput.value.trim().toLowerCase();
    filtered = filtered.filter(row => (row['Straße']||'').toLowerCase().includes(q) || (row['Hausnummer']||'').toLowerCase().includes(q));
  }
  const container = document.getElementById('table-container');
  const streets = [...new Set(filtered.map(row => row['Straße']).filter(Boolean))].sort();
  let html = '<h2>Alle Straßen</h2><ul class="street-list">';
  streets.forEach(street => {
    html += `<li class="street-item" data-street="${street}">${street}</li>`;
  });
  html += '</ul>';
  container.innerHTML = html;
  document.getElementById('details').style.display = 'none';
  document.querySelectorAll('.street-item').forEach(item => {
    item.addEventListener('click', () => showStreet(item.dataset.street));
  });
}

function showStreet(street, selectedIdx = null) {
  currentView = 'houseList';
  setBackBtn('Zurück zu den Straßen', () => renderStreetList(allData));
  currentStreet = street;
  let houses = allData.filter(row => row['Straße'] === street);
  // Filter nach Haustyp
  if (filterType.value) houses = houses.filter(row => row['Hausart'] === filterType.value || row['Andere Hausart'] === filterType.value);
  // Filter nach Heizart
  if (filterHeat.value) houses = houses.filter(row => (row['Wir heizen mit:']||'').includes(filterHeat.value));
  // Suche
  if (searchInput.value.trim()) {
    const q = searchInput.value.trim().toLowerCase();
    houses = houses.filter(row => (row['Hausnummer']||'').toLowerCase().includes(q));
  }
  houses = houses.sort((a, b) => (a['Hausnummer'] || '').localeCompare(b['Hausnummer'] || '', undefined, {numeric: true, sensitivity: 'base'}));
  const container = document.getElementById('table-container');
  let html = `<h2>${street}</h2><ul class="house-list">`;
  houses.forEach((row, idx) => {
    const fav = favorites.includes(row['id']) ? '★' : '';
    html += `<li class="house-item" data-idx="${allData.indexOf(row)}" data-listidx="${idx}"${selectedIdx === idx ? ' style="background:#b2ebf2;"' : ''}>${row['Hausnummer']} <span class="fav-btn" data-id="${row['id']}">${fav}</span></li>`;
  });
  html += '</ul>';
  container.innerHTML = html;
  // Info rechts anzeigen, falls ausgewählt
  if (selectedIdx !== null) {
    showHouse(houses[selectedIdx], houses, selectedIdx);
  } else {
    document.getElementById('details').style.display = 'none';
  }
  document.querySelectorAll('.house-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.classList.contains('fav-btn')) return;
      const idx = parseInt(item.getAttribute('data-listidx'));
      showStreet(street, idx);
    });
  });
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
      } else {
        favorites.push(id);
      }
      showStreet(street, selectedIdx);
    });
  });
}

function showHouse(row, houses = null, idx = null) {
  // Navigation zur neuen Detailseite
  localStorage.setItem('selectedHouse', JSON.stringify(row));
  localStorage.setItem('allData', JSON.stringify(allData)); // allData speichern
  window.location.href = 'details.html';
}

function renderCategories(row) {
  // Kategorien definieren
  const categories = [
    {
      name: 'Kontakt',
      fields: ['Name', 'Telefonnummer', 'Email', 'Wollen Sie eine Kontaktperson für den Notfall angeben?', 'Name der ersten Kontaktperson', 'Telefonnummer der ersten Kontaktperson', 'Weitere Information zur Kontaktperson', 'zweite Kontaktperson angeben?', 'Name der zweiten Kontaktperson', 'Telefonnummer der zweiten Kontaktperson', 'Weitere Information zur zweiten Kontaktperson']
    },
    {
      name: 'Gebäude',
      fields: ['Hausart', 'Andere Hausart', 'Wir heizen mit:', 'alternative Heitzart:', 'Standort der Heizung', 'Wo befindet sich das Pellets Lager?', 'Standort Öl Tank', 'Wie viele Personen wohnen hier?', 'Wir haben Haustiere', 'Welche und wie viele?']
    },
    {
      name: 'Strom, Gas & Solar',
      fields: ['Standort Gas-Absperrventil', 'Wo befindet sich der Stromanschluss / Sicherungskasten?', 'Wir haben eine Solaranlage', 'Wo befindet sich der Wechselrichter?', 'Solaranlage mit Akku?', 'Wo befindet sich der Akku?']
    },
    {
      name: 'Gefahren & Hinweise',
      fields: ['Weitere Gefahren?', 'Standort dieser Gefahren', 'Weitere Angaben']
    },
    {
      name: 'Rechtliches',
      fields: ['Ich bin mir bewusst, dass alle Angaben freiwillig sind!', 'Ich bin damit einverstanden, dass die Feuerwehr Stocksee Zugriff auf die hier angegebenen Informationen hat.', 'Ich habe die Datenschutzerklärung gelesen und akzeptiere diese.']
    },
    {
      name: 'Sonstiges',
      fields: ['created_at', 'Das Gebäude befindet sich in Stocksee', 'Alternativer Straßenname']
    }
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

function loadCSVFromServer() {
  fetch('daten2.csv')
    .then(res => res.text())
    .then(text => {
      allData = parseCSV(text);
      renderStreetList(allData);
    });
}

searchInput.addEventListener('input', () => renderStreetList(allData));
filterType.addEventListener('change', () => renderStreetList(allData));
filterHeat.addEventListener('change', () => renderStreetList(allData));

window.addEventListener('DOMContentLoaded', loadCSVFromServer);
