// Pure 2D CSS space background — starfield, meteor shower, a black hole with a
// rotating accretion ring, and drifting planets. No WebGL / three.js.

// Deterministic spread of meteors (no Math.random — keeps SSR stable).
const meteors = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 67) % 100}%`,
  top: `${-(i % 5) * 6}%`,
  delay: `${(i * 0.9) % 8}s`,
  duration: `${4 + ((i * 1.3) % 5)}s`,
}));

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10 space-bg overflow-hidden">
      {/* layered twinkling starfields (parallax drift) */}
      <div className="stars stars--sm" />
      <div className="stars stars--md" />
      <div className="stars stars--lg" />

      {/* nebula blobs */}
      <div className="nebula nebula--violet" />
      <div className="nebula nebula--cyan" />

      {/* continuous meteor shower / falling stars */}
      <div className="meteors">
        {meteors.map((m, i) => (
          <span
            key={i}
            className="meteor"
            style={{
              left: m.left,
              top: m.top,
              animationDelay: m.delay,
              animationDuration: m.duration,
            }}
          />
        ))}
      </div>

      {/* occasional bright shooting stars */}
      <div className="shooting-star shooting-star--1" />
      <div className="shooting-star shooting-star--2" />
      <div className="shooting-star shooting-star--3" />

      {/* black hole */}
      <div className="blackhole-wrap">
        <div className="accretion" />
        <div className="accretion accretion--2" />
        <div className="event-horizon" />
      </div>

      {/* drifting planets */}
      <div className="planet planet--blue" />
      <div className="planet planet--violet" />
      <div className="planet planet--pale" />

      {/* readability vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-space-black/30 via-transparent to-space-black/85" />
    </div>
  );
}
