import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 20, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const control = new OrbitControls(camera, renderer.domElement);
control.enableDamping = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

////////////////////////////////////////////////////////////

const pitchWidth = 50;
const pitchLength = 80;

// GRASS: draw a grass texture on a canvas (mowing stripes + thousands of tiny blades)
function createGrassTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // two mowing stripes: light green on top half, darker green on bottom half
  ctx.fillStyle = '#2e8b57';
  ctx.fillRect(0, 0, size, size / 2);
  ctx.fillStyle = '#26784a';
  ctx.fillRect(0, size / 2, size, size / 2);

  // tiny "blades" of grass in random shades of green
  for (let i = 0; i < 40000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const g = 100 + Math.random() * 80;
    ctx.fillStyle = `rgba(${Math.floor(g * 0.3)}, ${Math.floor(g)}, ${Math.floor(g * 0.4)}, 0.35)`;
    ctx.fillRect(x, y, 1, 2 + Math.random() * 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 5); // 5 repeats along the length = 10 stripes
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const footballPitch = new THREE.Mesh(
  new THREE.PlaneGeometry(pitchWidth, pitchLength),
  new THREE.MeshStandardMaterial({ map: createGrassTexture(), color: 'white', roughness: 0.9 })
);
footballPitch.rotation.x = -Math.PI / 2;
footballPitch.receiveShadow = true;
scene.add(footballPitch);

///////////////////////////////////////////////////////////
const linesMaterial = new THREE.MeshStandardMaterial({ color: 'white' });

function addLine(width, length, x, z) {
  const line = new THREE.Mesh(new THREE.PlaneGeometry(width, length), linesMaterial);
  line.rotation.x = -Math.PI / 2;
  line.position.set(x, 0.1, z);
  line.receiveShadow = true;
  scene.add(line);
  return line;
}


addLine(50, 1, 0, 0);

addLine(30, 1, 0, 28);
addLine(30, 1, 0, -28);

addLine(1, 12, 14.5, 34);
addLine(1, 12, -14.5, 34);
addLine(1, 12, 14.5, -34);
addLine(1, 12, -14.5, -34);

const centreCircle = new THREE.Mesh(new THREE.RingGeometry(9.5, 10.5, 100), linesMaterial);
centreCircle.rotation.x = -Math.PI / 2;
centreCircle.position.set(0, 0.1, 0);
scene.add(centreCircle);

///////////////////////////////////////////////////////////

const postRadius = 0.25;
const postHeight = 3;
const goalWidth = 8;

const goalMaterial = new THREE.MeshStandardMaterial({
  color: 'white',
  roughness: 0.2,
  metalness: 0.1
});

function createGoal(z) {
  const goal = new THREE.Group();

  const postGeometry = new THREE.CylinderGeometry(postRadius, postRadius, postHeight);


  const leftPost = new THREE.Mesh(postGeometry, goalMaterial);
  leftPost.position.set(-goalWidth / 2, postHeight / 2, 0);
  leftPost.castShadow = true;
  goal.add(leftPost);

  const rightPost = new THREE.Mesh(postGeometry, goalMaterial);
  rightPost.position.set(goalWidth / 2, postHeight / 2, 0);
  rightPost.castShadow = true;
  goal.add(rightPost);

  const crossbar = new THREE.Mesh(
    new THREE.CylinderGeometry(postRadius, postRadius, goalWidth + postRadius * 2),
    goalMaterial
  );
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, postHeight, 0);
  crossbar.castShadow = true;
  goal.add(crossbar);

  goal.position.set(0, 0, z);
  scene.add(goal);
  return goal;
}


createGoal(pitchLength / 2);
createGoal(-pitchLength / 2);

////////////////////////////////////////////////////////////

// NET: a box behind each goal, covered with a see-through "mesh" texture
const netDepth = 1.5;
const holeSize = 0.25; // size of one net hole in world units

// draws ONE net square (lines on the top and left edge, transparent inside).
// Repeating it many times makes the whole net grid.
function createNetMaterial(faceWidth, faceHeight) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, size);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(faceWidth / holeSize, faceHeight / holeSize);

  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide, // see the net from inside and outside
    depthWrite: false
  });
}

const invisible = new THREE.MeshBasicMaterial({ visible: false });

function createNet(z, direction) {
  const sideMaterial = createNetMaterial(netDepth, postHeight);
  const topMaterial = createNetMaterial(goalWidth, netDepth);
  const backMaterial = createNetMaterial(goalWidth, postHeight);

  const materials = [
    sideMaterial, 
    sideMaterial,
    topMaterial,
    invisible,
    direction === 1 ? backMaterial : invisible,
    direction === 1 ? invisible : backMaterial  
  ];

  const net = new THREE.Mesh(new THREE.BoxGeometry(goalWidth, postHeight, netDepth), materials);
  net.position.set(0, postHeight / 2, z + direction * netDepth / 2);
  scene.add(net);
  return net;
}

createNet(pitchLength / 2, 1);
createNet(-pitchLength / 2, -1);

////////////////////////////////////////////////////////////

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {
  requestAnimationFrame(animate);
  control.update();
  renderer.render(scene, camera);
}

animate();