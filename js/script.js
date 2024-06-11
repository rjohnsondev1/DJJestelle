import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
//import GUI from 'lil-gui'
import gsap from 'gsap'
import particlesVertexShader from '../shaders/particles/vertex.glsl'
import particlesFragmentShader from '../shaders/particles/fragment.glsl'

import particlesVertexShader2 from '../shaders/particles/vertex2.glsl'
/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    if(particles)
        particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
   
  bloomPass.setSize(sizes.width, sizes.height);

})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 8 * 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

debugObject.clearColor = '#160920'
gui.addColor(debugObject, 'clearColor').onChange(() => { renderer.setClearColor(debugObject.clearColor) })
renderer.setClearColor(debugObject.clearColor)

/**
 * Particles
 */
let particles = null


gltfLoader.load('../models/3dlogo4.glb', (gltf) =>
{
    console.log(gltf)
    particles = {}
    particles.index = 0

   // Transformations
   const scale = new THREE.Vector3(2, 2, 2) // Scale the model down to half its size
   const offset = new THREE.Vector3(9, 5, 0) // Move the model down by 1 unit


    // Positions
    const positions = gltf.scene.children.map(child => child.geometry.attributes.position)

    particles.maxCount = 0
    for(const position of positions)
    {
        if(position.count > particles.maxCount)
            particles.maxCount = position.count
    }

    particles.positions = []
    for(const position of positions)
    {
        const originalArray = position.array
        const newArray = new Float32Array(particles.maxCount * 3)

        for(let i = 0; i < particles.maxCount; i++)
        {
            const i3 = i * 3

            if(i3 < originalArray.length)
            {
                newArray[i3 + 0] = originalArray[i3 + 0]
                newArray[i3 + 1] = originalArray[i3 + 1]
                newArray[i3 + 2] = originalArray[i3 + 2]
            }
            else
            {
                const randomIndex = Math.floor(position.count * Math.random()) * 3
                newArray[i3 + 0] = originalArray[randomIndex + 0]
                newArray[i3 + 1] = originalArray[randomIndex + 1]
                newArray[i3 + 2] = originalArray[randomIndex + 2]
            }
        }

        particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3))
    }
    
    // Geometry
    const sizesArray = new Float32Array(particles.maxCount)

    for(let i = 0; i < particles.maxCount; i++)
	    sizesArray[i] = Math.random()

    particles.geometry = new THREE.BufferGeometry()
    particles.geometry.setAttribute('position', particles.positions[particles.index])
    particles.geometry.setAttribute('aPositionTarget', particles.positions[0])
    particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))


    // Material
    particles.colorA = '#17c1c4'
    particles.colorB = '#8c00ff'

    particles.material = new THREE.ShaderMaterial({
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms:
        {
            uSize: new THREE.Uniform(0.4),
            uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
            uProgress: new THREE.Uniform(0),
            uColorA: new THREE.Uniform(new THREE.Color(particles.colorA)),
            uColorB: new THREE.Uniform(new THREE.Color(particles.colorB)),
            uScale: new THREE.Uniform(scale),
            uOffset: new THREE.Uniform(offset)
        },
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })

    // Points
    particles.points = new THREE.Points(particles.geometry, particles.material)
    particles.points.frustumCulled = false
    scene.add(particles.points)

    // Methods
    particles.morph = (index) =>
    {
        // Update attributes
        particles.geometry.attributes.position = particles.positions[particles.index]
        particles.geometry.attributes.aPositionTarget = particles.positions[index]

        // Animate uProgress
        gsap.fromTo(
            particles.material.uniforms.uProgress,
            { value: 0 },
            { value: 1, duration: 3, ease: 'linear' }
        )

        // Save index
        particles.index = index
    }

    // Tweaks
    gui.addColor(particles, 'colorA').onChange(() => { particles.material.uniforms.uColorA.value.set(particles.colorA) })
    gui.addColor(particles, 'colorB').onChange(() => { particles.material.uniforms.uColorB.value.set(particles.colorB) })
    gui.add(particles.material.uniforms.uProgress, 'value').min(0).max(1).step(0.001).name('uProgress').listen()

    particles.morph0 = () => { particles.morph(0) }
    particles.morph1 = () => { particles.morph(1) }
    particles.morph2 = () => { particles.morph(2) }
    particles.morph3 = () => { particles.morph(3) }

    gui.add(particles, 'morph0')
    gui.add(particles, 'morph1')
    gui.add(particles, 'morph2')
    gui.add(particles, 'morph3')
})

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
const starsMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader2,
    fragmentShader: particlesFragmentShader,
    uniforms: {
        pointTexture: {
            value: new THREE.TextureLoader().load('../img/dotTexture.png'),
        },
    },
    blending: THREE.AdditiveBlending
})

const sparklesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader2,
    fragmentShader: particlesFragmentShader,
    uniforms: {
        pointTexture: {
            value: new THREE.TextureLoader().load('./img/dotTexture.png'),
        },
    },
    blending: THREE.AdditiveBlending,
    alphaTest: 1.0,
    transparent: true,
});
//const points = new THREE.Points(sparklesGeometry, sparklesMaterial);
//group.add(points);


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
  
  for (let i = 0; i < 3000; i++) {
    const star = new Star();
    star.setup(galaxyColors[Math.floor(Math.random() * galaxyColors.length)]);
    galaxyGeometryVertices.push(star.x, star.y, star.z);
    galaxyGeometryColors.push(star.color.r, star.color.g, star.color.b);
    galaxyGeometrySizes.push(star.size);
    stars.push(star);
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute());
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
  //console.log(galaxyPoints)
  
  }

  window.addEventListener('mousemove', onMouseMove)
function onMouseMove(e) {
    const x = THREE.MathUtils.mapLinear(e.clientY, 0, sizes.width, -0.3, 0.3)
    const y = THREE.MathUtils.mapLinear(e.clientX, 0, sizes.height, 0.3, -0.3)
    gsap.to(group.rotation, {
        y: y,
        x: x,
        duration: 1.5,
        ease: 'power1.inOut',
    })
}
render()
/**
 * Animate
 */
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
