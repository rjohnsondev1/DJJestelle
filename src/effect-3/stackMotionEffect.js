import { throttle } from '../utils.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let winsize = {width: window.innerWidth, height: window.innerHeight};

export class StackMotionEffect {
  constructor(stackEl) {
    // Check if the provided element is valid.
    if (!stackEl || !(stackEl instanceof HTMLElement)) {
      throw new Error('Invalid element provided.');
    }

    this.wrapElement = stackEl;
    this.contentElement = this.wrapElement.querySelector('.about');
    this.imageElements = Array.from(this.contentElement.querySelectorAll('.card1'));
    this.imagesTotal = this.imageElements.length;

    // Set up the effect for the provided element.
    this.initializeEffect(stackEl);
  }
  
  // Sets up the initial effect on the provided element.
  initializeEffect(element) {
    // Scroll effect.
    this.scroll();

    const throttledResize = throttle(() => {
      winsize = { width: window.innerWidth, height: window.innerHeight };
      this.scroll();
    }, 100);
    window.addEventListener('resize', throttledResize);
  }

  scroll() {
    // Let's set the initial rotation for the content element
    //this.contentElement.style.transform = 'rotate3d(1, 0, 0, 25deg) rotate3d(0, 1, 0, -50deg) rotate3d(0, 0, 1, 25deg)';
    //this.contentElement.style.opacity = 0;

    if (this.tl) {
      this.tl.kill();
    }


    function animateFrom(elem, direction) {
      direction = direction || 1;
      let x = 0,
          y = direction * 100;

          if(elem.classList.contains('card1')) {
            x = -100,
            y = 0;

          } else if (elem.classList.contains('about')) {
            x = 100
            y = 0;

          }
          elem.style.transform = "translate(${x}px, ${y}px)";
          elem.style.opacity = "0";
          gsap.fromTo(elem, {x: x, y: y, autoAlpha: 0}, {duration: 1.25, x: 0, y: 0, autoAlpha: 1, ease: "expo", overwrite: "auto"});

            
          }

          function hide(elem) {
            gsap.set(elem, {autoAlpha: 0});

          }

          document.addEventListener("DOMContentLoaded", () => {
            this.tl = gsap.utils.toArray('.about, .card1').forEach((elem) => {
              hide(elem);

              ScrollTrigger.create({
                trigger: elem,
               markers: true,
              
                onEnter: () => {animateFrom(elem)},
               onEnterBack: () => {animateFrom(elem, -1)},
               onLeave: () => {hide(elem)},
          
          });
    
        });

     })
       
  }
   
}
  

