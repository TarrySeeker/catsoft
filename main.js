document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. Preloader / Loading Logic ---
    const isMobile = window.innerWidth <= 768;
    const preloader    = document.getElementById('vg-preloader');
    const preloaderBar = document.getElementById('vg-preloader-bar');

    gsap.registerPlugin(ScrollTrigger);

    // --- 1. CUSTOM CURSOR (Awwwards Style) ---
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    if (cursor && follower) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0, ease: "none" });
        });

        gsap.ticker.add(() => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            gsap.set(follower, { x: followerX, y: followerY });
        });

        document.querySelectorAll('button, a, .js-magnet').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('is-magnet');
                follower.classList.add('is-magnet');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('is-magnet');
                follower.classList.remove('is-magnet');
            });
        });
    }

    // --- 2. HEADER SCROLL EFFECT ---
    const header = document.querySelector('.vg-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('is-scrolled', window.scrollY > 50);
    });

    // =====================================================================
    // Все ScrollTrigger-анимации — запускаются ТОЛЬКО после intro
    // =====================================================================
    const initScrollAnimations = () => {

        // Parallax на CATSOFT-тексте при скролле
        gsap.to('.vg-hero__giant-text', {
            yPercent: -50,
            ease: "none",
            scrollTrigger: {
                trigger: '.vg-hero',
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        // Bento Grid Reveals
        const bentoItems = gsap.utils.toArray('.bento-item');
        if (bentoItems.length) {
            gsap.from(bentoItems, {
                scrollTrigger: {
                    trigger: '.vg-bento-section',
                    start: 'top 80%',
                    toggleActions: "play none none none"
                },
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "back.out(1.2)"
            });
        }

        // Online Eval Parallax
        gsap.from('.vg-eval__mockup', {
            scrollTrigger: {
                trigger: '.vg-eval-section',
                start: 'top 80%',
                end: 'bottom 20%',
                scrub: 1
            },
            y: 100
        });

        // Horizontal Scroll Pinning — только на десктопе
        if (window.innerWidth > 768) {
            const horizontalWrap = document.querySelector('.vg-horizontal-wrap');
            const horizontalContainer = document.querySelector('.vg-horizontal-container');

            if (horizontalWrap && horizontalContainer) {
                const getScrollAmount = () => -(horizontalContainer.scrollWidth - window.innerWidth);
                const tween = gsap.to(horizontalContainer, { x: getScrollAmount, ease: "none" });

                ScrollTrigger.create({
                    trigger: horizontalWrap,
                    start: "top top",
                    end: () => `+=${getScrollAmount() * -1}`,
                    pin: true,
                    animation: tween,
                    scrub: 1,
                    invalidateOnRefresh: true
                });
            }
        }

        // Sticky Split Section Animations
        gsap.utils.toArray('.vg-split-right .vg-card').forEach(card => {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: 'top 85%' },
                x: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });
        });

        // Infinite Marquee
        const marqueeTrack = document.querySelector('.js-marquee-track');
        if (marqueeTrack) {
            gsap.to(marqueeTrack, {
                xPercent: -50,
                ease: "none",
                duration: 30,
                repeat: -1
            });
        }
    };

    // --- 3. HERO ENTRANCE ANIMATION ---
    const startScale = isMobile ? 1.3 : 2.5;

    // Фиксируем начальное состояние сразу
    gsap.set('.vg-hero__giant-text', { scale: startScale, opacity: 0 });
    gsap.set('.vg-hero__subtitle',   { opacity: 0, y: 30 });
    gsap.set('.vg-hero__desc',       { opacity: 0, y: 20 });
    gsap.set('.vg-hero__actions',    { opacity: 0, y: 20 });

    const startHeroAnim = () => {
        const tlHero = gsap.timeline({ onComplete: initScrollAnimations });
        tlHero
            .to('.vg-hero__giant-text', {
                scale: 1, opacity: 1,
                duration: isMobile ? 2.5 : 3,
                ease: 'power2.out'
            })
            .to('.vg-hero__subtitle', { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, "-=1.2")
            .to('.vg-hero__desc',     { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, "-=1")
            .to('.vg-hero__actions',  { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, "-=0.8");
    };

    if (!isMobile && preloader && preloaderBar) {
        // Desktop: тело сразу видимое (прелоадер перекрывает), запускаем прогресс-бар
        document.body.classList.remove('is-loading');

        gsap.to(preloaderBar, {
            width: '100%',
            duration: 2.5,
            ease: 'power1.inOut',
            onComplete: () => {
                // Фейдаут прелоадера, потом запуск hero-анимации
                gsap.to(preloader, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        preloader.style.display = 'none';
                        startHeroAnim();
                    }
                });
            }
        });
    } else {
        // Mobile: штатное поведение
        setTimeout(() => {
            document.body.classList.remove('is-loading');
            setTimeout(startHeroAnim, 200);
        }, 100);
    }

    // --- 4. MODALS & VIDEO LOGIC ---
    const overlay = document.querySelector('.cs-modal-overlay');
    const modals = document.querySelectorAll('.cs-modal');
    const bgVideo = document.querySelector('.vg-hero__bg-video');

    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetModal = document.getElementById(trigger.getAttribute('data-modal-target'));
            if (targetModal) {
                if (bgVideo && !bgVideo.paused) bgVideo.pause();
                overlay.classList.add('is-active');
                targetModal.classList.add('is-active');
                const modalVideo = targetModal.querySelector('video');
                if (modalVideo) { modalVideo.currentTime = 0; modalVideo.play().catch(console.error); }
            }
        });
    });

    const closeModal = () => {
        overlay.classList.remove('is-active');
        modals.forEach(m => m.classList.remove('is-active'));
        document.querySelectorAll('.cs-modal video').forEach(v => v.pause());
        if (bgVideo && bgVideo.paused) bgVideo.play().catch(console.error);
    };

    document.querySelectorAll('.cs-modal__close').forEach(btn => btn.addEventListener('click', closeModal));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // --- 5. FAQ ACCORDION ---
    document.querySelectorAll('.vg-acc-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.vg-accordion');
            const isActive = item.classList.contains('is-active');
            document.querySelectorAll('.vg-accordion').forEach(i => i.classList.remove('is-active'));
            if (!isActive) item.classList.add('is-active');
        });
    });

    // --- 6. FORM PREVENT DOUBLE SUBMISSION ---
    document.querySelectorAll('.cs-form-feedback').forEach(form => {
        form.addEventListener('submit', () => {
            const btn = form.querySelector('button[type="submit"]');
            if (btn) { btn.disabled = true; btn.innerHTML = 'Отправка...'; }
        });
    });
});
