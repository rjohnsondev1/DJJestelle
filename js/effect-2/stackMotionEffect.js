import { throttle } from '../utils.js';
import { gsap } from 'gsap';

let winsize = {width: window.innerWidth, height: window.innerHeight};

export class StackMotionEffect {
  constructor(stackEl) {
    // Check if the provided element is valid.
    if (!stackEl || !(stackEl instanceof HTMLElement)) {
      throw new Error('Invalid element provided.');
    }

    this.wrapElement = stackEl;
    this.contentElement = this.wrapElement.querySelector('.content');
    this.imageElements = [this.contentElement.querySelectorAll('.card')];
    this.imagesTotal = this.imageElements.length;

    // Set up the effect for the provided element.
    this.initializeEffect(stackEl);
  }
  
  // Sets up the initial effect on the provided element.
  initializeEffect(element) {
    // Scroll effect.
    this.scroll();
    this.introAnimation();

    const throttledResize = throttle(() => {
      winsize = { width: window.innerWidth, height: window.innerHeight };
      this.scroll();
    }, 100);
    window.addEventListener('resize', throttledResize);
  }


   introAnimation() {
    firstLooad = false;
    const introTL = gsap.timeline();
    introTL
        .to('.loader', { x: '100%', duration: 0.8, ease: "power4.inOut", delay: 1 })
        .fromTo(position, { x: isMobile ? 3 : 3, y: isMobile ? -0.8 : -0.8, z: isMobile ? 1.2 : 1.2 }, { x: isMobile ? 1.28 : 1.28, y: isMobile ? -1.7 : -1.7, z: isMobile ? 5.86 : 5.86, duration: 4, onUpdate }, '-=0.8')
        .fromTo(target, { x: isMobile ? 2.5 : 2.5, y: isMobile ? -0.07 : -0.07, z: isMobile ? -0.1 : -0.1 }, { x: isMobile ? -0.21 : 0.91, y: isMobile ? 0.03 : 0.03, z: isMobile ? -0.25 : -0.25, duration: 4, onUpdate }, '-=4')
        .fromTo('.header--container', { opacity: 0, y: '-100%' }, { opacity: 1, y: '0%', ease: "power1.inOut", duration: 0.8 }, '-=1')
        .fromTo('.hero--scroller', { opacity: 0, y: '150%' }, { opacity: 1, y: '0%', ease: "power4.inOut", duration: 1 }, '-=1')
        .fromTo('.hero--container', { opacity: 0, x: '100%' }, { opacity: 1, x: '0%', ease: "power4.inOut", duration: 1.8, onComplete: setupScrollAnimation }, '-=1')
        .fromTo('.side-bar', { opacity: 0, x: '50%' }, { opacity: 1, x: '0%', ease: "power4.inOut", duration: 2 }, '-=1')
        .to('.side-bar .unique', { opacity: 1, scale: 1.5, ease: "power4.inOut", duration: 2 }, '-=1');
}

