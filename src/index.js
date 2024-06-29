import * as THREE from 'three'; // Importing THREE 
import { gsap } from 'gsap';
import { Analytics } from '@vercel/analytics'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import particlesVertexShader from '../shaders/particles/vertex.glsl';
import particlesFragmentShader from '../shaders/particles/fragment.glsl';
import particlesVertexShader2 from '../shaders/particles/vertex2.glsl'

// Importing utility function for preloading images
import { preloadImages } from './utils.js';
// Importing StackMotionEffect classes from different effect files with renamed imports to avoid name conflicts
import { StackMotionEffect as StackMotionEffect1 } from './effect-1/stackMotionEffect.js';
import { StackMotionEffect as StackMotionEffect2 } from './effect-2/stackMotionEffect.js';
import { StackMotionEffect as StackMotionEffect3 } from './effect-3/stackMotionEffect.js';

// Registers ScrollTrigger plugin with GSAP for scroll-based animations.
gsap.registerPlugin(ScrollTrigger);

// Initialize function to set up motion effects and animations
const init = () => {



  // Select all grid intro card elements and apply animations on scroll
  /*const introCards = document.querySelectorAll(' .card1');
  introCards.forEach(introCard => {
    gsap.timeline(introCard, {
      ease: 'power1.in',
      startAt: {
        transformOrigin: '50% 50%',
        filter: 'brightness(100%)'
      },
      rotationX: () => -60,
      yPercent: () => gsap.utils.random(-100,0),
      z: () => gsap.utils.random(-100,0),
      filter: 'brightness(100%)',
      scrollTrigger: {
        trigger: '.card1',
        start: 'left left',
        end: 'clamp(+=100px bottom)',
        scrub: true,
      },
      x: 400,
      rotation: 360,
      duration: 3,
    });
    
  }); */

  gsap.utils.toArray('.about, .card1,  .circle' ).forEach((elem) => {
    hide(elem);

    ScrollTrigger.create({
      trigger: elem,
      //markers: true,
      scrub: true,
      onEnter: () => {animateFrom(elem)},
     onEnterBack: () => {animateFrom(elem, -1)},
     onLeave: () => {hide(elem)},

 });

});


};


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

      } else if (elem.classList.contains('')) {
        x = -40,
        y = 50;
}
      elem.style.transform = "translate(${x}px, ${y}px)";
      elem.style.opacity = "0";
      gsap.fromTo(elem, {x: x, y: y, autoAlpha: 0}, {duration: 1.25, x: 0, y: 0, autoAlpha: 1, ease: "expo", overwrite: "auto"});

        
      }

      function hide(elem) {
        gsap.set(elem, {autoAlpha: 0});
} 













gsap.to('.music', {
  scrollTrigger: {
    trigger:'.music-title',
    start: 'top center',
    end: 'bottom center',
    scrub: 1,
   // markers: true,
    pin: true,
    toggleActions: 'restart pause reverse pause',
  
  },
  x: 30,

  ease: 'power1.inOut',
  flipY: 180,
  duration: 1,
  
  
}) 


  /*const music = document.querySelectorAll('.music');
  music.forEach(musicEl => {

    gsap.to(musicEl, {
    
      scrollTrigger: {
        trigger: 'musicEl',
        pin: true,
        start: 'top center',
        end: 'center center',
        scrub: true,
        markers: true,
        snap: {
          snapTo: 'section-title',
          duration: { min: 0.2, max: 3},
          delay: 0.2,
          ease: 'power1.inOut'
        }
      }
    });
    
    tl.addLabel('start')
      .from(musicEl, { scale: 0.3, rotation: 180, autoAlpha: 0})
    .addLabel('color')
    .from('', { backgroundColor: '#28a92b'})
     .addLabel('spin')
    .to('center', { rotation: 360 })
    .addLabel('end');
    
    
 
    }); */

  

// Preloading images and initializing setup when complete
preloadImages('.grid__img').then(() => {
  document.body.classList.remove('loading');
  init();
});






     


/* const hero = document.querySelectorAll('.card1, .container');
hero.forEach(hero => {
  
}) */




const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

// Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const loader = new OBJLoader();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);


  // Materials
  if(particles)
    particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)
  
  
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  

//update Renderer
  renderer.setSize(sizes.width, sizes.height);
  bloomPass.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

// Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.001, 1000);
camera.position.set(0, 0, 8 )
scene.add(camera);

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;


// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);



// Bloom Pass
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 0.6;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(bloomPass);






let particles = null;


gltfLoader.load('/models/3dlogo4.glb', (gltf) => 
  {
   console.log(gltf)
   particles = {}

   // Geometry

   particles.geometry = new THREE.BufferGeometry(3);
   particles.geometry.setIndex(null)

   // Material

   particles.material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
        pointTexture:  new THREE.TextureLoader().load('../img/dotTexture.png'),
       
    },
    blending: THREE.AdditiveBlending,
    alphaTest: 1.0,
    transparent: true,
   })

   // Points
   particles.points = new THREE.Points(particles.geometry, particles.material);
   scene.add(particles.points);



   


})

const group = new THREE.Group();
scene.add(group);

const sparkles = [];
const sparklesGeometry = new THREE.BufferGeometry();
const sparklesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader2,
    fragmentShader: particlesFragmentShader,
    uniforms: {
        pointTexture: {
            value: new THREE.TextureLoader().load('../img/dotTexture.png'),
        },
    },
    blending: THREE.AdditiveBlending,
    alphaTest: 1.0,
    transparent: true,
});
const points = new THREE.Points(sparklesGeometry, sparklesMaterial);
group.add(points);


const colors = [
  new THREE.Color('#CFD6DE'),
  new THREE.Color('#1EE3CF'),
  new THREE.Color('#6B48FF'),
  new THREE.Color('#125D98'),
];



const galaxyColors = colors.map(color => color.clone().multiplyScalar(0.5));

class Star {
  setup(color) {
    this.r = Math.random() * 3 + 1;
    this.phi = Math.random() * Math.PI * 2;
    this.theta = Math.random() * Math.PI;
    this.v = new THREE.Vector2().random().subScalar(0.5).multiplyScalar(0.0007);

    this.x = this.r * Math.sin(this.phi) * Math.sin(this.theta);
    this.y = this.r * Math.cos(this.phi);
    this.z = this.r * Math.sin(this.phi) * Math.cos(this.theta);

    this.size = Math.random() * 2.5 + 0.5 * sizes.pixelRatio;
    this.color = color;
  }
  update() {
    this.phi += this.v.x;
    this.theta += this.v.y;
    this.x = this.r * Math.sin(this.phi) * Math.sin(this.theta);
    this.y = this.r * Math.cos(this.phi);
    this.z = this.r * Math.sin(this.phi) * Math.cos(this.theta);
  }
}

// Create stars
const stars = [];
const galaxyGeometryVertices = [];
const galaxyGeometryColors = [];
const galaxyGeometrySizes = [];

for (let i = 0; i < 3000; i++) {
  const star = new Star();
  star.setup(galaxyColors[Math.floor(Math.random() * galaxyColors.length)]);
  galaxyGeometryVertices.push(star.x, star.y, star.z);
  galaxyGeometryColors.push(star.color.r, star.color.g, star.color.b);
  galaxyGeometrySizes.push(star.size);
  stars.push(star);
}
const starsGeometry = new THREE.BufferGeometry();
starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(galaxyGeometrySizes, 1));
starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(galaxyGeometryColors, 3));
const galaxyPoints = new THREE.Points(starsGeometry, sparklesMaterial);
scene.add(galaxyPoints);


let _prev = 0;

function render(a) {
  requestAnimationFrame(render);

  galaxyPoints.rotation.y +=  0.0005;



    
  
  const tempStarsArray = [];
  stars.forEach((s) => {
    s.update();
    tempStarsArray.push(s.x, s.y, s.z);
  });
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tempStarsArray, 3));
  
  controls.update();
  composer.render();


}

window.addEventListener('mousemove', onMouseMove);
function onMouseMove(e) {
  const x = THREE.MathUtils.mapLinear(e.clientY, 0, sizes.width, -0.3, 0.3);
  const y = THREE.MathUtils.mapLinear(e.clientX, 0, sizes.height, 0.3, -0.3);
  gsap.to(group.rotation, {
    y: y,
    x: x,
    duration: 1.5,
    ease: 'power1.inOut',
    
    
  });

}

render();


const tick = () =>
  {
      // Update controls
      controls.update()
  
      // Render normal scene
      renderer.render(scene, camera)
  
      // Call tick again on the next frame
      window.requestAnimationFrame(tick)
  }
  
  tick() 

