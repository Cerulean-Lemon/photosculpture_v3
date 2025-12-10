/* ============================================
   PHOTOSCULPTURE - Main JavaScript
   GSAP + ScrollTrigger + Lenis + jQuery
   ============================================ */

/* ============================================
   0. Page Refresh - Scroll to Top & Reset
   ============================================ */
// 새로고침 시 항상 상단으로 스크롤 (DOM 로드 전)
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// 즉시 상단으로
window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

// 페이지 로드 전 이벤트
window.addEventListener('beforeunload', function() {
    window.scrollTo(0, 0);
});

// Wait for DOM
$(document).ready(function() {
    
    // 페이지 로드 시 즉시 상단으로 이동
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    /* ============================================
       1. Initialize Lenis Smooth Scroll
       ============================================ */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });
    
    // 초기에는 스크롤 비활성화 (로딩 중)
    lenis.stop();
    
    // 강제로 상단으로 이동
    lenis.scrollTo(0, { immediate: true });

    // Lenis RAF
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* ============================================
       2. Register GSAP Plugins
       ============================================ */
    gsap.registerPlugin(ScrollTrigger);

    /* ============================================
       3. Custom Cursor
       ============================================ */
    const cursor = {
        dot: $('.cursor-dot'),
        outline: $('.cursor-outline'),
        
        init: function() {
            // Only on non-touch devices
            if (window.matchMedia('(hover: hover)').matches) {
                $(document).on('mousemove', this.move.bind(this));
                this.setupHoverEffects();
            }
        },
        
        move: function(e) {
            gsap.to(this.dot, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1
            });
            gsap.to(this.outline, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3
            });
        },
        
        setupHoverEffects: function() {
            const self = this;
            
            $('a, button, .gallery-item, .memory-card, .photo-item').on('mouseenter', function() {
                self.outline.addClass('hover');
            }).on('mouseleave', function() {
                self.outline.removeClass('hover');
            });
        }
    };
    
    cursor.init();

    /* ============================================
       4. Loading Animation
       ============================================ */
    const loader = {
        el: $('.loader'),
        text: $('.loader-text span'),
        bar: $('.loader-bar'),
        
        init: function() {
            // Animate loader text
            gsap.to(this.text, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power2.out'
            });
            
            // Animate progress bar
            gsap.to(this.bar, {
                width: '100%',
                duration: 2,
                ease: 'power2.inOut',
                onComplete: () => this.hide()
            });
        },
        
        hide: function() {
            gsap.to(this.el, {
                yPercent: -100,
                duration: 1,
                ease: 'power4.inOut',
                onComplete: () => {
                    this.el.remove();
                    
                    // 상단으로 강제 이동 후 스크롤 활성화
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    
                    // Lenis도 상단으로
                    lenis.scrollTo(0, { immediate: true });
                    
                    // 약간의 딜레이 후 스크롤 활성화
                    setTimeout(() => {
                        lenis.start();
                        ScrollTrigger.refresh();
                    }, 50);
                    
                    this.animateHero();
                }
            });
        },
        
        animateHero: function() {
            // Side navigator 등장
            gsap.from('.side-navigator', {
                opacity: 0,
                x: 50,
                duration: 0.8,
                ease: 'power2.out',
                delay: 0.5
            });
        }
    };
    
    loader.init();

    /* ============================================
       4.5 Side Navigator - Simple & Clean
       ============================================ */
    const sideNavigator = {
        currentSection: 'hero',
        sections: ['hero', 'about', 'gallery', 'community'],
        sectionData: {
            'hero': { num: '01', name: 'HOME' },
            'about': { num: '02', name: 'ABOUT' },
            'gallery': { num: '03', name: 'GALLERY' },
            'community': { num: '04', name: 'COMMUNITY' }
        },
        
        init: function() {
            this.setupScrollTracking();
        },
        
        setupScrollTracking: function() {
            const self = this;
            
            this.sections.forEach(section => {
                const el = document.getElementById(section);
                if (!el) return;
                
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 40%',
                    end: 'bottom 40%',
                    onEnter: () => self.setActiveSection(section),
                    onEnterBack: () => self.setActiveSection(section)
                });
            });
        },
        
        setActiveSection: function(section) {
            if (this.currentSection === section) return;
            
            const data = this.sectionData[section];
            if (!data) return;
            
            this.currentSection = section;
            
            const numEl = document.querySelector('.nav-section-num');
            const nameEl = document.querySelector('.nav-section-name');
            
            if (!numEl || !nameEl) return;
            
            gsap.to([numEl, nameEl], {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    numEl.textContent = data.num;
                    nameEl.textContent = data.name;
                    gsap.to([numEl, nameEl], {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                }
            });
        }
    };
    
    sideNavigator.init();

    /* ============================================
       4.6 Intro Sequence Animation
       Cards → Hero (스크럽 방식으로 더 명확하게)
       ============================================ */
    /* ============================================
       4.6 Intro Sequence Animation - New Layout
       세련된 스크롤 트리거 애니메이션
       ============================================ */
    const introSequence = {
        init: function() {
            const stackCards = document.querySelectorAll('.stack-card');
            const heroInner = document.querySelector('.hero-inner');
            const heroMain = document.querySelector('.hero-main');
            
            // 새로운 구조의 요소들
            const topTitle = document.querySelector('.hero-top-title .title-line span');
            const bottomTitle = document.querySelector('.hero-bottom-title .title-line span');
            const brandElements = {
                photo: document.querySelector('.brand-photo'),
                plus: document.querySelector('.brand-plus'),
                sculpture: document.querySelector('.brand-sculpture')
            };
            const brandDesc = document.querySelector('.brand-desc');
            const heroTagline = document.querySelector('.hero-tagline');
            
            if (!stackCards.length || !heroInner || !heroMain) return;
            
            // 카드 사라지는 애니메이션 - 더 빨리 사라지게
            gsap.to(stackCards, {
                clipPath: 'inset(0% 0% 100% 0%)',
                stagger: {
                    from: 'center',
                    each: 0.1
                },
                scrollTrigger: {
                    trigger: heroMain,
                    start: 'top 90%',
                    end: 'top 50%',
                    scrub: 1,
                }
            });
            
            // 1. 상단 타이틀 등장 - "잊혀져 가는 것들의"
            if (topTitle) {
                gsap.to(topTitle, {
                    opacity: 1,
                    y: 0,
                    scrollTrigger: {
                        trigger: heroMain,
                        start: 'top 50%',
                        end: 'top 10%',
                        scrub: 1.5,
                    }
                });
            }
            
            // 2. 브랜드 로고 등장 - PHOTO + SCULPTURE (순차적으로)
            if (brandElements.photo) {
                gsap.to(brandElements.photo, {
                    opacity: 1,
                    x: 0,
                    scrollTrigger: {
                        trigger: heroMain,
                        start: 'top 40%',
                        end: 'top 5%',
                        scrub: 1.5,
                    }
                });
            }
            
            if (brandElements.plus) {
                gsap.to(brandElements.plus, {
                    opacity: 1,
                    scale: 1,
                    scrollTrigger: {
                        trigger: heroMain,
                        start: 'top 35%',
                        end: 'top center',
                        scrub: 1.5,
                    }
                });
            }
            
            if (brandElements.sculpture) {
                gsap.to(brandElements.sculpture, {
                    opacity: 1,
                    x: 0,
                    scrollTrigger: {
                        trigger: heroMain,
                        start: 'top 30%',
                        end: 'top -5%',
                        scrub: 1.5,
                    }
                });
            }
            
            // 3. 하단 타이틀 등장 - "디지털 박물관"
            if (bottomTitle) {
                gsap.to(bottomTitle, {
                    opacity: 1,
                    y: 0,
                    scrollTrigger: {
                        trigger: heroMain,
                        start: 'top 25%',
                        end: 'top -10%',
                        scrub: 1.5,
                    }
                });
            }
            
            // 4. 설명 텍스트 등장
            if (brandDesc) {
                gsap.to(brandDesc, {
                    opacity: 1,
                    y: 0,
                    scrollTrigger: {
                        trigger: heroMain,
                        start: 'top 20%',
                        end: 'top -15%',
                        scrub: 1.5,
                    }
                });
            }
            
            if (heroTagline) {
                gsap.to(heroTagline, {
                    opacity: 1,
                    y: 0,
                    scrollTrigger: {
                        trigger: heroMain,
                        start: 'top 15%',
                        end: 'top -20%',
                        scrub: 1.5,
                    }
                });
            }
            
            // About 섹션으로 스크롤 시 Hero 전체가 위로 올라가며 사라짐
            gsap.to(heroInner, {
                y: -150,
                opacity: 0,
                scrollTrigger: {
                    trigger: '.about',
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1.5,
                }
            });
        }
    };
    
    introSequence.init();


    /* ============================================
       4.7 Gallery Reveal Animation
       ============================================ */
    /* ============================================
       NEW TIME TRAVEL GALLERY
       ============================================ */
    const timelineGallery = {
        currentYear: null,
        
        init: function() {
            this.setupSwipers();
            this.setupScrollAnimations();
            this.setupProgressBar();
            this.setupCardAnimations();
            this.setupHoverEffects();
        },

        // Swiper 초기화
        setupSwipers: function() {
            document.querySelectorAll('.timeline-swiper').forEach((swiperEl, index) => {
                new Swiper(swiperEl, {
                    slidesPerView: 'auto',
                    spaceBetween: 30,
                    centeredSlides: false,
                    grabCursor: true,
                    pagination: {
                        el: swiperEl.querySelector('.swiper-pagination'),
                        clickable: true,
                        dynamicBullets: true
                    },
                    breakpoints: {
                        320: {
                            slidesPerView: 1.2,
                            spaceBetween: 20
                        },
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 25
                        },
                        1024: {
                            slidesPerView: 'auto',
                            spaceBetween: 30
                        }
                    },
                    on: {
                        init: function() {
                            setTimeout(() => {
                                timelineGallery.setup3DTilt();
                            }, 100);
                        }
                    }
                });
            });
        },

        // 3D 틸트 효과
        setup3DTilt: function() {
            document.querySelectorAll('[data-tilt]').forEach(card => {
                card.addEventListener('mousemove', function(e) {
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;
                    
                    gsap.to(this, {
                        duration: 0.3,
                        rotationX: rotateX,
                        rotationY: rotateY,
                        transformPerspective: 1000,
                        ease: 'power2.out'
                    });
                });
                
                card.addEventListener('mouseleave', function() {
                    gsap.to(this, {
                        duration: 0.5,
                        rotationX: 0,
                        rotationY: 0,
                        ease: 'power2.out'
                    });
                });
            });
        },

        // 카드 등장 애니메이션 (scrub 기능)
        setupCardAnimations: function() {
            document.querySelectorAll('.timeline-era').forEach(era => {
                const cards = era.querySelectorAll('.timeline-memory-card');
                
                // 카드 초기 상태
                gsap.set(cards, {
                    opacity: 0,
                    y: 80,
                    scale: 0.9
                });

                // 스크롤에 따라 카드 등장 (scrub)
                cards.forEach((card, index) => {
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: era,
                            start: 'top 70%',
                            end: 'top 30%',
                            scrub: 1,
                            toggleActions: 'play none none reverse'
                        },
                        delay: index * 0.1
                    });
                });
            });
        },

        // 카드 호버 애니메이션
        setupHoverEffects: function() {
            $(document).on('mouseenter', '.timeline-memory-card', function() {
                const card = this;
                gsap.to($(card).find('.card-image img'), {
                    scale: 1.1,
                    duration: 0.8,
                    ease: 'power3.out'
                });
                gsap.to($(card).find('.card-overlay'), {
                    opacity: 1,
                    duration: 0.5,
                    ease: 'power2.out'
                });
                gsap.to($(card).find('.card-overlay-content'), {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: 0.1,
                    ease: 'power3.out'
                });
            }).on('mouseleave', '.timeline-memory-card', function() {
                const card = this;
                gsap.to($(card).find('.card-image img'), {
                    scale: 1,
                    duration: 0.6,
                    ease: 'power2.out'
                });
                gsap.to($(card).find('.card-overlay'), {
                    opacity: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                });
                gsap.to($(card).find('.card-overlay-content'), {
                    opacity: 0,
                    y: 20,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });
        },

        // 스크롤 기반 애니메이션
        setupScrollAnimations: function() {
            // 갤러리 인트로
            gsap.from('.gallery-intro .section-label', {
                opacity: 0,
                y: 30,
                duration: 1,
                scrollTrigger: {
                    trigger: '.gallery-intro',
                    start: 'top 80%'
                }
            });

            const mainTitleLines = document.querySelectorAll('.gallery-main-title .split-line');
            mainTitleLines.forEach((line, i) => {
                gsap.from(line, {
                    opacity: 0,
                    y: 60,
                    duration: 1,
                    delay: 0.2 + i * 0.15,
                    scrollTrigger: {
                        trigger: '.gallery-intro',
                        start: 'top 70%'
                    }
                });
            });

            gsap.from('.gallery-subtitle', {
                opacity: 0,
                y: 20,
                duration: 1,
                delay: 0.5,
                scrollTrigger: {
                    trigger: '.gallery-intro',
                    start: 'top 70%'
                }
            });

            // 각 시대 섹션 등장 애니메이션
            document.querySelectorAll('.timeline-era').forEach((era, index) => {
                // 헤더 등장
                gsap.fromTo(era.querySelector('.era-header'), 
                    {
                        opacity: 0,
                        y: 60
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: era,
                            start: 'top 70%',
                            end: 'top 30%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );


            });
        },

        // 진행 표시줄
        setupProgressBar: function() {
            const progressFill = document.querySelector('.progress-fill');
            const gallery = document.querySelector('.time-travel-gallery');
            
            if (!progressFill || !gallery) return;

            ScrollTrigger.create({
                trigger: gallery,
                start: 'top top',
                end: 'bottom bottom',
                onUpdate: (self) => {
                    gsap.to(progressFill, {
                        width: `${self.progress * 100}%`,
                        duration: 0.3,
                        ease: 'none'
                    });
                }
            });

            // 마커 클릭 이벤트
            document.querySelectorAll('.progress-markers span').forEach(marker => {
                marker.addEventListener('click', function() {
                    const era = this.dataset.year;
                    const target = document.querySelector(`[data-era="${era}"]`);
                    
                    if (target) {
                        lenis.scrollTo(target, {
                            offset: -100,
                            duration: 2,
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                        });
                    }
                });
            });

            // 활성 마커 표시
            document.querySelectorAll('.timeline-era').forEach(era => {
                ScrollTrigger.create({
                    trigger: era,
                    start: 'top 60%',
                    end: 'bottom 40%',
                    onEnter: () => {
                        const eraName = era.dataset.era;
                        document.querySelectorAll('.progress-markers span').forEach(m => {
                            m.classList.toggle('active', m.dataset.year === eraName);
                        });
                    },
                    onEnterBack: () => {
                        const eraName = era.dataset.era;
                        document.querySelectorAll('.progress-markers span').forEach(m => {
                            m.classList.toggle('active', m.dataset.year === eraName);
                        });
                    }
                });
            });
        }
    };

    timelineGallery.init();


    /* ============================================
       6. Navigation
       ============================================ */
    const nav = {
        hamburger: $('.nav-hamburger'),
        mobileMenu: $('.mobile-menu'),
        mobileLinks: $('.mobile-link'),
        isOpen: false,
        
        init: function() {
            this.hamburger.on('click', () => this.toggle());
            this.mobileLinks.on('click', () => this.close());
            
            // Smooth scroll to sections
            $('a[href^="#"]').on('click', function(e) {
                e.preventDefault();
                const target = $($(this).attr('href'));
                if (target.length) {
                    lenis.scrollTo(target[0], {
                        offset: -80,
                        duration: 1.5
                    });
                }
            });
        },
        
        toggle: function() {
            this.isOpen = !this.isOpen;
            
            if (this.isOpen) {
                this.open();
            } else {
                this.close();
            }
        },
        
        open: function() {
            this.mobileMenu.addClass('active');
            $('body').addClass('no-scroll');
            lenis.stop();
            
            // Animate hamburger
            gsap.to(this.hamburger.find('span').eq(0), {
                y: 8,
                rotate: 45,
                duration: 0.3
            });
            gsap.to(this.hamburger.find('span').eq(1), {
                opacity: 0,
                duration: 0.3
            });
            gsap.to(this.hamburger.find('span').eq(2), {
                y: -8,
                rotate: -45,
                duration: 0.3
            });
            
            // Animate links
            gsap.to(this.mobileLinks, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                delay: 0.3,
                ease: 'power2.out'
            });
        },
        
        close: function() {
            this.isOpen = false;
            
            gsap.to(this.mobileLinks, {
                opacity: 0,
                y: 50,
                duration: 0.3
            });
            
            setTimeout(() => {
                this.mobileMenu.removeClass('active');
                $('body').removeClass('no-scroll');
                lenis.start();
            }, 300);
            
            // Reset hamburger
            gsap.to(this.hamburger.find('span').eq(0), {
                y: 0,
                rotate: 0,
                duration: 0.3
            });
            gsap.to(this.hamburger.find('span').eq(1), {
                opacity: 1,
                duration: 0.3
            });
            gsap.to(this.hamburger.find('span').eq(2), {
                y: 0,
                rotate: 0,
                duration: 0.3
            });
        }
    };
    
    nav.init();

    /* ============================================
       7. About Section Animations - Visual Design
       스크럽 기반으로 더 명확한 반응
       ============================================ */
    const aboutAnimations = {
        init: function() {
            // Big statement 스크럽 애니메이션
            const bigTextLines = gsap.utils.toArray('.about-big-text .split-line');
            bigTextLines.forEach((line, i) => {
                gsap.from(line, {
                    y: 100,
                    opacity: 0,
                    scrollTrigger: {
                        trigger: line,
                        start: 'top 85%',
                        end: 'top 60%',
                        scrub: 1,
                    }
                });
            });
            
            // Flip Card 등장 애니메이션
            gsap.from('.about-flip-card', {
                scale: 0.85,
                opacity: 0,
                rotateY: -15,
                scrollTrigger: {
                    trigger: '.about-visual-section',
                    start: 'top 80%',
                    end: 'top 50%',
                    scrub: 1,
                }
            });
            
            // Second text 스크럽 애니메이션
            const secondTextLines = gsap.utils.toArray('.about-second-text .split-line');
            secondTextLines.forEach((line, i) => {
                gsap.from(line, {
                    x: 80,
                    opacity: 0,
                    scrollTrigger: {
                        trigger: line,
                        start: 'top 85%',
                        end: 'top 60%',
                        scrub: 1,
                    }
                });
            });
            
            // Description 스크럽
            gsap.from('.about-desc', {
                opacity: 0,
                y: 40,
                scrollTrigger: {
                    trigger: '.about-desc',
                    start: 'top 85%',
                    end: 'top 65%',
                    scrub: 1,
                }
            });
            
            // CTA button
            gsap.from('.about-cta', {
                opacity: 0,
                y: 30,
                scrollTrigger: {
                    trigger: '.about-cta',
                    start: 'top 90%',
                    end: 'top 75%',
                    scrub: 1,
                }
            });
        }
    };
    
    aboutAnimations.init();

    /* ============================================
       10. Story Section - 가로 스크롤 + 인터랙티브
       ============================================ */
    const storyAnimations = {
        wrapper: null,
        track: null,
        isDragging: false,
        startX: 0,
        scrollLeft: 0,
        
        init: function() {
            this.wrapper = document.querySelector('.story-horizontal-wrapper');
            this.track = document.querySelector('.story-track');
            
            if (!this.wrapper) return;
            
            // 드래그 스크롤
            this.setupDragScroll();
            
            // 카드 호버 효과
            this.setupCardEffects();
            
            // 타이틀 애니메이션
            this.animateTitle();
        },
        
        setupDragScroll: function() {
            const wrapper = this.wrapper;
            
            wrapper.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                wrapper.classList.add('dragging');
                this.startX = e.pageX - wrapper.offsetLeft;
                this.scrollLeft = wrapper.scrollLeft;
            });
            
            wrapper.addEventListener('mouseleave', () => {
                this.isDragging = false;
                wrapper.classList.remove('dragging');
            });
            
            wrapper.addEventListener('mouseup', () => {
                this.isDragging = false;
                wrapper.classList.remove('dragging');
            });
            
            wrapper.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                e.preventDefault();
                const x = e.pageX - wrapper.offsetLeft;
                const walk = (x - this.startX) * 2;
                wrapper.scrollLeft = this.scrollLeft - walk;
            });
        },
        
        setupCardEffects: function() {
            // 스토리 카드 호버 효과
            $(document).on('mouseenter', '.story-card', function() {
                const card = this;
                
                // 다른 카드 흐리게
                gsap.to('.story-card', {
                    opacity: 0.5,
                    scale: 0.98,
                    duration: 0.3
                });
                
                // 현재 카드 강조
                gsap.to(card, {
                    opacity: 1,
                    scale: 1.02,
                    y: -15,
                    duration: 0.4,
                    ease: 'power2.out'
                });
                
                // 이미지 확대
                gsap.to($(card).find('img'), {
                    scale: 1.1,
                    duration: 0.5,
                    ease: 'power2.out'
                });
                
                // 오버레이 표시
                gsap.to($(card).find('.story-card-overlay'), {
                    opacity: 1,
                    duration: 0.3
                });
                
            }).on('mouseleave', '.story-card', function() {
                const card = this;
                
                gsap.to('.story-card', {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.3
                });
                
                gsap.to($(card).find('img'), {
                    scale: 1,
                    duration: 0.5
                });
                
                gsap.to($(card).find('.story-card-overlay'), {
                    opacity: 0,
                    duration: 0.3
                });
            });
        },
        
        animateTitle: function() {
            // 타이틀 등장
            gsap.from('.story-main-title', {
                y: 60,
                opacity: 0,
                scrollTrigger: {
                    trigger: '.story-detail',
                    start: 'top 80%',
                    end: 'top 50%',
                    scrub: 1
                }
            });
            
            gsap.from('.story-main-desc', {
                y: 40,
                opacity: 0,
                scrollTrigger: {
                    trigger: '.story-detail',
                    start: 'top 75%',
                    end: 'top 50%',
                    scrub: 1
                }
            });
            
            // 스크롤 인디케이터
            gsap.from('.story-scroll-indicator', {
                opacity: 0,
                scrollTrigger: {
                    trigger: '.story-horizontal-wrapper',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    };
    
    storyAnimations.init();

    /* ============================================
       11. Community Section - 3D 틸트 + 무한 슬라이드
       ============================================ */
    const communityAnimations = {
        slider: null,
        track: null,
        cards: null,
        isPaused: false,
        animationId: null,
        speed: 0.6,
        currentX: 0,
        
        init: function() {
            this.slider = document.querySelector('.memory-slider');
            this.track = document.querySelector('.memory-track');
            
            if (!this.slider || !this.track) return;
            
            // 카드 복제 (무한 루프용)
            this.cloneCards();
            
            // 슬라이더 애니메이션 시작
            this.startSlider();
            
            // 3D 틸트 효과
            this.setup3DTilt();
            
            // 호버 이벤트
            this.setupHoverEffects();
            
            // 타이틀 애니메이션
            this.animateTitle();
        },
        
        cloneCards: function() {
            const cards = this.track.querySelectorAll('.memory-card');
            this.cards = cards;
            
            // 카드들을 2번 복제
            cards.forEach(card => {
                const clone = card.cloneNode(true);
                this.track.appendChild(clone);
            });
            cards.forEach(card => {
                const clone = card.cloneNode(true);
                this.track.appendChild(clone);
            });
        },
        
        startSlider: function() {
            const totalWidth = this.track.scrollWidth / 3;
            
            const animate = () => {
                if (!this.isPaused) {
                    this.currentX -= this.speed;
                    
                    if (Math.abs(this.currentX) >= totalWidth) {
                        this.currentX = 0;
                    }
                    
                    gsap.set(this.track, { x: this.currentX });
                }
                this.animationId = requestAnimationFrame(animate);
            };
            
            animate();
        },
        
        setup3DTilt: function() {
            const self = this;
            
            // 3D 틸트 효과
            $(document).on('mousemove', '.memory-card:not(.add-memory)', function(e) {
                const card = this;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    duration: 0.3,
                    ease: 'power2.out',
                    transformPerspective: 1000
                });
                
                // 빛 반사 효과 위치
                const shine = $(card).find('.card-shine');
                if (shine.length) {
                    const shineX = (x / rect.width) * 100;
                    const shineY = (y / rect.height) * 100;
                    shine.css({
                        'background': `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.3) 0%, transparent 60%)`
                    });
                }
            }).on('mouseleave', '.memory-card:not(.add-memory)', function() {
                gsap.to(this, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        },
        
        setupHoverEffects: function() {
            const self = this;
            
            // 슬라이더 영역 호버 시 멈춤
            this.slider.addEventListener('mouseenter', () => {
                self.isPaused = true;
            });
            
            this.slider.addEventListener('mouseleave', () => {
                self.isPaused = false;
            });
            
            // 개별 카드 호버 - 오버레이 표시
            $(document).on('mouseenter', '.memory-card:not(.add-memory)', function() {
                const card = this;
                
                // 다른 카드들 흐리게
                gsap.to('.memory-track .memory-card:not(.add-memory)', {
                    opacity: 0.5,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                
                // 현재 카드 강조
                gsap.to(card, {
                    opacity: 1,
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                
                // 오버레이 & 콘텐츠 표시
                gsap.to($(card).find('.card-overlay'), {
                    opacity: 1,
                    duration: 0.3
                });
                
                gsap.to($(card).find('.card-overlay-content'), {
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                });
                
                // 빛 반사
                gsap.to($(card).find('.card-shine'), {
                    opacity: 1,
                    duration: 0.3
                });
                
            }).on('mouseleave', '.memory-card:not(.add-memory)', function() {
                const card = this;
                
                gsap.to('.memory-track .memory-card:not(.add-memory)', {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                
                gsap.to($(card).find('.card-overlay'), {
                    opacity: 0,
                    duration: 0.3
                });
                
                gsap.to($(card).find('.card-overlay-content'), {
                    y: 20,
                    duration: 0.3
                });
                
                gsap.to($(card).find('.card-shine'), {
                    opacity: 0,
                    duration: 0.3
                });
            });
            
            // 기억 기증하기 버튼
            $('.memory-card.add-memory').on('mouseenter', function() {
                gsap.to($(this).find('.add-icon'), {
                    rotation: 90,
                    scale: 1.3,
                    duration: 0.4,
                    ease: 'back.out(1.7)'
                });
            }).on('mouseleave', function() {
                gsap.to($(this).find('.add-icon'), {
                    rotation: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });
        },
        
        setupGlowEffect: function() {
            // 마우스 위치에 따른 글로우 효과
            $(document).on('mousemove', '.memory-card', function(e) {
                const card = this;
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        },
        
        animateTitle: function() {
            // Title 스크럽 애니메이션
            const communityTitleLines = gsap.utils.toArray('.community-title .split-line');
            communityTitleLines.forEach((line, i) => {
                gsap.from(line, {
                    y: 80,
                    opacity: 0,
                    scrollTrigger: {
                        trigger: '.community',
                        start: 'top 75%',
                        end: 'top 50%',
                        scrub: 1
                    }
                });
            });
            
            // 슬라이더 등장 애니메이션
            gsap.from('.memory-slider', {
                opacity: 0,
                y: 50,
                scrollTrigger: {
                    trigger: '.community',
                    start: 'top 60%',
                    end: 'top 40%',
                    scrub: 1
                }
            });
            
            // 기억 기증 버튼 등장
            gsap.from('.add-memory-section', {
                opacity: 0,
                y: 30,
                scrollTrigger: {
                    trigger: '.add-memory-section',
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    };
    
    communityAnimations.init();

    /* ============================================
       11.5 Scroll to Top Button
       ============================================ */
    const scrollToTop = {
        button: $('.scroll-to-top'),
        
        init: function() {
            if (!this.button.length) return;
            
            // Show/hide button on scroll
            lenis.on('scroll', (e) => {
                if (e.scroll > window.innerHeight * 0.5) { // Show after 50vh scroll
                    this.button.addClass('visible');
                } else {
                    this.button.removeClass('visible');
                }
            });
            
            // Scroll to top on click
            this.button.on('click', () => {
                lenis.scrollTo(0, {
                    duration: 2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            });
        }
    };
    scrollToTop.init();

    /* ============================================
       12. Footer Animations
       ============================================ */
    const footerAnimations = {
        init: function() {
            // Content fade in
            gsap.from('.footer-content > *', {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.footer',
                    start: 'top 80%'
                }
            });
            
            // Rolling text
            gsap.to('.footer-rolling-track', {
                x: '-50%',
                duration: 20,
                ease: 'none',
                repeat: -1
            });
        }
    };
    
    footerAnimations.init();

    /* ============================================
       13. Parallax Effects
       ============================================ */
    const parallaxEffects = {
        init: function() {
            // Generic parallax for images
            $('[data-parallax]').each(function() {
                const speed = $(this).data('parallax') || 0.5;
                
                gsap.to(this, {
                    y: () => window.innerHeight * speed * -1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: this,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            });
        }
    };
    
    parallaxEffects.init();

    /* ============================================
       14. Text Split Animation Utility
       ============================================ */
    const textAnimations = {
        init: function() {
            // Initialize SplitType if available
            if (typeof SplitType !== 'undefined') {
                this.splitTexts();
            }
        },
        
        splitTexts: function() {
            // Split titles for animation
            const titles = document.querySelectorAll('[data-split]');
            
            titles.forEach(title => {
                const split = new SplitType(title, { types: 'chars, words' });
                
                gsap.from(split.chars, {
                    y: 100,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.02,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: title,
                        start: 'top 80%'
                    }
                });
            });
        }
    };
    
    textAnimations.init();

    /* ============================================
       15. Resize Handler
       ============================================ */
    let resizeTimer;
    
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            ScrollTrigger.refresh();
        }, 250);
    });

    /* ============================================
       16. Page Visibility
       ============================================ */
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            lenis.stop();
        } else {
            lenis.start();
        }
    });

    /* ============================================
       17. Preload Images
       ============================================ */
    const preloadImages = () => {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            if (img.complete) return;
            
            img.style.opacity = '0';
            img.onload = () => {
                gsap.to(img, {
                    opacity: 1,
                    duration: 0.5
                });
            };
        });
    };
    
    preloadImages();

    /* ============================================
       18. Debug Mode (Development Only)
       ============================================ */
    const debug = {
        enabled: false, // Set to true for debugging
        
        init: function() {
            if (!this.enabled) return;
            
            // Show ScrollTrigger markers
            ScrollTrigger.defaults({
                markers: true
            });
            
            console.log('🎨 PHOTOSCULPTURE Debug Mode Active');
            console.log('📊 Total ScrollTriggers:', ScrollTrigger.getAll().length);
        }
    };
    
    debug.init();

});

/* ============================================
   19. Performance Optimization
   ============================================ */

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}