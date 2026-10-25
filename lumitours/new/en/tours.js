const U = id => `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`;
const IMG = {
  istanbul: 'photo-1524231757912-21f4fe3a7200',
  istanbul2: 'photo-1541432901042-2d8bd64b4a9b',
  cappa: 'photo-1641128324972-af3212f0f6bd',
  wine: 'photo-1506377247377-2a5b3b417ebb',
  vineyard2: 'photo-1510812431401-41d2bd2722f3',
  ephesus: 'photo-1589561454226-796a8aa89b05',
  aegean: 'photo-1533105079780-92b9be482077',
  trek: 'photo-1641128324972-af3212f0f6bd',
  dubai: 'photo-1512453979798-5ea266f8880c',
  desert: 'photo-1512453979798-5ea266f8880c',
  beach: 'photo-1518684079-3c830dcef090',
  mosque: 'photo-1512632578888-169bbbc64f33',
};

const META = {
  'wine': {
    id: 'wine',
    cat: 'wine',
    catLabel: 'Wine, Culture & Landscapes',
    dur: '9 days / 8 nights',
    nights: 8,
    subtitle: 'From Thrace to the Aegean',
    tag: 'Western Turkey · Wine, Culture & Landscapes',
    route: 'Istanbul · Kırklareli · Tekirdağ · Gallipoli · Çanakkale · Troy · Bergama · Urla · Ephesus · Izmir',
    img: IMG.wine,
    featured: true,
    wineries: [
      { day: 'Day 3', name: 'Arcadia Vineyards', region: 'Kırklareli · Thrace', note: 'Indigenous grape varieties & sustainable viticulture tasting' },
      { day: 'Day 4', name: 'Barbare Vineyards', region: 'Tekirdağ · Marmara Coast', note: 'Guided vineyard tasting & regional light lunch' },
      { day: 'Day 5', name: 'Suvla Wines', region: 'Gallipoli Peninsula', note: 'Midday lunch & maritime climate wine tasting' },
      { day: 'Day 7', name: 'Urla Winery', region: 'Urla · Aegean Coast', note: 'Pioneer of modern Aegean viticulture, tasting included' },
    ],
  },
  'istanbul-3': {
    id: 'istanbul-3',
    cat: 'cultural',
    catLabel: 'Cultural & Heritage',
    dur: '4 days / 3 nights',
    nights: 3,
    tag: 'Istanbul · German-speaking guide',
    img: IMG.istanbul,
  },
  'istanbul-5': {
    id: 'istanbul-5',
    cat: 'cultural',
    catLabel: 'Cultural & Heritage',
    dur: '5 days / 4 nights',
    nights: 4,
    tag: 'Istanbul · Bed & Breakfast',
    img: IMG.istanbul2,
  },
  'cappadocia-5': {
    id: 'cappadocia-5',
    cat: 'cultural',
    catLabel: 'Cultural & Heritage',
    dur: '5 days / 4 nights',
    nights: 4,
    tag: 'Cappadocia · Half board',
    img: IMG.cappa,
  },
};

const UAE_IMG = [IMG.desert, IMG.beach, IMG.dubai, IMG.mosque, IMG.desert, IMG.dubai, IMG.beach, IMG.mosque, IMG.beach, IMG.dubai, IMG.dubai];
const dayRe = /^Day\s+(\d+)\s*[:–-]?\s*(.*)$/i;
const sectionRe = /^(Character of the Journey|Tour Highlights)$/i;

function parse(paras) {
  const title = paras[0], intro = [], days = [], character = [];
  let cur = null, inChar = false;
  paras.slice(1).forEach(p => {
    const trimmed = String(p || '').trim();
    if (!trimmed || /^End of the tour\.?$/i.test(trimmed)) return;
    if (sectionRe.test(trimmed)) {
      inChar = true;
      cur = null;
      return;
    }
    if (inChar) {
      character.push(trimmed);
      return;
    }
    const m = trimmed.match(dayRe);
    if (m) {
      cur = { n: m[1], title: m[2].trim(), body: [] };
      days.push(cur);
    } else if (cur) {
      if (!cur.title) cur.title = trimmed;
      else cur.body.push(trimmed);
    } else {
      intro.push(trimmed);
    }
  });
  return { title, intro, days, character };
}

const esc = s => String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const arr = x => (x == null ? [] : Array.isArray(x) ? x : [x]);

const groups = { wine: [], turkey: [], uae: [], all: [] };

