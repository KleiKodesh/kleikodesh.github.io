// The site script (index.html).
// The saved theme is applied by a tiny inline script in each page's <head> (no flash);
// this file only wires the buttons.

const root = document.documentElement;

// Theme toggle: remembers the choice; with none saved the page follows the system.
document.getElementById('themeToggle')?.addEventListener('click', () => {
    const dark = root.classList.toggle('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* storage blocked */ }
});

// Narrow screens: the nav folds into a menu button.
const menuBtn = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

function setMenuOpen(open) {
    nav?.classList.toggle('open', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
}

menuBtn?.addEventListener('click', () => setMenuOpen(!nav.classList.contains('open')));
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));

// The download button's URL is static, in index.html — a full versioned link to the
// installer, marked data-download-button="main". The sync-download-link workflow rewrites
// it after every release, once it has confirmed the new asset downloads.
//
// It is deliberately NOT resolved in JS. There used to be code here that fetched the
// release from the GitHub API and set the href at load time; it broke the button for
// exactly the users it was meant to serve — content filters (NetFree/Rimon) block
// api.github.com, and shared institutional IPs exhaust the 60 req/hr anonymous rate
// limit — while masking any mistake in the static href from everyone else, since a
// working API call overwrote it before anyone could notice.
//
// So: don't reintroduce a runtime lookup here. If the link is stale, the release
// workflow is the thing to fix.
//
// The workflow rewrites only that one button, so any other download button on the page
// (data-download-copy) takes its href from it — one source of truth, nothing fetched.
const mainDownload = document.querySelector('[data-download-button="main"]');
if (mainDownload) {
    document.querySelectorAll('[data-download-copy]').forEach(a => { a.href = mainDownload.href; });
}

// Hero reel - show and tell. Every picture in the hidden #slides is shown in turn beside
// the hero; the hero text says what it shows (alt = title, data-desc = description) and
// the part it belongs to (data-part) lights up. Each picture holds for SLIDE_MS; the
// current dot fills up meanwhile. Hovering pauses; dots and parts jump.
(function startReel() {
    const SLIDE_MS = 6000;
    const OUT_MS = 300;

    const reel = document.querySelector('[data-reel]');
    const pictures = [...document.querySelectorAll('#slides img')];
    if (!reel || pictures.length === 0) return;

    const frame = reel.querySelector('.reel__frame');
    const image = frame.querySelector('img');
    const dots = reel.querySelector('.reel__dots');
    const tell = document.querySelector('.tell');
    const tellTitle = tell?.querySelector('.tell__title');
    const tellText = tell?.querySelector('.tell__text');
    const parts = [...document.querySelectorAll('.parts [data-part]')];
    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    reel.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
    pictures.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', pictures[i].alt);
        dot.addEventListener('click', () => go(i));
        dots.appendChild(dot);
    });

    let current = -1;
    let timer = null;

    function render(index) {
        const picture = pictures[index];
        image.src = picture.getAttribute('src');
        image.alt = picture.alt;
        if (tellTitle) tellTitle.textContent = picture.alt;
        if (tellText) tellText.textContent = picture.dataset.desc || '';
        parts.forEach(p => p.classList.toggle('is-current', p.dataset.part === picture.dataset.part));
        [...dots.children].forEach((dot, i) => dot.classList.toggle('is-current', i === index));
        // Restart the entrance animations (and the dot's fill) for the new picture.
        for (const el of [frame, tell, dots]) {
            el?.classList.remove('is-entering');
            void el?.offsetWidth;
            el?.classList.add('is-entering');
        }
    }

    function go(index) {
        if (index === current) return;
        const first = current === -1;
        current = index;
        if (first || !motionOk) {
            render(index);
        } else {
            frame.classList.add('is-leaving');
            tell?.classList.add('is-leaving');
            setTimeout(() => {
                frame.classList.remove('is-leaving');
                tell?.classList.remove('is-leaving');
                render(index);
            }, OUT_MS);
        }
        restart();
    }

    function restart() {
        clearTimeout(timer);
        if (motionOk && !reel.matches(':hover')) timer = setTimeout(() => go((current + 1) % pictures.length), SLIDE_MS);
    }

    parts.forEach(part => part.addEventListener('click', () => {
        const first = pictures.findIndex(p => p.dataset.part === part.dataset.part);
        if (first >= 0) go(first);
    }));
    reel.addEventListener('mouseenter', () => { clearTimeout(timer); reel.classList.add('is-paused'); });
    reel.addEventListener('mouseleave', () => { reel.classList.remove('is-paused'); restart(); });

    go(0);
})();

// Contact window: [data-open-contact] opens it; the close button, Esc or a click on the
// backdrop closes it.
(function contactDialog() {
    const dialog = document.getElementById('contact');
    if (!dialog) return;
    document.querySelectorAll('[data-open-contact]').forEach(b => b.addEventListener('click', e => {
        e.preventDefault();
        dialog.showModal();
    }));
    dialog.querySelector('[data-close-contact]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

    // Send from inside the window (Formspree's JSON API) instead of leaving the site for
    // Formspree's thank-you page; the result is shown in the window.
    const form = dialog.querySelector('form');
    const status = dialog.querySelector('.contact__status');
    const submit = form.querySelector('[type=submit]');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        submit.disabled = true;
        status.textContent = 'שולח…';
        status.className = 'contact__status';
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error(String(response.status));
            form.reset();
            status.textContent = 'ההודעה נשלחה. תודה!';
            status.classList.add('is-ok');
        } catch {
            status.textContent = 'השליחה נכשלה. נסו שוב מאוחר יותר.';
            status.classList.add('is-error');
        } finally {
            submit.disabled = false;
        }
    });
})();