  scroll() {
    // Let's set the initial rotation for the content element

    document.body.style.overflowY = "scroll";


    this.contentElement.style.transform = 'rotate3d(1, 0, 0, 55deg) rotate3d(0, 1, 0, 30deg)';
    this.contentElement.style.opacity = 0;

    if (this.tl) {
      this.tl.kill();
    }

    this.tl = gsap.timeline({
      defaults: {
        ease: 'none',
      },
      scrollTrigger: {
        trigger: this.wrapElement,
        start: 'top center',
        end: '+=150%',
        scrub: true,
        onEnter: () => gsap.set(this.contentElement, {opacity: 1}),
        onEnterBack: () => gsap.set(this.contentElement, {opacity: 1}),
        onLeave: () => gsap.set(this.contentElement, {opacity: 0}),
        onLeaveBack: () => gsap.set(this.contentElement, {opacity: 0}),
      },
    })
    to(position, {
      x: -1.83, y: -0.14, z: 6.15,
      scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: "top top", scrub: true, immediateRender: false }, onUpdate
  })
      .to(target, {
          x: isMobile ? 0 : -0.78, y: isMobile ? 1.5 : -0.03, z: -0.12,
          scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: "top top", scrub: true, immediateRender: false }
      })
      .to(ring.rotation, {
          x: (ringModel == 1) ? 0 : -Math.PI / 3, y: (ringModel == 1) ? 0 : -0.92, z: (ringModel == 1) ? Math.PI / 2 : 0,
          scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: "top top", scrub: true, immediateRender: false }
      })
      .fromTo(colorLerpValue, { x: 0 }, {
          x: 1,
          scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: "top top", scrub: true, immediateRender: false }
          , onUpdate: function () {
              if (!usingCustomColors) {
                  silver.material.color.lerpColors(new THREE.Color(0xfefefe).convertSRGBToLinear(), new THREE.Color(0xd28b8b).convertSRGBToLinear(), colorLerpValue.x);
                  gold.material.color.lerpColors(new THREE.Color(0xe2bf7f).convertSRGBToLinear(), new THREE.Color(0xd28b8b).convertSRGBToLinear(), colorLerpValue.x);
                  for (const o of diamondObjects) {
                      o.material.color.lerpColors(new THREE.Color(0xffffff).convertSRGBToLinear(), new THREE.Color(0x39cffe).convertSRGBToLinear(), colorLerpValue.x);
                  }
              }
          }
      })
      .to('.hero--scroller', {
          opacity: 0, y: '150%',
          scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: "top center", scrub: 1, immediateRender: false, pin: '.hero--scroller--container' }
      })
      .to('.hero--container', {
          opacity: 0, xPercent: '100', ease: "power4.out",
          scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: "top top", scrub: 1, immediateRender: false }
      })
      .to('.forever--text-bg', {
          opacity: 0.1, ease: "power4.inOut",
          scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false }
      })
      .fromTo('.forever--container', { opacity: 0, x: '-110%' }, {
          opacity: 1, x: '0%', ease: "power4.inOut",
          scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false }
      })
      .addLabel("Forever")
      .to('.side-bar .unique', { opacity: 0.5, scale: 1, ease: "power4.inOut", duration: 2, scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false } })
      .to('.side-bar .forever', { opacity: 1, scale: 1.5, ease: "power4.inOut", duration: 2, scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false } })

      .to(position, {
          x: -0.06, y: -1.15, z: 4.42,
          scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: "top top", scrub: true, immediateRender: false }, onUpdate
      })
      .to(target, {
          x: -0.01, y: 0.9, z: 0.07,
          scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: "top top", scrub: true, immediateRender: false }, onUpdate
      })
      .to(ring.rotation, {
          x: (ringModel == 1) ? 0 : 0.92, y: (ringModel == 1) ? 0 : 0.92, z: (ringModel == 1) ? -Math.PI / 2 : Math.PI / 3,
          scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: "top top", scrub: true, immediateRender: false }
      })
      .fromTo(colorLerpValue2, { x: 0 }, {
          x: 1,
          scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: "top top", scrub: true, immediateRender: false }
          , onUpdate: function () {
              if (!usingCustomColors) {
                  silver.material.color.lerpColors(new THREE.Color(0xd28b8b).convertSRGBToLinear(), new THREE.Color(0xf7c478).convertSRGBToLinear(), colorLerpValue2.x);
                  gold.material.color.lerpColors(new THREE.Color(0xd28b8b).convertSRGBToLinear(), new THREE.Color(0xf7c478).convertSRGBToLinear(), colorLerpValue2.x);
                  for (const o of diamondObjects) {
                      o.material.color.lerpColors(new THREE.Color(0x39cffe).convertSRGBToLinear(), new THREE.Color(0xf70db1).convertSRGBToLinear(), colorLerpValue2.x);
                  }
              }
          }
      })
      .to('.forever--container', {
          opacity: 0, x: '-110%', ease: "power4.inOut",
          scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false }
      })
      .to('.emotions--text-bg', {
          opacity: 0.1, ease: "power4.inOut",
          scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false }
      })
      .fromTo('.emotions--content', { opacity: 0, y: '130%' }, {
          opacity: 1, y: '0%', duration: 0.5, ease: "power4.inOut",
          scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: "top top", scrub: 1, immediateRender: false }
      })
      .addLabel("Emotions")
      .to('.side-bar .forever', { opacity: 0.5, scale: 1, ease: "power4.inOut", duration: 2, scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false } })
      .to('.side-bar .emotions', { opacity: 1, scale: 1.5, ease: "power4.inOut", duration: 2, scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false } });
}
    /*.fromTo(this.imageElements, {
      filter: 'brightness(10%)',
    }, {
      filter: 'brightness(400%)',
      stagger: 0.005,
    }, 0);*/
  }

