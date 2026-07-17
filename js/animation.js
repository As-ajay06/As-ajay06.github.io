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
  const dayGroup = new THREE.Group();
  scene.add(nightGroup);
  scene.add(dayGroup);

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

  // ==========================================
  // DAY MODE: ANIME CLOUDS
  // ==========================================
  function createCloudTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 256;
    cvs.height = 256;
    const ctx = cvs.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(cvs);
  }

  const cloudTexture = createCloudTexture();
  const cloudCount = 60;
  const cloudGeo = new THREE.BufferGeometry();
  const cloudPos = new Float32Array(cloudCount * 3);
  const cloudColors = new Float32Array(cloudCount * 3);
  const cloudSpeeds = new Float32Array(cloudCount);

  const whiteColor = new THREE.Color(0xffffff);
  const shadowColor = new THREE.Color(0xa78bfa); // Anime-style purple/blue shadow

  for (let i = 0; i < cloudCount; i++) {
    cloudPos[i * 3] = (Math.random() - 0.5) * 600; // X
    cloudPos[i * 3 + 1] = Math.random() * 150 - 20;  // Y
    cloudPos[i * 3 + 2] = (Math.random() - 0.5) * 300 - 100; // Z

    // Tint lower clouds with more shadow
    const heightFactor = (cloudPos[i * 3 + 1] + 20) / 150;
    const mixColor = shadowColor.clone().lerp(whiteColor, Math.max(0, Math.min(1, heightFactor)));

    cloudColors[i * 3] = mixColor.r;
    cloudColors[i * 3 + 1] = mixColor.g;
    cloudColors[i * 3 + 2] = mixColor.b;

    cloudSpeeds[i] = 0.02 + Math.random() * 0.03;
  }

  cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
  cloudGeo.setAttribute('color', new THREE.BufferAttribute(cloudColors, 3));

  const cloudMaterial = new THREE.PointsMaterial({
    size: 150,
    map: cloudTexture,
    transparent: true,
    opacity: 0.9,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.NormalBlending
  });

  const cloudMesh = new THREE.Points(cloudGeo, cloudMaterial);
  dayGroup.add(cloudMesh);

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

    // Update Anime Clouds (Day Mode)
    if (dayGroup.visible) {
      const cPositions = cloudGeo.attributes.position.array;
      for (let i = 0; i < cloudCount; i++) {
        // Move clouds to the right + subtle wind
        cPositions[i * 3] += cloudSpeeds[i] + (wind * 0.1);
        if (cPositions[i * 3] > 300) {
          cPositions[i * 3] = -300; // Reset to left
        }
      }
      cloudGeo.attributes.position.needsUpdate = true;
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

  // Theme Switching Logic
  const applyTheme = (theme) => {
    const video = document.getElementById('light-mode-video');
    if (theme === 'dark') {
      const video = document.getElementById('dark-mode-video');
      scene.fog.color.setHex(0x18181b);
      nightGroup.visible = true;
      dayGroup.visible = false;
      if (video) video.pause();
    } else {
      // Hide WebGL clouds since the video is the background
      scene.fog.color.setHex(0xe0f2fe);
      nightGroup.visible = false;
      dayGroup.visible = false;
      if (video) video.play().catch(e => console.log('Video autoplay prevented'));
    }
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        applyTheme(currentTheme);
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(initialTheme);
});
