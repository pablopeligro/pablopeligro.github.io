(function () {
    'use strict';

    var root = document.documentElement;
    root.classList.add('js');

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Theme toggle ---------- */
    var themeToggle = document.getElementById('themeToggle');
    function currentTheme() {
        var t = root.getAttribute('data-theme');
        if (t) return t;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    root.setAttribute('data-theme', currentTheme());
    themeToggle.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });

    /* ---------- Mobile menu ---------- */
    var menuToggle = document.getElementById('menuToggle');
    var nav = document.getElementById('nav');
    function closeMenu() {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
    menuToggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

    /* ---------- Header state + scroll progress ---------- */
    var header = document.querySelector('.site-header');
    var progress = document.querySelector('.scroll-progress');
    function onScroll() {
        var y = window.scrollY;
        header.classList.toggle('scrolled', y > 10);
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Active nav link ---------- */
    var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    if ('IntersectionObserver' in window) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (a) {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(function (s) { if (s) navObserver.observe(s); });
    }

    /* ---------- Reveal on scroll ---------- */
    var reveals = document.querySelectorAll('.reveal');
    // Stagger siblings inside grids
    document.querySelectorAll('.project-grid, .skills-grid, .about-cards').forEach(function (grid) {
        Array.prototype.forEach.call(grid.children, function (el, i) {
            el.style.setProperty('--delay', (i % 3) * 90 + 'ms');
        });
    });
    if ('IntersectionObserver' in window && !reduceMotion) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(function (el) { revealObserver.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Typed role ---------- */
    var typed = document.getElementById('typed');
    var roles = [
        'Computer Engineering Student',
        'Embedded Systems Enthusiast',
        'Real-Time & Robotics',
        'Clean Code Advocate'
    ];
    if (typed && !reduceMotion) {
        var r = 0, c = roles[0].length, deleting = true;
        var tick = function () {
            var word = roles[r];
            if (deleting) {
                c--;
                if (c <= 0) { deleting = false; r = (r + 1) % roles.length; }
            } else {
                c++;
                if (c >= roles[r].length) { deleting = true; typed.textContent = roles[r]; return setTimeout(tick, 2200); }
            }
            typed.textContent = (deleting ? word : roles[r]).slice(0, c);
            setTimeout(tick, deleting ? 40 : 75);
        };
        setTimeout(tick, 2600);
    }

    /* ---------- Count-up stats ---------- */
    var counters = document.querySelectorAll('[data-count]');
    function runCounter(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (reduceMotion) { el.textContent = target; return; }
        var start = null, duration = 1200;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
        var countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { runCounter(entry.target); countObserver.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        counters.forEach(function (el) { countObserver.observe(el); });
    } else {
        counters.forEach(runCounter);
    }

    /* ---------- Project filters ---------- */
    var filters = document.querySelectorAll('.filter');
    var cards = document.querySelectorAll('.project-card');
    filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var f = btn.getAttribute('data-filter');
            filters.forEach(function (b) {
                var on = b === btn;
                b.classList.toggle('active', on);
                b.setAttribute('aria-selected', String(on));
            });
            cards.forEach(function (card) {
                var show = f === 'all' || card.getAttribute('data-category') === f;
                card.classList.toggle('hidden', !show);
                if (show) card.classList.add('visible');
            });
        });
    });

    /* ---------- Copy email ---------- */
    var toast = document.getElementById('toast');
    var toastTimer;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }
    var copyBtn = document.getElementById('copyEmail');
    copyBtn.addEventListener('click', function () {
        var email = copyBtn.getAttribute('data-email');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(
                function () { showToast('Email copied to clipboard ✓'); },
                function () { showToast(email); }
            );
        } else {
            showToast(email);
        }
    });

    /* ---------- Footer year ---------- */
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
})();
