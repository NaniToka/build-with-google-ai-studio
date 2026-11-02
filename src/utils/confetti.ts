import confetti from 'canvas-confetti';

export function fireCreatorConfetti() {
  const count = 120;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#ff0033', '#ff3366', '#ff007f'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#ffbb00', '#ff9900', '#ff5500'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#00f0ff', '#7000ff', '#ff00aa'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#ffffff', '#f43f5e'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
