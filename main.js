document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. Remove Preloader ---
    setTimeout(() => {
        document.body.classList.remove('is-loading');
    }, 100);

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
            
            // Instantly move the small dot
            gsap.to(cursor, { 
                x: mouseX, y: mouseY, 
                duration: 0, 
                ease: "none" 
            });
        });

        // Smoothly lag the follower circle
        gsap.ticker.add(() => {
            // Lerp
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            gsap.set(follower, { x: followerX, y: followerY });
        });

        // Add magnetic state when hovering buttons
        const interactables = document.querySelectorAll('button, a, .js-magnet');
        interactables.forEach(el => {
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
        if (window.scrollY > 50) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    });

    // --- 3. VANGUARD HERO ENTRANCE (Video Mask) ---
    // The mask text scales down and the opacity of content fades in
    const tlHero = gsap.timeline({ delay: 0.3 });
    tlHero.from('.vg-hero__giant-text', { 
        scale: 5, 
        opacity: 0, 
        duration: 2, 
        ease: 'expo.out' 
    })
    .from('.vg-hero__subtitle', { y: 30, opacity: 0, duration: 1, ease: 'power3.out'}, "-=1.2")
    .from('.vg-hero__desc', { y: 20, opacity: 0, duration: 1, ease: 'power3.out'}, "-=1")
    .from('.vg-hero__actions', { y: 20, opacity: 0, duration: 1, ease: 'power3.out'}, "-=0.8");

    // Parallax on Giant Text when scrolling down
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

    // --- 4. BENTO GRID REVEALS ---
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

    // --- 5. ONLINE EVAL PARALLAX ---
    gsap.from('.vg-eval__mockup', {
        scrollTrigger: {
            trigger: '.vg-eval-section',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1
        },
        y: 100
    });

    // --- 6. HORIZONTAL SCROLL PINNING (How it works) ---
    // Only apply horizontal scroll on Desktop, let CSS handle stacking on mobile
    if (window.innerWidth > 768) {
        const horizontalWrap = document.querySelector('.vg-horizontal-wrap');
        const horizontalContainer = document.querySelector('.vg-horizontal-container');
        
        if (horizontalWrap && horizontalContainer) {
            
            // Calculate total scroll distance needed
            const getScrollAmount = () => -(horizontalContainer.scrollWidth - window.innerWidth);
            
            const tween = gsap.to(horizontalContainer, {
                x: getScrollAmount,
                ease: "none"
            });
            
            ScrollTrigger.create({
                trigger: horizontalWrap,
                start: "top top",
                end: () => `+=${getScrollAmount() * -1}`,
                pin: true,
                animation: tween,
                scrub: 1, // Smooth scrub
                invalidateOnRefresh: true
            });
        }
    }

    // --- 7. STICKY SPLIT SECTION ANIMATIONS ---
    const splitCards = gsap.utils.toArray('.vg-split-right .vg-card');
    splitCards.forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%'
            },
            x: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        });
    });

    // --- 8. INFINITE MARQUEE & VELOCITY SKEW ---
    // Infinite marquee without skew
    const marqueeTrack = document.querySelector('.js-marquee-track');
    if (marqueeTrack) {
        gsap.to(marqueeTrack, {
            xPercent: -50,
            ease: "none",
            duration: 30,
            repeat: -1
        });
    }

    // --- 9. MODALS & VIDEO LOGIC ---
    const overlay = document.querySelector('.cs-modal-overlay');
    const modals = document.querySelectorAll('.cs-modal');
    const bgVideo = document.querySelector('.vg-hero__bg-video');

    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = trigger.getAttribute('data-modal-target');
            const targetModal = document.getElementById(targetId);
            
            if (targetModal) {
                if (bgVideo && !bgVideo.paused) { bgVideo.pause(); }
                
                overlay.classList.add('is-active');
                targetModal.classList.add('is-active');

                // Autoplay modal video if exists
                const modalVideo = targetModal.querySelector('video');
                if (modalVideo) {
                    modalVideo.currentTime = 0;
                    modalVideo.play().catch(console.error);
                }
            }
        });
    });

    const closeModal = () => {
        overlay.classList.remove('is-active');
        modals.forEach(m => m.classList.remove('is-active'));
        
        document.querySelectorAll('.cs-modal video').forEach(v => {
            v.pause();
        });

        if (bgVideo && bgVideo.paused) {
            bgVideo.play().catch(console.error);
        }
    };

    document.querySelectorAll('.cs-modal__close').forEach(btn => btn.addEventListener('click', closeModal));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // --- 10. FAQ ACCORDION ---
    document.querySelectorAll('.vg-acc-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const currentItem = trigger.closest('.vg-accordion');
            const isActive = currentItem.classList.contains('is-active');
            
            // Close all
            document.querySelectorAll('.vg-accordion').forEach(item => item.classList.remove('is-active'));
            
            // Toggle
            if (!isActive) currentItem.classList.add('is-active');
        });
    });
    
    // --- 11. FORM PREVENT DOUBLE SUBMISSION ---
    document.querySelectorAll('.cs-form-feedback').forEach(form => {
        form.addEventListener('submit', () => {
            const btn = form.querySelector('button[type="submit"]');
            if(btn) {
                btn.disabled = true;
                btn.innerHTML = 'Отправка...';
            }
        });
    });
});