['wine', 'istanbul-3', 'istanbul-5', 'cappadocia-5'].forEach(k => {
  if (!window.RAW || !window.RAW[k]) return;
  const p = parse(window.RAW[k]);
  const item = { ...META[k], ...p, tag: META[k].tag };
  if (k === 'wine') {
    item.days.forEach(d => {
      if (d.n === '1' && !d.overnight) d.overnight = 'Historic Peninsula, Istanbul';
      if (d.n === '2' && !d.overnight) d.overnight = 'Historic Peninsula, Istanbul';
      if (d.n === '5' && !d.overnight) d.overnight = 'Çanakkale (Dardanelles)';
    });
    groups.wine.push(item);
  }
  groups.turkey.push(item);
  groups.all.push(item);
});

if (window.TREK) {
  const t = window.TREK;
  const trekItem = {
    id: 'cappadocia-trek',
    cat: 'trekking',
    catLabel: 'Trekking & Active',
    title: t.title,
    tag: 'Cappadocia · ' + t.subtitle,
    dur: '5 days / 4 nights · hiking',
    nights: 4,
    img: IMG.trek,
    intro: arr(t.intro).concat([t.meta]),
    character: [],
    days: arr(t.days).map(d => ({ ...d, body: arr(d.body) })),
  };
  groups.turkey.push(trekItem);
  groups.all.push(trekItem);
}

arr(window.UAE).forEach((u, i) => {
  const uaeItem = {
    id: 'uae-' + (i + 1),
    cat: 'uae',
    catLabel: 'UAE Grand Tours',
    title: u.title,
    tag: 'UAE Grand Tour' + (/^Detailed/i.test(u.subtitle) ? '' : ' · ' + u.subtitle),
    dur: ((u.meta || '').split('|')[0] || '8 days / 7 nights').trim(),
    nights: 7,
    img: UAE_IMG[i % UAE_IMG.length],
    intro: arr(u.intro).concat(u.meta ? [u.meta.replace(/^.*?\|\s*/, '')] : []),
    character: [],
    days: arr(u.days).map(d => ({ ...d, body: arr(d.body) })),
  };
  groups.uae.push(uaeItem);
  groups.all.push(uaeItem);
});

/* ---- topic photos: every tour gets 5 distinct, relevant photos ---- */
const DEFAULT_TOPICS = {
  uae: ['burj', 'zayed', 'palm', 'creek', 'safari', 'jais', 'hatta', 'alain', 'fujairah', 'louvre', 'musandam', 'kayak', 'sharjah'],
  turkey: ['hagia', 'cappa', 'vineyard', 'galata', 'bosphorus', 'bluemosque', 'goreme', 'chora', 'gallipoli', 'bazaar', 'aegean'],
};

function photosFor(t, isUae, seed) {
  if (t.id === 'wine') {
    return [
      U(IMG.wine),
      U(IMG.istanbul),
      U(IMG.vineyard2),
      U(IMG.ephesus),
      U(IMG.aegean),
    ];
  }
  const BAN = /Turtle|Paris|Kerry|thumbnail|child_and_mother|Premier_Motors|modellino|Jean_nouvel|Windmill_fort|Rhodes|Monument|ANZAC|Mudros|Grape_1180|AL_NOORISLAND|Kayaksnear|jebel_al_jais_-_panoramio|Desert_close|_interno_|Secretary|the_entrance_to_the_parking|Ras_al_khaimah_mountains|Madinat/i;
  const P = Object.fromEntries(
    Object.entries(window.PHOTOS || {}).map(([k, v]) => [
      k,
      { ...v, urls: (v.urls || []).filter(u => !BAN.test(decodeURIComponent(u.split('?')[0]))) },
    ])
  );
  const text = [t.title, t.tag, ...(t.intro || []), ...(t.days || []).map(d => d.title + ' ' + d.body.join(' '))].join(' ').toLowerCase();
  const scored = Object.entries(P)
    .filter(([, v]) => v.urls && v.urls.length)
    .map(([k, v]) => {
      const m = text.match(new RegExp(v.re, 'g'));
      return { k, n: m ? m.length : 0, urls: v.urls };
    })
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const used = new Set(), out = [];
  if (isUae) {
    const base = [IMG.dubai, IMG.mosque, IMG.beach].map(id => `https://images.unsplash.com/${id}?q=80&w=1400&auto=format&fit=crop`);
    for (let s = 0; s < 3; s++) {
      const u = base[(seed + s) % 3];
      used.add(u);
      out.push(u);
    }
  }
  const take = (urls, i) => {
    for (let s = 0; s < urls.length; s++) {
      const u = urls[(i + s) % urls.length];
      if (!used.has(u)) {
        used.add(u);
        out.push(u);
        return true;
      }
    }
    return false;
  };
  scored.forEach(x => { if (out.length < 5) take(x.urls, seed); });
  DEFAULT_TOPICS[isUae ? 'uae' : 'turkey'].forEach(k => { if (out.length < 5 && P[k]) take(P[k].urls, seed); });
  scored.forEach(x => { while (out.length < 5 && take(x.urls, seed + 1)); });
  return out;
}

