document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();

  // Fog
  scene.fog = new THREE.FogExp2(0x18181b, 0.002);

  // Camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 50;
  camera.position.y = 10;
  camera.rotation.x = 0.1;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- GROUPS ---
  const nightGroup = new THREE.Group();
  const nightGroup = new THREE.Group();
  scene.add(nightGroup);

  // ==========================================
  // NIGHT MODE: MONSOON RAIN
  // ==========================================
  const rainCount = 15000;
  const rainGeo = new THREE.BufferGeometry();
  const rainPosArray = new Float32Array(rainCount * 3);
  const rainVelArray = new Float32Array(rainCount);

  for (let i = 0; i < rainCount; i++) {
    rainPosArray[i * 3] = Math.random() * 400 - 200;
    rainPosArray[i * 3 + 1] = Math.random() * 500 - 250;
    rainPosArray[i * 3 + 2] = Math.random() * 400 - 200;
    rainVelArray[i] = 0;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPosArray, 3));
  rainGeo.setAttribute('velocity', new THREE.BufferAttribute(rainVelArray, 1));

  // Create realistic rain streak texture
  const rainCvs = document.createElement('canvas');
  rainCvs.width = 64;
  rainCvs.height = 64;
  const rainCtx = rainCvs.getContext('2d');
  const rainGrad = rainCtx.createLinearGradient(0, 0, 0, 64);
  rainGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  rainGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
  rainGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
  rainCtx.fillStyle = rainGrad;
  rainCtx.fillRect(31, 0, 2, 64); // 2px streak in the center
  const rainTexture = new THREE.CanvasTexture(rainCvs);

  const rainMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3.0,
    map: rainTexture,
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    blending: THREE.NormalBlending
  });
  const rainMesh = new THREE.Points(rainGeo, rainMaterial);
  nightGroup.add(rainMesh);

  // ==========================================
  // NIGHT MODE: SWIMMING FISH
  // ==========================================
  const fishGroup = new THREE.Group();

  // Fish body (Diamond/cone shape pointing towards +Z)
  const bodyGeo = new THREE.ConeGeometry(0.8, 3, 4);
  bodyGeo.rotateX(Math.PI / 2); // Point +Z
  bodyGeo.rotateZ(Math.PI / 4); // Diamond

  const fishMat = new THREE.MeshBasicMaterial({ color: 0x34d399 }); // Loki Green
  const fishBody = new THREE.Mesh(bodyGeo, fishMat);
  fishGroup.add(fishBody);

  // Fish tail
  const tailGeo = new THREE.ConeGeometry(0.6, 1.5, 3);
  tailGeo.rotateX(-Math.PI / 2); // Point -Z
  const fishTail = new THREE.Mesh(tailGeo, fishMat);
  fishTail.position.z = -1.8;
  fishGroup.add(fishTail);

  fishGroup.scale.set(0.6, 0.6, 0.6);
  nightGroup.add(fishGroup);

  const mouse = new THREE.Vector2();
  const mouseWorld = new THREE.Vector3();
  const targetPos = new THREE.Vector3();
  const dummyObject = new THREE.Object3D();
  const clock = new THREE.Clock();



  // Mouse interaction
  let mouseX = 0;
  const windowHalfX = window.innerWidth / 2;
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Animation Loop
  const tick = () => {
    const wind = mouseX * 0.0005;
    const elapsedTime = clock.getElapsedTime();

    // Update Rain (Night Mode)
    if (nightGroup.visible) {
      const positions = rainGeo.attributes.position.array;
      const velocities = rainGeo.attributes.velocity.array;
      for (let i = 0; i < rainCount; i++) {
        velocities[i] -= 0.01 + Math.random() * 0.01;
        if (velocities[i] < -1.5) velocities[i] = -1.5;
        positions[i * 3 + 1] += velocities[i];
        positions[i * 3] += wind;
        if (positions[i * 3 + 1] < -100) {
          positions[i * 3 + 1] = 200;
          velocities[i] = 0;
          positions[i * 3] = Math.random() * 400 - 200;
        }
      }
      rainGeo.attributes.position.needsUpdate = true;

      // Fish following mouse
      mouseWorld.set(mouse.x, mouse.y, 0.5);
      mouseWorld.unproject(camera);
      mouseWorld.sub(camera.position).normalize();

      const distance = (30 - camera.position.z) / mouseWorld.z;
      targetPos.copy(camera.position).add(mouseWorld.multiplyScalar(distance));

      // Tail wiggle
      fishTail.rotation.y = Math.sin(elapsedTime * 15) * 0.3;

      // Move and rotate smoothly
      fishGroup.position.lerp(targetPos, 0.05);
      dummyObject.position.copy(fishGroup.position);
      dummyObject.lookAt(targetPos);
      fishGroup.quaternion.slerp(dummyObject.quaternion, 0.1);
    }



    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  scene.fog.color.setHex(0x18181b);
});
