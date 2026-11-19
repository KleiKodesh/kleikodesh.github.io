// The site script (index.html).
// The saved theme is applied by a tiny inline script in each page's <head> (no flash);
// this file only wires the buttons.

const root = document.documentElement;

// Theme toggle: remembers the choice; with none saved the page follows the system, also
// when the system switches between light and dark while the page is open.
document.getElementById('themeToggle')?.addEventListener('click', () => {
    const dark = root.classList.toggle('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* storage blocked */ }
});
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
systemDark.addEventListener('change', e => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch { /* storage blocked */ }
    if (!saved) root.classList.toggle('dark', e.matches);
});

// Language: Hebrew (default, right to left) or English (left to right), like the installer.
// Every translatable element carries its English beside the Hebrew: data-en for its content,
// data-en-title / data-en-aria-label / data-en-placeholder for attributes. The Hebrew is
// kept on first switch (data-he*), so switching back restores it exactly. The saved choice
// sets lang/dir in the <head> before the first paint; the texts are swapped here.
const isEnglish = () => root.lang === 'en';
const t = (he, en) => (isEnglish() ? en : he);
const TRANSLATED_ATTRIBUTES = ['title', 'aria-label', 'placeholder'];

function applyLanguage(english) {
    root.lang = english ? 'en' : 'he';
    root.dir = english ? 'ltr' : 'rtl';
    document.querySelectorAll('[data-en]').forEach(el => {
        if (el.dataset.he === undefined) el.dataset.he = el.innerHTML;
        el.innerHTML = english ? el.dataset.en : el.dataset.he;
    });
    for (const attribute of TRANSLATED_ATTRIBUTES) {
        document.querySelectorAll(`[data-en-${attribute}]`).forEach(el => {
            const saved = `data-he-${attribute}`;
            if (!el.hasAttribute(saved)) el.setAttribute(saved, el.getAttribute(attribute) ?? '');
            el.setAttribute(attribute, el.getAttribute(english ? `data-en-${attribute}` : saved));
        });
    }
    const formLanguage = document.querySelector('#contact [name=_language]');
    if (formLanguage) formLanguage.value = root.lang;
}

if (isEnglish()) applyLanguage(true);
document.getElementById('langToggle')?.addEventListener('click', () => {
    const english = !isEnglish();
    applyLanguage(english);
    try { localStorage.setItem('lang', english ? 'en' : 'he'); } catch { /* storage blocked */ }
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
// the hero; the hero text says what it shows (alt / data-title-en = title, data-desc /
// data-desc-en = description, by page language) and
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

    const titleOf = picture => t(picture.alt, picture.dataset.titleEn || picture.alt);
    const descOf = picture => t(picture.dataset.desc || '', picture.dataset.descEn || picture.dataset.desc || '');

    reel.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
    pictures.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', titleOf(pictures[i]));
        dot.addEventListener('click', () => go(i));
        dots.appendChild(dot);
    });

    let current = -1;
    let timer = null;

    // Every picture exists per language and theme: images/shots/<he|en>/<light|dark>/<name>.png.
    function shotSrc(picture) {
        const lang = root.lang.startsWith('en') ? 'en' : 'he';
        const theme = root.classList.contains('dark') ? 'dark' : 'light';
        return `images/shots/${lang}/${theme}/${picture.dataset.shot}.png`;
    }

    // The theme or language toggle flips <html class="dark"> / lang: show the matching
    // picture and text at once.
    new MutationObserver(() => {
        if (current < 0) return;
        const picture = pictures[current];
        image.src = shotSrc(picture);
        image.alt = titleOf(picture);
        if (tellTitle) tellTitle.textContent = titleOf(picture);
        if (tellText) tellText.textContent = descOf(picture);
        [...dots.children].forEach((dot, i) => dot.setAttribute('aria-label', titleOf(pictures[i])));
    }).observe(root, { attributes: true, attributeFilter: ['class', 'lang'] });

    // animate = false for the first picture: the page loads instantly, with no entrance motion.
    function render(index, animate = true) {
        const picture = pictures[index];
        image.src = shotSrc(picture);
        image.alt = titleOf(picture);
        if (tellTitle) tellTitle.textContent = titleOf(picture);
        if (tellText) tellText.textContent = descOf(picture);
        parts.forEach(p => p.classList.toggle('is-current', p.dataset.part === picture.dataset.part));
        [...dots.children].forEach((dot, i) => dot.classList.toggle('is-current', i === index));
        // Restart the entrance animations for the new picture; the dot's fill always runs.
        for (const el of animate ? [frame, tell, dots] : [dots]) {
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
            render(index, !first);
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

// Download window: [data-open-download] opens it; any [data-close-dialog], Esc or a click
// on the backdrop closes it. Picking an option closes it too.
(function downloadDialog() {
    const dialog = document.getElementById('download-options');
    if (!dialog) return;
    document.querySelectorAll('[data-open-download]').forEach(b => b.addEventListener('click', () => dialog.showModal()));
    dialog.querySelectorAll('[data-close-dialog]').forEach(b => b.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    // A download closes the window - except the library, whose files are clicked one by one.
    dialog.querySelectorAll('a.download-option').forEach(a => a.addEventListener('click', () => dialog.close()));
})();

// Contact window: [data-open-contact] opens it; the close button, Esc or a click on the
// backdrop closes it.
(function contactDialog() {
    const dialog = document.getElementById('contact');
    if (!dialog) return;
    // Delegated: a language switch rebuilds links inside translated text (the star popup's).
    document.addEventListener('click', e => {
        if (!e.target.closest('[data-open-contact]')) return;
        e.preventDefault();
        dialog.showModal();
    });
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
        status.textContent = t('שולח…', 'Sending…');
        status.className = 'contact__status';
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error(String(response.status));
            form.reset();
            status.textContent = t('ההודעה נשלחה. תודה!', 'Message sent. Thank you!');
            status.classList.add('is-ok');
        } catch {
            status.textContent = t('השליחה נכשלה. נסו שוב מאוחר יותר.', 'Sending failed. Please try again later.');
            status.classList.add('is-error');
        } finally {
            submit.disabled = false;
        }
    });
})();

// What users say: the quotes run along the bottom strip like a train. The track's content is
// duplicated once so a move by half its width loops without a seam; the duration follows
// the width so the speed stays the same in both languages.
(function startTicker() {
    const PIXELS_PER_SECOND = 40;
    const track = document.querySelector('.quotes__track');
    if (!track) return;
    [...track.children].forEach(child => {
        const copy = child.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        track.appendChild(copy);
    });
    const setSpeed = () => track.style.setProperty('--ticker-s', (track.scrollWidth / 2 / PIXELS_PER_SECOND) + 's');
    setSpeed();
    new MutationObserver(setSpeed).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();


// Star request: shown on every visit; ✕ hides it until the next page load.
document.querySelector('.star-popup__close')?.addEventListener('click', () => {
    document.getElementById('star-popup').hidden = true;
});