groups.turkey.forEach((t, i) => {
  t.photos = photosFor(t, false, i);
  if (t.photos[0]) t.cover = t.photos[0];
  t.idx = groups.all.indexOf(t);
});
groups.uae.forEach((t, i) => {
  t.photos = photosFor(t, true, i);
  if (t.photos[0]) t.cover = t.photos[0];
  t.idx = groups.all.indexOf(t);
});

/* ================= Enrich Day-by-Day Details ================= */
const LABEL = /^(Included|Optional|Overnight|Trekking duration|Difficulty)\s*:\s*(.*)$/i;
const NOTE = /(may change|subject to|depends? on|advance|weather|document checks)/i;
const sentences = p => (p.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [p]).map(s => s.trim()).filter(Boolean);

function enrich(t) {
  if (t._enriched) return t;
  t._enriched = true;
  const notes = [], inc = new Set();
  t.days.forEach((d, di) => {
    d.bullets = [];
    d.overnight = d.overnight || '';
    d.included = '';
    d.optional = '';
    d.extra = [];
    d.body.forEach(p => {
      const m = p.match(LABEL);
      if (m) {
        const key = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
        if (key === 'Overnight') d.overnight = m[2].replace(/\.$/, '');
        else if (key === 'Included') {
          d.included = m[2];
          m[2].replace(/\.$/, '').split(/,\s*|\s+and\s+/).forEach(x => x.trim() && inc.add(x.trim().replace(/^./, c => c.toUpperCase())));
        } else if (key === 'Optional') d.optional = m[2];
        else d.extra.push([key, m[2]]);
      } else if (di === t.days.length - 1 && NOTE.test(p) && d.bullets.length) {
        notes.push(p);
      } else {
        sentences(p).forEach(s => {
          const ovMatch = s.match(/^Overnight in (?:the )?(.+?)\.?$/i) || s.match(/^Dinner\s*&\s*overnight in (.+?)\.?$/i);
          if (ovMatch) {
            d.overnight = ovMatch[1].replace(/\s*\(HB\)\s*$/i, '').trim();
            if (/^Dinner/i.test(s)) d.included = (d.included ? d.included + ', ' : '') + 'Dinner';
            if (/dinner in a local restaurant/i.test(s)) d.included = (d.included ? d.included + ', ' : '') + 'Dinner in local restaurant';
          } else {
            d.bullets.push(s);
          }
          if (/tasting at Arcadia Vineyards/i.test(s)) {
            d.extra.push(['Winery Tasting', 'Arcadia Vineyards (Thrace)']);
            inc.add('Wine tastings at Arcadia, Barbare, Suvla & Urla wineries');
          }
          if (/Barbare Vineyards.*tasting and light lunch/i.test(s)) {
            d.extra.push(['Winery & Lunch', 'Barbare Vineyards (Tekirdağ)']);
            d.included = (d.included ? d.included + ', ' : '') + 'Light lunch & tasting';
          }
          if (/Suvla Wines for lunch and a tasting/i.test(s)) {
            d.extra.push(['Winery & Lunch', 'Suvla Wines (Gallipoli)']);
            d.included = (d.included ? d.included + ', ' : '') + 'Lunch & wine tasting';
          }
          if (/Urla Winery.*Tasting included/i.test(s)) {
            d.extra.push(['Winery Tasting', 'Urla Winery (Aegean)']);
          }
        });
      }
    });
    const meals = ['Breakfast', 'Lunch', 'Dinner'].filter(x => new RegExp(x, 'i').test(d.included));
    d.meals = meals.join(' · ');
  });
  if (t.id === 'wine') {
    inc.add('Airport transfers (Istanbul arrival & Izmir departure)');
    inc.add('8 nights regional & boutique accommodation');
    inc.add('Guided tastings at 4 signature wineries (Arcadia, Barbare, Suvla, Urla)');
    inc.add('Vineyard lunches at Barbare Vineyards & Suvla Wines');
    inc.add('Bosphorus cruise & Istanbul street-food tastings');
    inc.add('Guided archaeological visits: Troy, Pergamon, Teos & Ephesus');
  }
  t.notes = notes;
  t.inclusions = [...inc];
  return t;
}

groups.all.forEach(enrich);

