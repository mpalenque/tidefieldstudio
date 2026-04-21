import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const canvas = document.querySelector("#scene");
const header = document.querySelector(".header");
const wordmark = document.querySelector(".wordmark");
const gsap = window.gsap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setClearColor(0xffffff, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 1.4, 8);

const ambientLight = new THREE.HemisphereLight(0xffffff, 0x8aa6d6, 1.1);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(4, 8, 6);
scene.add(keyLight);

const accentLight = new THREE.DirectionalLight(0x6fa8ff, 1.0);
accentLight.position.set(-5, 2, 4);
scene.add(accentLight);

const meshGroup = new THREE.Group();
scene.add(meshGroup);

const waveGeometry = new THREE.PlaneGeometry(34, 22, 44, 28);
const initialPositions = waveGeometry.attributes.position.array.slice();

const fillMaterial = new THREE.MeshStandardMaterial({
  color: 0x0a2a6b,
  emissive: 0x000814,
  roughness: 0.42,
  metalness: 0.18,
  flatShading: true,
  side: THREE.DoubleSide,
});

const waveFill = new THREE.Mesh(waveGeometry, fillMaterial);
waveFill.rotation.x = -1.16;
waveFill.position.set(0, -2.4, -2.6);
meshGroup.add(waveFill);

const wireMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
  transparent: true,
  opacity: 0.18,
});

const waveWire = new THREE.Mesh(waveGeometry, wireMaterial);
waveWire.rotation.copy(waveFill.rotation);
waveWire.position.copy(waveFill.position);
meshGroup.add(waveWire);

const pointer = { x: 0, y: 0 };

const updateWave = (geometry, source, time, amplitude) => {
  const positions = geometry.attributes.position.array;

  for (let index = 0; index < positions.length; index += 3) {
    const x = source[index];
    const y = source[index + 1];
    const primary = Math.sin(x * 0.92 + time * 1.45) * amplitude;
    const secondary = Math.cos(y * 1.35 - time * 1.15) * amplitude * 0.65;
    const diagonal = Math.sin((x + y) * 0.8 - time * 0.7) * amplitude * 0.5;

    positions[index + 2] = primary + secondary + diagonal;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
};

const resize = () => {
  const width = header.clientWidth;
  const height = header.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(width, height, false);
};

window.addEventListener("resize", resize);
window.addEventListener("load", resize);

header.addEventListener("pointermove", (event) => {
  const rect = header.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
});

header.addEventListener("pointerleave", () => {
  pointer.x = 0;
  pointer.y = 0;
});

if (gsap) {
  gsap.set(wordmark, { autoAlpha: 0, yPercent: 12 });
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .fromTo(camera.position, { z: 10, y: 2.2 }, { z: 8, y: 1.4, duration: 1.6 }, 0)
    .fromTo(meshGroup.rotation, { x: 0.16, z: -0.18 }, { x: 0, z: 0, duration: 1.4 }, 0.1)
    .to(wordmark, { autoAlpha: 1, yPercent: 0, duration: 1.0 }, 0.25)
    .fromTo(wireMaterial, { opacity: 0 }, { opacity: 0.18, duration: 1.1 }, 0.3);

  gsap.to(meshGroup.rotation, {
    z: 0.04,
    duration: 5.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

const clock = new THREE.Clock();

const render = () => {
  const elapsed = clock.getElapsedTime();

  updateWave(waveGeometry, initialPositions, elapsed, 0.34);

  camera.position.x += (pointer.x * 0.45 - camera.position.x) * 0.02;
  camera.position.y += (1.4 + pointer.y * -0.18 - camera.position.y) * 0.02;
  camera.lookAt(0, -1.0, -2.0);

  meshGroup.position.x += (pointer.x * 0.12 - meshGroup.position.x) * 0.02;
  meshGroup.position.y += (pointer.y * -0.08 - meshGroup.position.y) * 0.02;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

resize();
render();
