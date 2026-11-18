// Pagefill site: nav shadow, scroll reveals, count-up stats, seamless marquee.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nav = document.getElementById('nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // Duplicate the marquee once so the -50% loop is seamless.
  const track = document.getElementById('marquee');
  if (track) track.innerHTML += track.innerHTML;

  const countUp = (el) => {
    const end = Number(el.dataset.count);
    if (reduce || !end) return;
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e);
      if (k < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0'; requestAnimationFrame(tick);
  };

  const items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(e.target);
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
})();