/* ================= Render Cards & Category Filtering ================= */
function renderCard(t, i) {
  const blurb = (t.subtitle ? t.subtitle + ' — ' : '') + (t.intro.find(x => x.length > 35) || (t.character && t.character[0]) || t.tag);
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'card group';
  b.setAttribute('data-cat', t.cat);
  const badgeText = t.featured ? 'NEW · WINE & CULTURE' : String(i + 1).padStart(2, '0');
  const badgeClass = t.featured ? 'num num-featured' : 'num';
  b.innerHTML = `<img src="${t.cover || U(t.img)}" alt="${esc(t.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">
    <div class="shade"></div>
    <span class="${badgeClass}">${esc(badgeText)}</span>
    <span class="cat-pill">${esc(t.catLabel || 'Guided Tour')}</span>
    <div class="txt">
      <h3>${esc(t.title.split(/[:–—]/)[0].trim())}</h3>
      <p>${esc(blurb)}</p>
      <div class="meta">${esc(t.dur)} · ${t.days.length} days · See itinerary →</div>
    </div>`;
  b.onclick = () => show(t);
  return b;
}

function renderGrids(activeCat = 'all') {
  const grid = document.getElementById('grid');
  const gridUae = document.getElementById('grid-uae');
  const uaeSec = document.getElementById('uae');
  const featuredBox = document.getElementById('wine-featured-showcase');

  if (grid) {
    grid.innerHTML = '';
    const list = activeCat === 'all'
      ? groups.turkey
      : activeCat === 'wine'
        ? groups.wine
        : activeCat === 'cultural'
          ? groups.turkey.filter(t => t.cat === 'cultural' || t.cat === 'trekking')
          : [];
    list.forEach((t, i) => grid.appendChild(renderCard(t, i)));
    grid.parentElement.hidden = list.length === 0 && activeCat === 'uae';
  }

  if (gridUae && uaeSec) {
    gridUae.innerHTML = '';
    const showUae = activeCat === 'all' || activeCat === 'uae';
    uaeSec.hidden = !showUae;
    if (showUae) {
      groups.uae.forEach((t, i) => gridUae.appendChild(renderCard(t, i)));
    }
  }

  if (featuredBox) {
    featuredBox.hidden = !(activeCat === 'all' || activeCat === 'wine');
  }

  document.querySelectorAll('[data-tour-cat-btn]').forEach(btn => {
    const isOn = btn.getAttribute('data-tour-cat-btn') === activeCat;
    btn.setAttribute('aria-selected', isOn ? 'true' : 'false');
    btn.classList.toggle('is-active', isOn);
  });
}

window.filterTourCategory = function (cat) {
  renderGrids(cat);
};

/* ================= Hero Search Widget Separation (Trips vs Tours) ================= */
window.switchWidgetTab = function (mode) {
  const tripsBtn = document.getElementById('wtab-trips');
  const toursBtn = document.getElementById('wtab-tours');
  const tripsPanel = document.getElementById('widget-panel-trips');
  const toursPanel = document.getElementById('widget-panel-tours');
  if (!tripsPanel || !toursPanel) return;

  const isTours = mode === 'tours';
  tripsPanel.hidden = isTours;
  toursPanel.hidden = !isTours;

  if (tripsBtn) {
    tripsBtn.setAttribute('aria-selected', !isTours ? 'true' : 'false');
    tripsBtn.className = !isTours
      ? 'rounded-full bg-teal px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white transition'
      : 'rounded-full px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink/60 transition hover:text-ink';
  }
  if (toursBtn) {
    toursBtn.setAttribute('aria-selected', isTours ? 'true' : 'false');
    toursBtn.className = isTours
      ? 'inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white shadow-sm transition'
      : 'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink/65 transition hover:text-ink';
  }
};

window.onWidgetCategoryChange = function () {
  const catSel = document.getElementById('widget-tour-cat');
  const tourSel = document.getElementById('widget-tour-select');
  if (!catSel || !tourSel) return;
  const cat = catSel.value;
  const filtered = cat === 'all'
    ? groups.all
    : cat === 'wine'
      ? groups.wine
      : cat === 'cultural'
        ? groups.turkey.filter(t => t.cat === 'cultural' || t.cat === 'trekking')
        : groups.uae;

  tourSel.innerHTML = '';
  filtered.forEach(t => {
    const opt = document.createElement('option');
    opt.value = String(t.idx);
    opt.textContent = `${t.title} (${t.dur})`;
    tourSel.appendChild(opt);
  });
  window.onWidgetTourChange();
};

window.onWidgetTourChange = function () {
  const tourSel = document.getElementById('widget-tour-select');
  const durLabel = document.getElementById('widget-tour-duration');
  if (!tourSel || !durLabel) return;
  const t = groups.all[+tourSel.value] || groups.all[0];
  if (t) {
    durLabel.textContent = `${t.dur} (${t.days.length} days)`;
  }
};

