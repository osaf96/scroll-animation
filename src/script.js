import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from "gsap"
import * as  Curves from "three/examples/jsm/curves/CurveExtras.js";


gsap.registerPlugin(ScrollTrigger);

let camera, scene, renderer;

const images = [

];

/**
 * Loader
 */
const textureLoader = new THREE.TextureLoader();

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

/**
 * Camera
 */
camera = new THREE.PerspectiveCamera(
    70,
    sizes.width / sizes.height,
    0.01,
    10000
);
camera.position.set(0, 0, 50);

/**
 * Scene
 */
scene = new THREE.Scene();
scene.background = new THREE.Color("#000");

parent = new THREE.Object3D();
scene.add(parent);

/**
 * Tube
 */

const splines = {
    GrannyKnot: new Curves.GrannyKnot(),
    VivianiCurve: new Curves.VivianiCurve(100),
    KnotCurve: new Curves.KnotCurve(),
    TrefoilKnot: new Curves.TrefoilKnot(),
    TorusKnot: new Curves.TorusKnot(20),
    CinquefoilKnot: new Curves.CinquefoilKnot(20)
};

var params = {
    splines: splines.GrannyKnot,
    tubularSegments: 50,
    radius: 4,
    radiusSegments: 6
};

const tubeGeometry = new THREE.TubeGeometry(
    params.splines,
    params.tubularSegments,
    params.radius,
    params.radiusSegments,
    true //closed
);
const tubeMaterial = new THREE.MeshBasicMaterial({
    color: '#FFF',
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
parent.add(tube);

const tubeCamera = new THREE.PerspectiveCamera(
    84,
    sizes.width / sizes.height,
    0.01,
    1000
);
parent.add(tubeCamera);

const scrollPosition = (scrollAmount) => {
    const pos = tube.geometry.parameters.path.getPointAt(scrollAmount);
    const pos2 = tube.geometry.parameters.path.getPointAt(scrollAmount + 0.001);
    tubeCamera.position.copy(pos);
    tubeCamera.lookAt(pos2);
};
scrollPosition(0);

/**
 * Camera Helper
 */
const cameraHelper = new THREE.CameraHelper(tubeCamera);
// scene.add(cameraHelper)

/**
 * Mesh
 */
//place image in the tube
const materials = [];
const num = images.length;

const geometry = new THREE.PlaneBufferGeometry(4, 4, 1, 1);

for (let i = 0; i < num; i++) {
    const imageTexture = textureLoader.load(images[i]);

    const material = new THREE.MeshBasicMaterial({
        map: imageTexture,
        side: THREE.DoubleSide
    });
    materials.push(material);

    //get positions in the tube
    const point = (1 / num) * i;
    const mesh = new THREE.Mesh(geometry, material);

    const pos = tube.geometry.parameters.path.getPointAt(point);
    const pos2 = tube.geometry.parameters.path.getPointAt(point + 0.01);
    mesh.position.copy(pos);
    mesh.lookAt(pos2);

    scene.add(mesh);
}

/**
 * Scroll
 */
// make infinity scroll

const scrollTotal = 10000;
let iteration = 0;
const scrollTrigger = ScrollTrigger.create({
    start: 0,
    end: `+=${ scrollTotal }`,
    horizontal: false,
    pin: ".scroll",
    onUpdate: (self) => {
        const SCROLL = self.scroll();
        if (SCROLL > self.end - 1) {
            // Go forwards in time
            wrap(1, 1);
        } else if (SCROLL < 1 && self.direction < 0) {
            // Go backwards in time
            wrap(-1, self.end - 1);
        }
    }
});

const wrap = (iterationDelta, scrollTo) => {
    iteration += iterationDelta;
    scrollTrigger.scroll(scrollTo);
    scrollTrigger.update();
};

window.addEventListener("scroll", (e) => {
    var scroll_y = window.scrollY / scrollTotal;
    scrollPosition(scroll_y);
    // console.log(scroll_y)
});

/**
 * Renderer
 */
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

/**
 * Resize
 */
window.addEventListener("resize", () => {
    //update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //update camera
    tubeCamera.aspect = sizes.width / sizes.height;
    tubeCamera.updateProjectionMatrix();

    //update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const animate = () => {
    const elapsedTime = clock.getElapsedTime();

    //camera
    renderer.render(scene, tubeCamera);
    // renderer.render(scene, camera) //for debug

    window.requestAnimationFrame(animate);
};

animate();