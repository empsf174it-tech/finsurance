document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Theme Toggle
    const themeToggleBtns = document.querySelectorAll('.theme-toggle');
    const htmlEl = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    const setTheme = (theme) => {
        if(theme === 'dark') {
            htmlEl.setAttribute('data-theme', 'dark');
            themeToggleBtns.forEach(btn => btn.innerHTML = '<i data-lucide="sun"></i>');
        } else {
            htmlEl.removeAttribute('data-theme');
            themeToggleBtns.forEach(btn => btn.innerHTML = '<i data-lucide="moon"></i>');
        }
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    };

    setTheme(currentTheme);

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const newTheme = htmlEl.hasAttribute('data-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            setTheme(newTheme);
        });
    });

    // Mobile Drawer
    const hamburger = document.querySelector('.hamburger');
    const drawer = document.querySelector('.mobile-drawer');
    const overlay = document.querySelector('.drawer-overlay');
    const closeBtn = document.querySelector('.close-btn');

    const toggleDrawer = () => {
        drawer.classList.toggle('open');
        overlay.classList.toggle('open');
    };

    if (hamburger && drawer && overlay && closeBtn) {
        hamburger.addEventListener('click', toggleDrawer);
        overlay.addEventListener('click', toggleDrawer);
        closeBtn.addEventListener('click', toggleDrawer);
    }

    // Password visibility toggle (auth pages)
    document.querySelectorAll('.pw-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            if (!input) return;
            const reveal = input.type === 'password';
            input.type = reveal ? 'text' : 'password';
            btn.innerHTML = reveal ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';
            btn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });

    // Form Validation (Contact, Auth, Claims, Calculator)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            // Basic validation
            form.querySelectorAll('[required]').forEach(input => {
                const group = input.closest('.form-group') || input.closest('.checkbox-group');
                if(!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
                    isValid = false;
                    group.classList.add('error');
                } else {
                    group.classList.remove('error');
                }
            });

            // Email format validation
            const emails = form.querySelectorAll('input[type="email"]');
            emails.forEach(email => {
                if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                    isValid = false;
                    const group = email.closest('.form-group');
                    group.classList.add('error');
                    const msg = group.querySelector('.error-msg');
                    if(msg) msg.textContent = "Please enter a valid email address.";
                }
            });

            // Password Match Validation
            const pwd = form.querySelector('input[name="password"]');
            const confirm = form.querySelector('input[name="confirm_password"]');
            if(pwd && pwd.value.length < 8) {
                isValid = false;
                const group = pwd.closest('.form-group');
                group.classList.add('error');
                const msg = group.querySelector('.error-msg');
                if(msg) msg.textContent = "Password must be at least 8 characters.";
            }

            if(pwd && confirm && pwd.value !== confirm.value) {
                isValid = false;
                const group = confirm.closest('.form-group');
                group.classList.add('error');
                const msg = group.querySelector('.error-msg');
                if(msg) msg.textContent = "Passwords do not match.";
            }

            // Numeric input validation for calculators/estimates
            const numInputs = form.querySelectorAll('input[type="number"]');
            numInputs.forEach(input => {
                if (input.value && isNaN(input.value)) {
                    isValid = false;
                    input.closest('.form-group').classList.add('error');
                }
            });

            if(isValid) {
                // Mock success for form submission
                const btn = form.querySelector('button[type="submit"]');
                if (btn) {
                    const origText = btn.innerHTML;
                    btn.textContent = 'Processing...';
                    setTimeout(() => {
                        btn.innerHTML = origText;
                        const successMsg = form.querySelector('.success-msg');
                        if(successMsg) {
                            successMsg.style.display = 'block';
                            form.reset();
                        } else if(form.closest('.auth-card')) {
                            // Redirect to home if auth form
                            window.location.href = 'index.html'; 
                        }
                    }, 1500);
                }
            }
        });
    });

    // Active Link State in Navbar
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-drawer a').forEach(link => {
        if(link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Navbar elevation on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Back to top
    const toTop = document.querySelector('.back-to-top');
    if (toTop) {
        const toggleToTop = () => toTop.classList.toggle('show', window.scrollY > 400);
        toggleToTop();
        window.addEventListener('scroll', toggleToTop, { passive: true });
        toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Scroll reveal
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealEls.forEach(el => io.observe(el));
    }

    // Count-up numbers ([data-count])
    const countEls = document.querySelectorAll('[data-count]');
    if (countEls.length) {
        const fmt = (n, suffix) => n.toLocaleString('en-US') + (suffix || '');
        const run = (el) => {
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            const dur = 1600;
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min(1, (now - start) / dur);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = fmt(Math.round(target * eased), suffix);
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        const cio = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { run(entry.target); cio.unobserve(entry.target); }
            });
        }, { threshold: 0.5 });
        countEls.forEach(el => cio.observe(el));
    }

    // FAQ accordion
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            item.closest('.faq-list').querySelectorAll('.faq-item.open').forEach(open => {
                if (open !== item) {
                    open.classList.remove('open');
                    open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });
            item.classList.toggle('open', !isOpen);
            question.setAttribute('aria-expanded', String(!isOpen));
        });
    });
});