window.submitWidgetTourSearch = function (e) {
  if (e) e.preventDefault();
  const tourSel = document.getElementById('widget-tour-select');
  if (tourSel && groups.all[+tourSel.value]) {
    show(groups.all[+tourSel.value]);
  } else {
    const el = document.getElementById('tours');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
};

window.openTourById = function (id) {
  const found = groups.all.find(x => x.id === id) || groups.all[0];
  if (found) show(found);
};

/* ================= Tour Detail Page ================= */
const pg = document.getElementById('detail-page');
const homeMain = document.getElementById('main');
const chk = s => `<li><i class="ck"></i><span>${esc(s)}</span></li>`;
const ICON = {
  pin: '<svg viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  route: '<svg viewBox="0 0 24 24"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  bed: '<svg viewBox="0 0 24 24"><path d="M3 18v-8m0 5h18v3m0-3v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="10" r="1.5"/></svg>',
  food: '<svg viewBox="0 0 24 24"><path d="M6 3v8a2 2 0 0 0 2 2v8M10 3v8M6 7h4M17 3c-2 2-2 6 0 8v10"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  wine: '<svg viewBox="0 0 24 24"><path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>',
};

const stays = txt =>
  (txt || '')
    .split('+')
    .map(s => s.trim().match(/^(\d+)\s+nights?\s+(.+)$/i))
    .filter(Boolean)
    .map(m => ({ n: m[1], place: m[2] }));

const GALLERY = {
  uae: [IMG.dubai, IMG.beach, IMG.mosque, IMG.dubai, IMG.beach],
  turkey: [IMG.istanbul, IMG.cappa, IMG.wine, IMG.istanbul, IMG.cappa],
};
const crop = (id, n) =>
  `https://images.unsplash.com/${id}?q=80&w=${n === 0 ? 1400 : 800}&auto=format&fit=crop${['', '&crop=top', '&crop=bottom', '&crop=left', '&crop=right'][n]}`;

function hotelsOf(t) {
  const seen = new Set(), out = [];
  t.days.forEach(d => {
    if (!d.overnight) return;
    const m = d.overnight.match(/^(.+?)\s+[—–-]\s+(.+?)(?:\s+or similar)?\.?$/);
    if (m && !seen.has(m[2])) {
      seen.add(m[2]);
      out.push({ place: m[1], hotel: m[2], nights: t.days.filter(x => x.overnight === d.overnight).length });
    } else if (!m && !seen.has(d.overnight)) {
      seen.add(d.overnight);
      out.push({
        place: d.overnight,
        hotel: 'Boutique & Regional Character Hotel (' + d.overnight + ')',
        nights: t.days.filter(x => x.overnight === d.overnight).length,
      });
    }
  });
  return out;
}

function show(t) {
  enrich(t);
  const isUae = groups.uae.includes(t);
  const all = isUae ? groups.uae : groups.turkey;
  const groupName = t.catLabel || (isUae ? 'UAE Grand Tour' : 'Tours');
  const stayTxt = t.intro.find(x => /\d+\s+nights?\s+\w+.*\+/.test(x)) || '';
  const st = stays(stayTxt);
  const routeLine = t.route || (st.length ? st.map(s => s.place).join(' · ') : t.tag || '');
  const desc = t.intro.filter(x => x !== stayTxt);
  const hotels = hotelsOf(t);
  const optionals = t.days.filter(d => d.optional).map(d => d.optional.split(/[.(]/)[0].trim());
  const more = all.filter(x => x !== t).slice(0, 4);
  const pool =
    t.photos && t.photos.length >= 5
      ? t.photos.slice()
      : isUae
        ? GALLERY.uae.map(id => crop(id, 1))
        : Array(5).fill(crop(t.img, 1));
  const hl = t.days.map(d => `Day ${d.n}: ${d.title}`).slice(0, 9);
  const meals = new Set();
  t.days.forEach(d => d.meals && d.meals.split(' · ').forEach(m => meals.add(m)));

  const routeStops = t.id === 'wine'
    ? [
        '2 nights · Historic Peninsula, Istanbul',
        '1 night · Kırklareli / Lüleburgaz (Thracian Wine Region)',
        '1 night · Tekirdağ / Şarköy (Marmara Vineyards)',
        '1 night · Çanakkale (Gallipoli & Dardanelles)',
        '1 night · Bergama (Troy & Pergamon)',
        '2 nights · Urla / Seferihisar (Aegean Wine Region & Ephesus)',
      ]
    : st.length
      ? st.map(s => `${s.n} ${+s.n > 1 ? 'nights' : 'night'} · ${s.place}`)
      : [t.dur];

  const faq = [
    ['How long is this tour?', `${t.dur}${t.days.length ? `, carefully paced across ${t.days.length} days` : ''}.`],
    [
      'Where do we stay along the route?',
      hotels.length
        ? hotels.map(h => `${h.place} (${h.nights} ${h.nights > 1 ? 'nights' : 'night'})`).join(' → ') + '.'
        : 'Hand-picked boutique and regional hotels confirmed upon booking.',
    ],
    [
      'Which wineries and tastings are included?',
      t.wineries
        ? t.wineries.map(w => `${w.name} (${w.region})`).join(', ') + ' — all guided tastings are included in the itinerary.'
        : optionals.length
          ? 'Optional experiences: ' + [...new Set(optionals)].join('; ') + '.'
          : 'Guided visits and tastings as described in the day-by-day programme.',
    ],
    ['Can the itinerary be tailored for private groups?', 'Yes. Share your preferred dates and group size and Lumi Tours will tailor the journey for you.'],
  ];

  pg.innerHTML = `
  <div class="frame hp-top">
    <nav class="crumb">
      <a href="#tours" id="back">← Lumi Tours Home</a>
      <span>/</span>
      <a href="#tours" id="back2">Tours</a>
      <span>/</span>
      <span>${esc(groupName)}</span>
    </nav>
    <div class="hp-title">
      <div>
        <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
          <p class="stars">${ICON.star.repeat(5)}</p>
          <span class="detail-cat-badge">${esc(groupName)}</span>
          ${t.subtitle ? `<span class="detail-sub-badge">${esc(t.subtitle)}</span>` : ''}
        </div>
        <h1 class="display">${esc(t.title)}</h1>
        <p class="loc">${ICON.pin}<span>${esc(routeLine)}</span></p>
      </div>
      <div class="rate">
        <span class="score">${t.days.length}</span>
        <span><b>Days</b><small>${esc(t.dur)}</small></span>
      </div>
    </div>
  </div>

  <div class="frame"><div class="mosaic">
    ${pool
      .slice(0, 5)
      .map(
        (id, i) =>
          `<div class="m${i}"><img src="${id.startsWith('http') ? id : crop(id, i)}" alt="${esc(t.title)} ${i + 1}" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('blank');this.remove()"></div>`
      )
      .join('')}
    <span class="allph">${ICON.grid} ${pool.length} Tour Photos</span>
  </div></div>

  <div class="subnav"><div class="frame subnav-in"><nav>
    <a href="#o" class="on">Overview</a>
    ${t.character && t.character.length ? '<a href="#char">Character of the Journey</a>' : ''}
    ${t.wineries && t.wineries.length ? '<a href="#wineries">Wineries & Tastings</a>' : ''}
    <a href="#h">Route & Highlights</a>
    <a href="#d">Day by Day (1–${t.days.length})</a>
    ${hotels.length ? '<a href="#s">Overnight Regions</a>' : ''}
    <a href="#q">Questions</a>
  </nav><a class="share" href="#tours" id="back3">All Tours</a></div></div>

  <div class="frame hp-grid">
    <div class="hp-main">
      <section id="o">
        <p class="eyebrow dotted">${esc(t.subtitle || 'About the tour')}</p>
        <h2 class="display" style="margin-top:.6rem">${esc(t.title)}</h2>
        ${
          desc.length && !(desc.length === 1 && desc[0] === t.subtitle)
            ? desc.map((p, i) => `<p class="about${i ? ' sm' : ''}">${esc(p)}</p>`).join('')
            : `<p class="about">An immersive ${t.days.length}-day journey ${t.subtitle ? `(${esc(t.subtitle)}) ` : ''}combining cultural heritage, archaeological wonders, regional gastronomy and authentic local landscapes from Istanbul and Thrace down to the Aegean coast.</p>`
        }
      </section>

      ${
        t.character && t.character.length
          ? `<section id="char" class="char-box">
        <p class="eyebrow dotted">Character of the Journey</p>
        <h2 class="display">What defines this itinerary</h2>
        <div class="char-grid">
          ${t.character
            .map(
              (c, idx) => `
            <div class="char-card">
              <span class="char-num">0${idx + 1}</span>
              <p>${esc(c)}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>`
          : ''
      }

      ${
        t.wineries && t.wineries.length
          ? `<section id="wineries">
        <p class="eyebrow dotted">Signature Viticulture</p>
        <h2 class="display">Wineries & Tastings along the Route</h2>
        <div class="winery-grid">
          ${t.wineries
            .map(
              w => `
            <div class="winery-card">
              <div class="winery-top">
                <span class="ic">${ICON.wine}</span>
                <span class="winery-day">${esc(w.day)} · ${esc(w.region)}</span>
              </div>
              <h3>${esc(w.name)}</h3>
              <p>${esc(w.note)}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>`
          : ''
      }

      <section id="h">
        <div class="cards2">
          <div class="icard"><div class="ihead"><span class="ic">${ICON.route}</span><b>Route & Overnights</b></div>
            <ul class="cl">${routeStops.map(chk).join('')}</ul></div>
          <div class="icard"><div class="ihead"><span class="ic">${ICON.star}</span><b>Daily Chapters</b></div>
            <ul class="cl">${hl.map(chk).join('')}</ul></div>
          <div class="icard"><div class="ihead"><span class="ic">${ICON.food}</span><b>Culinary & Tastings</b></div>
            <ul class="cl">${
              t.id === 'wine'
                ? [
                    'Istanbul street-food culture tastings (Day 2)',
                    'Arcadia Vineyards indigenous varietal tasting (Day 3)',
                    'Barbare Vineyards guided tasting & regional light lunch (Day 4)',
                    'Suvla Wines midday lunch & maritime tasting (Day 5)',
                    'Local restaurant dinner in Bergama (Day 6)',
                    'Urla Winery Aegean viticulture tasting (Day 7)',
                  ]
                    .map(chk)
                    .join('')
                : meals.size
                  ? [...meals].map(m => chk(m + ' included on selected days')).join('')
                  : chk('As described in the daily programme')
            }</ul></div>
          <div class="icard"><div class="ihead"><span class="ic">${ICON.user}</span><b>Journey Style</b></div>
            <ul class="cl">${
              (t.character && t.character.length
                ? t.character
                : ['Expert local guide throughout', 'Private transfers between regions', 'Carefully paced daily distances']
              )
                .map(chk)
                .join('')
            }</ul></div>
        </div>
      </section>

      ${
        t.inclusions.length
          ? `<section id="i" class="inc-box">
        <p class="eyebrow dotted">What the journey includes</p>
        <ul class="inc-grid">${t.inclusions.slice(0, 12).map(x => `<li><span class="ic sm">${ICON.star}</span>${esc(x)}</li>`).join('')}</ul>
      </section>`
          : ''
      }

      <section id="d">
        <p class="eyebrow dotted">Complete Programme</p>
        <h2 class="display">Day by day (${t.days.length} Days)</h2>
        <div class="xc"><button type="button" onclick="toggleAll(true)">Expand all days</button><button type="button" onclick="toggleAll(false)">Collapse all</button></div>
        <div class="daycards">${t.days
          .map(
            (d, i) => `
          <details class="dcard"${i < 3 || t.id === 'wine' ? ' open' : ''}>
            <summary><span class="dnum">${String(d.n).padStart(2, '0')}</span><span class="dtt"><small>Day ${esc(d.n)}</small><b>${esc(d.title)}</b></span><span class="chev"></span></summary>
            <div class="dcont">
              ${d.bullets.length ? `<ul class="cl">${d.bullets.map(chk).join('')}</ul>` : ''}
              ${d.optional ? `<p class="optx"><b>Optional</b>${esc(d.optional)}</p>` : ''}
              ${
                d.overnight || d.meals || d.extra.length
                  ? `<div class="tags">
                ${d.overnight ? `<span>${ICON.bed}<em>Overnight:</em> ${esc(d.overnight)}</span>` : ''}
                ${d.meals ? `<span>${ICON.food}${esc(d.meals)}</span>` : ''}
                ${d.extra.map(([k, v]) => `<span><em>${esc(k)}:</em> ${esc(v)}</span>`).join('')}</div>`
                  : ''
              }
            </div>
          </details>`
          )
          .join('')}</div>
      </section>

      ${
        hotels.length
          ? `<section id="s">
        <p class="eyebrow dotted">Where you stay</p>
        <h2 class="display">Overnight Regions & Stays</h2>
        <div class="hotels">${hotels
          .map(
            h => `<a class="hcard" href="#tours">
          <span class="ic">${ICON.bed}</span><span><b>${esc(h.place)}</b><small>${esc(h.hotel)} · ${h.nights} ${h.nights > 1 ? 'nights' : 'night'}</small></span><span class="go">Included in route →</span></a>`
          )
          .join('')}</div>
      </section>`
          : ''
      }

      <section id="q">
        <p class="eyebrow dotted">Questions</p>
        <h2 class="display">Good to know</h2>
        <div class="faq">${faq.map(([q, a]) => `<details><summary>${esc(q)}<span class="plus"></span></summary><p>${esc(a)}</p></details>`).join('')}</div>
        ${t.notes.length ? `<ul class="cl notes2">${t.notes.map(chk).join('')}</ul>` : ''}
      </section>
    </div>

    <aside class="hp-aside">
      <div class="acard">
        <span class="detail-cat-badge" style="margin-bottom:.6rem;display:inline-block">${esc(t.dur)}</span>
        <h3 class="display">Book or custom-tailor this tour</h3>
        <p>Select your preferred departure date and group size. Our specialists will prepare your complete package with flights & boutique stays.</p>
        <div style="margin-top:1rem;display:grid;gap:.6rem">
          <label style="font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:var(--teal-deep)">Preferred Departure
            <input type="date" value="2026-11-15" style="margin-top:.3rem;width:100%;padding:.65rem .8rem;border-radius:.75rem;border:1px solid rgba(34,55,73,.15);font:inherit;font-size:.875rem">
          </label>
          <label style="font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:var(--teal-deep)">Travellers
            <select style="margin-top:.3rem;width:100%;padding:.65rem .8rem;border-radius:.75rem;border:1px solid rgba(34,55,73,.15);font:inherit;font-size:.875rem;background:#fff">
              <option>2 Adults · Private / Small Group</option>
              <option>1 Adult · Solo Traveller</option>
              <option>4 Adults · Private Group</option>
              <option>6+ Adults · Wine & Culture Club</option>
            </select>
          </label>
        </div>
        <a class="tbtn" href="https://www.lumitours.se/new/en/contact">Request Tailored Quote</a>
        <a class="gbtn" href="#petra">Ask Petra AI about this route</a>
      </div>
      <div class="acard">
        <p class="mini">At a glance</p>
        <dl>
          <dt>Category</dt><dd>${esc(groupName)}</dd>
          <dt>Duration</dt><dd>${esc(t.dur)}</dd>
          <dt>Days</dt><dd>${t.days.length} Days</dd>
          ${t.id === 'wine' ? '<dt>Start / End</dt><dd>Istanbul → Izmir</dd><dt>Wineries</dt><dd>4 Estate Tastings</dd>' : ''}
          ${hotels.length ? `<dt>Regions</dt><dd>${hotels.length} Stops</dd>` : ''}
        </dl>
      </div>
      <div class="acard"><p class="mini">Need assistance?</p><p class="ct"><a href="https://www.lumitours.se/new/en/contact">Talk to a Lumi travel specialist →</a></p></div>
    </aside>
  </div>

  <section class="bg-sand"><div class="frame sec">
    <p class="eyebrow dotted">More Guided Tours</p>
    <h2 class="display" style="margin-top:.5rem;font-size:2rem">Explore related itineraries</h2>
    <div class="grid" id="more-grid"></div>
  </div></section>`;

  const moreEl = document.getElementById('more-grid');
  if (moreEl) {
    more.forEach((mItem, idx) => moreEl.appendChild(renderCard(mItem, idx)));
  }

  document.body.classList.add('is-detail');
  if (homeMain) homeMain.hidden = true;
  pg.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const backFn = e => {
    if (e) e.preventDefault();
    pg.hidden = true;
    document.body.classList.remove('is-detail');
    if (homeMain) homeMain.hidden = false;
    const toursEl = document.getElementById('tours');
    if (toursEl) toursEl.scrollIntoView({ behavior: 'smooth' });
  };
  ['back', 'back2', 'back3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.onclick = backFn;
  });

  const links = [...pg.querySelectorAll('.subnav a[href^="#"]')];
  links.forEach(a => {
    if (a.id === 'back3') return;
    a.onclick = e => {
      e.preventDefault();
      const el = pg.querySelector(a.getAttribute('href'));
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: 'smooth' });
    };
  });
}

window.closeTourDetail = function () {
  if (pg) pg.hidden = true;
  document.body.classList.remove('is-detail');
  if (homeMain) homeMain.hidden = false;
};

function toggleAll(open) {
  if (pg) pg.querySelectorAll('.dcard').forEach(d => (d.open = open));
}
window.toggleAll = toggleAll;

/* Initialize grids, widget dropdowns, and hash routing */
renderGrids('all');
if (typeof window.onWidgetCategoryChange === 'function') {
  window.onWidgetCategoryChange();
}

const hashMatch = location.hash.match(/^#tour=([a-z0-9_-]+)/i);
if (hashMatch) {
  const key = hashMatch[1];
  const target = groups.all.find(x => x.id === key) || groups.all[+key];
  if (target) show(target);
}
