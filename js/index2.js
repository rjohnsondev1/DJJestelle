import * as THREE from 'three'; // Importing THREE 
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

import particlesVertexShader from '../shaders/particles/vertex.glsl';
import particlesFragmentShader from '../shaders/particles/fragment.glsl';
import { preloadImages } from './utils.js'; 
import { StackMotionEffect as StackMotionEffect1 } from './effect-1/stackMotionEffect.js';
import { StackMotionEffect as StackMotionEffect2 } from './effect-2/stackMotionEffect.js';
import { StackMotionEffect as StackMotionEffect3 } from './effect-3/stackMotionEffect.js';

gsap.registerPlugin(ScrollTrigger);

const init = () => {
    document.querySelectorAll('[data-stack]').forEach((stackEl) => {
        new StackMotionEffect1(stackEl);
    });

    const introCards = document.querySelectorAll('.intro, .card');
    introCards.forEach(introCard => {
        gsap.to(introCard, {
            ease: 'power1.in',
            startAt: {
                transformOrigin: '100% 50%',
                filter: 'brightness(100%)'
            },
            rotationX: () => -60,
            yPercent: () => gsap.utils.random(-100, 0),
            z: () => gsap.utils.random(-100, 0),
            filter: 'brightness(20%)',
            scrollTrigger: {
                trigger: introCard,
                start: 'clamp(top bottom)',
                end: 'clamp(bottom top)',
                scrub: true,
            }
        });
    });
};

preloadImages('.grid__img').then(() => {
    document.body.classList.remove('loading');
    init();
});

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

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    bloomPass.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);
});

// Camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.001, 1000);
camera.position.z = 2.7;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setSize(sizes.width, sizes.height);

// Bloom Pass
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 0.6;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(bloomPass);

const group = new THREE.Group();
scene.add(group);

const sparkles = [];
const sparklesGeometry = new THREE.BufferGeometry();
const sparklesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
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

let sampler = null;
const lines = [];

const colors = [
    new THREE.Color('#CFD6DE'),
    new THREE.Color('#1EE3CF'),
    new THREE.Color('#6B48FF'),
    new THREE.Color('#125D98'),
];
const galaxyColors = colors.map(color => color.clone().multiplyScalar(0.5));

function dots() {
    sampler = new MeshSurfaceSampler(logo).build();

    for (let i = 0; i < 8; i++) {
        const linesMaterial = new THREE.LineBasicMaterial({
            color: colors[i % 3],
            transparent: true,
            opacity: 1,
        });
        const linesMesh = new THREE.Line(new THREE.BufferGeometry(), linesMaterial);
        linesMesh.coordinates = [];
        linesMesh.previous = null;
        lines.push(linesMesh);
        group.add(linesMesh);
    }
    requestAnimationFrame(render);
}

let logo = null;

loader.load(
    '../models/3dlogo2.obj',
    (obj) => {
        logo = obj.children[0];
        logo.geometry.scale(0.3, 0.3, 0.3);
        logo.geometry.translate(0, -2, 0);
        logo.geometry.rotateY(0.2);
        dots();
        requestAnimationFrame(render);

    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
    (err) => console.log("An error happened", err)
);

let safe = 0;
const p1 = new THREE.Vector3();
function nextDot(line) {
    let ok = false;
    safe = 0;
    while (!ok && safe < 200) {
        sampler.sample(p1);
        if (line.previous && p1.distanceTo(line.previous) < 0.08) {
            line.coordinates.push(p1.x, p1.y, p1.z);
            line.previous = p1.clone();

            for (let i = 0; i < 2; i++) {
                const spark = new Sparkle();
                spark.setup(p1, line.material.color);
                sparkles.push(spark);
            }
            ok = true;
        } else if (!line.previous) {
            line.previous = p1.clone();
        }
        safe++;
    }
}

function updateSparklesGeometry() {
    const tempSparklesArraySizes = [];
    const tempSparklesArrayColors = [];
    sparkles.forEach((s) => {
        tempSparklesArraySizes.push(s.size);
        tempSparklesArrayColors.push(s.color.r, s.color.g, s.color.b);
    });
    sparklesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(tempSparklesArrayColors, 3));
    sparklesGeometry.setAttribute('size', new THREE.Float32BufferAttribute(tempSparklesArraySizes, 1));
}

class Sparkle extends THREE.Vector3 {
    setup(origin, color) {
        this.copy(origin);
        this.v = new THREE.Vector3();
        this.v.x = THREE.MathUtils.randFloat(0.001, 0.006) * (Math.random() > 0.5 ? 1 : -1);
        this.v.y = THREE.MathUtils.randFloat(0.001, 0.006) * (Math.random() > 0.5 ? 1 : -1);
        this.v.z = THREE.MathUtils.randFloat(0.001, 0.006) * (Math.random() > 0.5 ? 1 : -1);

        this.size = Math.random() * 4 + 0.5 * sizes.pixelRatio;
        this.slowDown = 0.4 + Math.random() * 0.58;
        this.color = color;
    }
    update() {
        if (this.v.length() > 0.001) {
            this.add(this.v);
            this.v.multiplyScalar(this.slowDown);
        }
    }
}

