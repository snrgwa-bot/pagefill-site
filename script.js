// Pagefill site. Without this script every section still reads in full:
// the lease is filled-in HTML, all tool lists are visible, all answers are open.
(() => {
  window.pfReady = true;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  // ---------- Entrances: each part of a section rises in turn ----------
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.rise, .bars').forEach((el) => (io && !reduce ? io.observe(el) : el.classList.add('in')));

  // ---------- Signature pad: smooth ink from every pointer sample ----------
  let lastSignature = null;
  function pad(wrap) {
    if (!wrap) return;
    const c = $('canvas', wrap), ctx = c.getContext('2d');
    let pts = [], drawing = false;
    const size = () => {
      const r = c.getBoundingClientRect(), d = devicePixelRatio || 1;
      c.width = r.width * d; c.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1a1a8c';
    };
    size();
    const at = (e) => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: e.timeStamp }; };
    const seg = (a, b, m0, m1) => {
      const v = Math.hypot(b.x - a.x, b.y - a.y) / Math.max(1, b.t - a.t);
      ctx.lineWidth = Math.max(1.4, Math.min(3.4, 3.6 - v * 1.1));
      ctx.beginPath(); ctx.moveTo(m0.x, m0.y); ctx.quadraticCurveTo(a.x, a.y, m1.x, m1.y); ctx.stroke();
    };
    c.addEventListener('pointerdown', (e) => { drawing = true; c.setPointerCapture(e.pointerId); pts = [at(e)]; wrap.classList.add('inked'); });
    c.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs) {
        pts.push(at(ev));
        const n = pts.length; if (n < 3) continue;
        const p0 = pts[n - 3], p1 = pts[n - 2], p2 = pts[n - 1];
        seg(p1, p2, { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }, { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
      }
    });
    const end = () => { if (!drawing) return; drawing = false; lastSignature = c.toDataURL('image/png'); };
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
    const clear = $('.clear', wrap.parentElement);
    clear && clear.addEventListener('click', () => { ctx.clearRect(0, 0, c.width, c.height); wrap.classList.remove('inked'); lastSignature = null; });
  }

  // ---------- Forms: pick one, the sheet swaps ----------
  const f = (label, v = '', ph = '') => `<label class="f"><span>${label}</span><input type="text" ${v ? `value="${v}"` : `placeholder="${ph}"`} autocomplete="off"></label>`;
  const sig = (who) => `<div class="sig"><div class="pad-wrap"><canvas aria-label="Signature pad: draw your signature"></canvas><span class="hint">Sign here with your finger or mouse</span></div><div class="under"><span>${who}</span><button type="button" class="clear">Clear</button></div></div>`;
  const org = (i, n) => `<div class="org"><i>${i}</i>${n}</div>`;
  const sheet = $('#sheet');
  const forms = {
    lease: sheet ? sheet.innerHTML : '',
    invoice: org('RD', 'Riverside Design Studio') + `<h4>Invoice No. 1042</h4>` + f('Bill to', '', 'Client name') + f('Invoice date', 'March 3, 2027') + f('Due', 'April 2, 2027') +
      `<table><thead><tr><th>Item</th><th class="n">Qty</th><th class="n">Price</th><th class="n">Amount</th></tr></thead><tbody>
       <tr><td>Logo design</td><td class="n">1</td><td class="n">$450.00</td><td class="n">$450.00</td></tr>
       <tr><td>Business cards, 250</td><td class="n">2</td><td class="n">$85.00</td><td class="n">$170.00</td></tr>
       <tr><td>Letterhead template</td><td class="n">1</td><td class="n">$120.00</td><td class="n">$120.00</td></tr></tbody>
       <tfoot><tr><td colspan="3">Subtotal</td><td class="n">$740.00</td></tr><tr><td colspan="3">Sales tax 8.5%</td><td class="n">$62.90</td></tr><tr><td colspan="3">Total due</td><td class="n">$802.90</td></tr></tfoot></table>` +
      `<label class="chk"><input type="checkbox">Paid by bank transfer</label>` + sig('Received by') + `<p class="pg">Page 1 of 1</p>`,
    sale: org('BS', 'Vehicle Bill of Sale') + `<h4>Bill of Sale</h4><p class="intro">The Seller transfers ownership of the vehicle below to the Buyer for the price stated.</p>` +
      f('Seller', 'Daniel Okafor') + f('Buyer', '', 'Your name') + f('Vehicle', '2016 Honda Civic LX, blue') + f('VIN', '', '17 characters') + f('Odometer', '84,210 miles') + f('Price', '$9,800') +
      `<label class="chk"><input type="checkbox">Sold as is, with no warranty</label>` + sig('Buyer signature') + `<p class="pg">Page 1 of 1</p>`,
    slip: org('LE', 'Lincoln Elementary') + `<h4>Field Trip Permission Slip</h4><p class="intro">Class 3B visits the Exploratorium, San Francisco, on Friday, May 14. The bus leaves at 8:30 and returns by 2:45.</p>` +
      f('Student name', '', 'Student') + f('Parent or guardian', '', 'Your name') + f('Emergency phone', '', '(415) 555-0100') + f('Allergies', 'None') +
      `<label class="chk"><input type="checkbox">My child may ride the school bus</label>` + sig('Parent or guardian signature') + `<p class="pg">Page 1 of 1</p>`,
    timeoff: org('HR', 'Northline Logistics') + `<h4>Time Off Request</h4>` + f('Employee', '', 'Your name') + f('Department', 'Customer support') + f('First day off', 'July 6, 2027') + f('Back at work', 'July 13, 2027') + f('Hours requested', '40') +
      `<label class="chk"><input type="checkbox">Vacation</label><label class="chk"><input type="checkbox">Sick leave</label><label class="chk"><input type="checkbox">Personal day</label>` + sig('Employee signature') + `<p class="pg">Page 1 of 1</p>`,
  };
  if (sheet) {
    pad($('.pad-wrap', sheet));
    $$('.pick button').forEach((b) => b.addEventListener('click', () => {
      if (b.getAttribute('aria-pressed') === 'true') return;
      $$('.pick button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const swap = () => { sheet.innerHTML = forms[b.dataset.form]; pad($('.pad-wrap', sheet)); sheet.classList.remove('swap'); };
      if (reduce) return swap();
      sheet.classList.add('swap'); setTimeout(swap, 200);
    }));
  }

  // ---------- Mark up: controls change the fixed lease ----------
  const hl = $('#hl');
  $$('[data-hl]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-hl]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    hl.style.setProperty('--hl', b.dataset.hl); hl.classList.add('on');
  }));
  const noteT = $('#noteT');
  noteT && noteT.addEventListener('change', () => { $('#noteDot').classList.toggle('show', noteT.checked); $('#notePop').classList.toggle('show', noteT.checked); });
  const stamp = $('#stamp'), angle = $('#angle');
  $$('[data-stamp]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-stamp]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    if (b.dataset.stamp) stamp.textContent = b.dataset.stamp;
    stamp.classList.toggle('show', !!b.dataset.stamp);
  }));
  angle && angle.addEventListener('input', () => stamp.style.setProperty('--r', angle.value + 'deg'));
  // Redaction removes the characters from the page; switching it off puts the sample back.
  const redactT = $('#redactT');
  const originals = $$('.r').map((s) => s.textContent);
  redactT && redactT.addEventListener('change', () => {
    $$('.r').forEach((s, i) => {
      if (redactT.checked) {
        s.textContent = '';
        const bar = document.createElement('span'); bar.className = 'blk'; bar.setAttribute('role', 'img'); bar.setAttribute('aria-label', 'redacted');
        bar.style.width = (Number(s.dataset.len) * 0.55) + 'em'; s.appendChild(bar);
      } else s.textContent = originals[i];
    });
  });
  const signT = $('#signT'), signed = $('#signed');
  const sample = signed ? signed.innerHTML : '';
  signT && signT.addEventListener('change', () => {
    if (signT.checked) {
      signed.innerHTML = lastSignature ? `<img src="${lastSignature}" alt="Your signature">` : sample;
      requestAnimationFrame(() => signed.classList.add('show'));
    } else signed.classList.remove('show');
  });

  // ---------- Tools: tabs ----------
  const tabs = $$('.tab');
  if (tabs.length) {
    const show = (t) => tabs.forEach((x) => {
      const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      $('#' + x.getAttribute('aria-controls')).hidden = !on;
    });
    show(tabs[0]);
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', (e) => {
        const d = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : 0;
        if (!d) return; e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); show(n);
      });
    });
  }

  // ---------- Closing dialog ----------
  const dlg = $('#dlg');
  if (dlg) {
    const segs = $$('.seg button', dlg);
    segs.forEach((b) => b.addEventListener('click', () => segs.forEach((x) => x.setAttribute('aria-pressed', String(x === b)))));
    const save = $('#save'), help = $('#saveHelp');
    help.textContent = '';
    dlg.addEventListener('submit', () => {
      const name = ($('#fname').value || 'Untitled').trim();
      const flat = $('[aria-pressed="true"]', dlg).textContent === 'Flatten';
      save.textContent = 'Saved'; save.classList.add('done');
      help.textContent = `“${name}” saved ${flat ? 'flattened' : 'with its fields'}, on your iPhone. Nothing left it.`;
      setTimeout(() => { save.textContent = 'Save'; save.classList.remove('done'); }, 2200);
    });
  }

  // ---------- Hero clip: play only while visible ----------
  const vid = $('.mosaic video');
  if (vid) {
    if (reduce) { vid.removeAttribute('autoplay'); vid.pause(); }
    else if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => (e.isIntersecting ? vid.play().catch(() => {}) : vid.pause())).observe(vid);
  }
})();
