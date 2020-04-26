/* eslint-disable no-param-reassign */
const covidSimulator = (canvas, resetButton, toggleButton, counter) => {
  let animationFrameId;

  let quarantineStarted = false;

  let screenWidth;
  let screenHeight;
  let context;

  let particles = [];
  const QUANTITY = 100;
  const PARTICLE_SIZE = 10;
  const SPEED = 1;

  const COLOR = {
    BACKGROUND: '#c4e5ec',
    INFECTED: '#f7767a',
    HEALTHY: '#79bbcb'
  };

  const TRANSLATION = {
    START_QUARANTINE: 'Start quarantine',
    STOP_QUARANTINE: 'Stop quarantine'
  };

  const getRandomDirection = (speed) => {
    const deg = Math.floor(Math.random() * 360);
    const r = (deg * 180) / Math.PI;

    return {
      x: Math.sin(r) * speed,
      y: Math.cos(r) * speed
    };
  };

  const createParticles = () => {
    // Reset particles
    particles = [];

    // Pick the first infected index
    const firstInfected = Math.floor(Math.random() * QUANTITY);

    // Create particle
    for (let i = 0; i < QUANTITY; i++) {
      const direction = getRandomDirection(SPEED);

      const particle = {
        index: i,
        size: PARTICLE_SIZE,
        speed: SPEED,
        position: {
          x: PARTICLE_SIZE / 2 + Math.random() * (window.innerWidth - PARTICLE_SIZE / 2),
          y: PARTICLE_SIZE / 2 + Math.random() * (window.innerHeight - PARTICLE_SIZE / 2)
        },
        direction: direction,
        infected: i === firstInfected
      };

      particles.push(particle);
    }
  };

  const clearCanvas = () => {
    if (context) {
      context.fillStyle = COLOR.BACKGROUND;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
  };

  const updateCounter = (numberOfInfected) => {
    counter.innerHTML = `${numberOfInfected} / ${particles.length}`;
  };

  const loop = () => {
    clearCanvas();

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const lastPosition = { x: particle.position.x, y: particle.position.y };

      // Detect collision of boundaries
      const collidedLeftBoundary = particle.position.x <= particle.size / 2;
      const collidedRightBoundary = particle.position.x >= screenWidth - PARTICLE_SIZE / 2;
      const collidedTopBoundary = particle.position.y <= particle.size / 2;
      const collidedBottomBoundary = particle.position.y >= screenHeight - PARTICLE_SIZE / 2;

      if (collidedLeftBoundary || collidedRightBoundary) {
        particle.direction.x *= -1;
      }

      if (collidedTopBoundary || collidedBottomBoundary) {
        particle.direction.y *= -1;
      }

      // Detect collision of particles
      for (let j = 0; j < particles.length; j++) {
        const bounceParticle = particles[j];

        if (bounceParticle.index !== particle.index) {
          const xDistance = Math.abs(bounceParticle.position.x - particle.position.x);
          const yDistance = Math.abs(bounceParticle.position.y - particle.position.y);
          const distance = Math.sqrt(xDistance ** 2 + yDistance ** 2);

          // collision happened
          if (distance < PARTICLE_SIZE) {
            particle.direction = getRandomDirection(particle.speed);
            bounceParticle.direction = getRandomDirection(bounceParticle.speed);

            if (particle.infected || bounceParticle.infected) {
              particle.infected = true;
              bounceParticle.infected = true;
            }
          }
        }
      }

      particle.position.x -= particle.direction.x;
      particle.position.y -= particle.direction.y;

      // Draw particle
      context.beginPath();
      context.fillStyle = particle.infected ? COLOR.INFECTED : COLOR.HEALTHY;
      context.lineWidth = particle.size;
      context.moveTo(lastPosition.x, lastPosition.y);
      context.arc(
        particle.position.x,
        particle.position.y,
        particle.size / 2, 0,
        Math.PI * 2, true
      );
      context.closePath();
      context.fill();

      // Update counter
      const numberOfInfected = particles.filter((p) => p.infected).length;
      updateCounter(numberOfInfected);
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  const resize = () => {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    canvas.width = screenWidth;
    canvas.height = screenHeight;
  };

  const pause = () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
  };

  const stopQuarantine = () => {
    toggleButton.innerHTML = TRANSLATION.START_QUARANTINE;
    loop();
    return false;
  };

  const startQuarantine = () => {
    toggleButton.innerHTML = TRANSLATION.STOP_QUARANTINE;
    pause();
    return true;
  };

  const toggleAnimation = () => {
    quarantineStarted = quarantineStarted
      ? stopQuarantine()
      : startQuarantine();
  };

  const reset = () => {
    // Remove listeners
    window.removeEventListener('resize', resize);
    window.removeEventListener('beforeunload', pause);
    resetButton.removeEventListener('click', reset);
    toggleButton.removeEventListener('click', toggleAnimation);

    quarantineStarted = false;
    toggleButton.innerHTML = TRANSLATION.START_QUARANTINE;
    updateCounter(1);
    pause();
    clearCanvas();
    init(); // eslint-disable-line no-use-before-define
  };

  const init = () => {
    if (canvas && resetButton && toggleButton && counter) {
      context = canvas.getContext('2d');
      context.globalCompositeOperation = 'destination-over';

      // Bind listeners
      window.addEventListener('resize', resize, false);
      window.addEventListener('beforeunload', pause);
      resetButton.addEventListener('click', reset);
      toggleButton.addEventListener('click', toggleAnimation);

      resize();
      createParticles();
      loop();
    }
  };

  return {
    init
  };
};

export default covidSimulator;
