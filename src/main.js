
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
 
function createGrassTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
 
  ctx.fillStyle = '#2e8b57';
  ctx.fillRect(0, 0, size, size / 2);
  ctx.fillStyle = '#26784a';
  ctx.fillRect(0, size / 2, size, size / 2);
 
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
  texture.repeat.set(4, 5);
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
 
const netDepth = 1.5;
const holeSize = 0.25;
 
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
    side: THREE.DoubleSide,
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
 
const ballRadius = 1
 
function createBallTexture() {
  const width = 1024
  const height = 512
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(width, height)
 
  const phi = (1 + Math.sqrt(5)) / 2
  const pentagonCentres = []
  for (const a of [-1, 1]) {
    for (const b of [-phi, phi]) {
      pentagonCentres.push(new THREE.Vector3(0, a, b).normalize())
      pentagonCentres.push(new THREE.Vector3(a, b, 0).normalize())
      pentagonCentres.push(new THREE.Vector3(b, 0, a).normalize())
    }
  }
 
  const hexagonCentres = []
  const neighbours = 0.44
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      for (let k = j + 1; k < 12; k++) {
        const A = pentagonCentres[i], B = pentagonCentres[j], C = pentagonCentres[k]
        if (A.dot(B) > neighbours && A.dot(C) > neighbours && B.dot(C) > neighbours) {
          hexagonCentres.push(A.clone().add(B).add(C).normalize())
        }
      }
    }
  }
 
  const point = new THREE.Vector3()
  for (let py = 0; py < height; py++) {
    const theta = (py / height) * Math.PI
    for (let px = 0; px < width; px++) {
      const angle = (px / width) * Math.PI * 2
      point.set(
        -Math.cos(angle) * Math.sin(theta),
        Math.cos(theta),
        Math.sin(angle) * Math.sin(theta)
      )
 
      let best = -Infinity
      let second = -Infinity
      let bestIsPentagon = false
      for (const c of pentagonCentres) {
        const score = point.dot(c) / 1.0265
        if (score > best) { second = best; best = score; bestIsPentagon = true }
        else if (score > second) { second = score }
      }
      for (const c of hexagonCentres) {
        const score = point.dot(c)
        if (score > best) { second = best; best = score; bestIsPentagon = false }
        else if (score > second) { second = score }
      }
 
      let shade
      if (best - second < 0.008) shade = 70
      else if (bestIsPentagon) shade = 20
      else shade = 245
 
      const i = (py * width + px) * 4
      image.data[i] = shade
      image.data[i + 1] = shade
      image.data[i + 2] = shade
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
 
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
 
const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32)
const ballMaterial = new THREE.MeshBasicMaterial({
  map: createBallTexture(),
  color: 'white'
})
const ball = new THREE.Mesh(ballGeometry, ballMaterial)
ball.position.set(0, 1, 0)
scene.add(ball)
 
///////////////////////////////////////////////////////////////
 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
 
////////////////////////////////////////////////////////////////
 
let kicked = false
window.addEventListener('keydown', (e) => {
  if(!kicked){
    if(e.code == 'KeyW'){
      ball.position.z -= 0.5
    }
    if(e.code == 'KeyS'){
      ball.position.z += 0.5
    }
    if(e.code == 'KeyA'){
      ball.position.x -= 0.5
    }
    if(e.code == 'KeyD'){
      ball.position.x += 0.5
    }
  }
  if(e.code == 'Space'){
    kicked = true
  }
  if(e.code == 'KeyR'){
    kicked = false
  }
})
 
///////////////////////////////////////////////////////////////
 
function keepBallOnPitch() {
  const maxX = pitchWidth / 2 - ballRadius
  const maxZ = pitchLength / 2 - ballRadius
  ball.position.x = Math.max(-maxX, Math.min(maxX, ball.position.x))
  ball.position.z = Math.max(-maxZ, Math.min(maxZ, ball.position.z))
}
 
///////////////////////////////////////////////////////////////
 
function animate() {
  requestAnimationFrame(animate);
  keepBallOnPitch();
  control.update();
  renderer.render(scene, camera);
}
 
animate();