class Star {
    setup(color) {
        this.r = Math.random() * 3 + 1;
        this.phi = Math.random() * Math.PI * 2;
        this.theta = Math.random() * Math.PI;
        this.v = new THREE.Vector2().random().subScalar(0.5).multiplyScalar(0.0007);

        this.x = this.r * Math.sin(this.phi) * Math.sin(this.theta);
        this.y = this.r * Math.cos(this.phi);
        this.z = this.r * Math.sin(this.phi) * Math.cos(this.theta);

        this.size = Math.random() * 1.5 + 0.5 * sizes.pixelRatio;
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

for (let i = 0; i < 1500; i++) {
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

    galaxyPoints.rotation.y += 0.0005;

    if (a - _prev > 30) {
        lines.forEach((l) => {
            if (sparkles.length < 35000) {
                nextDot(l);
                nextDot(l);
                nextDot(l);
                nextDot(l);
                nextDot(l);
                nextDot(l);
            }

            const tempVertices = new Float32Array(l.coordinates);
            l.geometry.setAttribute('position', new THREE.BufferAttribute(tempVertices, 3));
            l.geometry.computeBoundingSphere();
        });
        updateSparklesGeometry();
        _prev = a;
    }

    const tempSparklesArray = [];
    sparkles.forEach((s) => {
        s.update();
        tempSparklesArray.push(s.x, s.y, s.z);
    });
    sparklesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tempSparklesArray, 3));

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

// GSAP Animations
function introAnimation() {
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

function setupScrollAnimation() {
    document.body.style.overflowY = "scroll";

    const tl = gsap.timeline({ default: { ease: 'none' } });

    tl.to(position, {
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

let needsUpdate = true;
function onUpdate() {
    needsUpdate = true;
}

viewer.addEventListener('preFrame', () => {
    if (needsUpdate) {
        camera.positionUpdated(false);
        camera.targetUpdated(true);
        needsUpdate = false;
    }
});

document.querySelector('.button-scroll')?.addEventListener('click', () => {
    const element = document.querySelector('.cam-view-2');
    window.scrollTo({ top: element?.getBoundingClientRect().top, left: 0, behavior: 'smooth' });
});

document.querySelector('.forever')?.addEventListener('click', () => {
    const element = document.querySelector('.cam-view-2');
    window.scrollTo({ top: element?.getBoundingClientRect().top, left: 0, behavior: 'smooth' });
});

document.querySelector('.hero--scroller')?.addEventListener('click', () => {
    const element = document.querySelector('.cam-view-2');
    window.scrollTo({ top: element?.getBoundingClientRect().top, left: 0, behavior: 'smooth' });
});

document.querySelector('.btn-customize')?.addEventListener('click', () => {
    exploreView.style.pointerEvents = "none";
    canvasView.style.pointerEvents = "all";
    canvasContainer.style.zIndex = "1";
    document.body.style.overflowY = "hidden";
    document.body.style.cursor = "grab";
    sidebar.style.display = "none";
    footerContainer.style.display = "flex";
    configAnimation();

    if (!musicPlay) {
        audio.play();
        audio.volume = 0.1;
        audio.loop = true;
        musicPlay = true;
    }
});

const tlExplore = gsap.timeline();

function configAnimation() {
    lenis.stop();

    tlExplore.to(position, { x: -0.17, y: -0.25, z: 8.5, duration: 2.5, onUpdate })
        .to(target, { x: 0, y: 0, z: 0, duration: 2.5, onUpdate }, '-=2.5')
        .to(ring.rotation, { x: (ringModel == 1) ? -Math.PI / 2 : 0, y: 0, z: (ringModel == 1) ? -Math.PI / 2 : 0, duration: 2.5 }, '-=2.5')
        .to('.emotions--content', { opacity: 0, x: '130%', duration: 1.5, ease: "power4.out", onComplete: onCompleteConfigAnimation }, '-=2.5')
        .fromTo('.footer--menu', { opacity: 0, y: '150%' }, { opacity: 1, y: '0%', duration: 1.5 });
}

let colorLerpValue = { x: 0 };
let colorLerpValue2 = { x: 0 };

function onCompleteConfigAnimation() {
    exitContainer.style.display = "flex";
    if (camera.controls) {
        camera.controls.enabled = true;
        camera.controls.autoRotate = true;
        camera.controls.minDistance = 5;
        camera.controls.maxDistance = 13;
        camera.controls.enablePan = false;
        camera.controls.screenSpacePanning = false;
    }
}

document.querySelector('.button--exit')?.addEventListener('click', () => {
    exploreView.style.pointerEvents = "all";
    canvasView.style.pointerEvents = "none";
    canvasContainer.style.zIndex = "unset";
    document.body.style.overflowY = "auto";
    exitContainer.style.display = "none";
    document.body.style.cursor = "auto";
    sidebar.style.display = "block";
    footerContainer.style.display = "none";
    exitConfigAnimation();
});

const tlExit = gsap.timeline();

function exitConfigAnimation() {
    if (camera.controls) {
        camera.controls.enabled = true;
        camera.controls.autoRotate = false;
        camera.controls.minDistance = 0;
        camera.controls.maxDistance = Infinity;
    }

    lenis.start();

    gemMenu.classList.remove('show');
    materialsMenu.classList.remove('show');
    if (document.querySelector('.footer--menu li.active')) {
        document.querySelector('.footer--menu li.active')?.classList.remove('active');
    }

    tlExit.to(position, { x: -0.06, y: -1.15, z: 4.42, duration: 1.2, ease: "power4.out", onUpdate })
        .to(target, { x: -0.01, y: 0.9, z: 0.07, duration: 1.2, ease: "power4.out" }, '-=1.2')
        .to(ring.rotation, { x: (ringModel == 1) ? 0 : 0.92, y: (ringModel == 1) ? 0 : 0.92, z: (ringModel == 1) ? -Math.PI / 2 : Math.PI / 3 }, '-=1.2')
        .to('.footer--menu', { opacity: 0, y: '150%' }, '-=1.2')
        .to('.emotions--content', { opacity: 1, x: '0%', duration: 0.5, ease: "power4.out" }, '-=1.2');
}

introAnimation();
