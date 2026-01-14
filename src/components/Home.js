import React, { useMemo, useState } from "react";

const TOPICS = [
  {
    key: "systems",
    title: "Systems & Architecture",
    desc: "Event-driven design, queues, contracts, reliability, and how complex backends stay truthful under pressure.",
  },
  {
    key: "info",
    title: "Information & Entropy",
    desc: "Compression, structure, and what it means for data (and decisions) to survive noise.",
  },
  {
    key: "dsp",
    title: "Signals & DSP",
    desc: "Signal vs noise, transforms, filters, and the math that shapes perception and systems.",
  },
  {
    key: "ai",
    title: "AI as a System",
    desc: "Not just models — feedback loops, evaluation, deployment reality, and what breaks at scale.",
  },
];

const Home = () => {
  const [topic, setTopic] = useState("systems");

  const activeTopic = useMemo(
    () => TOPICS.find((t) => t.key === topic) || TOPICS[0],
    [topic]
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 18px", lineHeight: 1.7 }}>
      {/* TOP BAR (kept clickable) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
        }}
      >
        <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>Oscy’s Lab Notes</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {/* Keep these clickable, but don’t require posts/pages yet */}
          <a
            href="#explore"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #bbb",
              textDecoration: "none",
              color: "inherit",
              fontWeight: 600,
            }}
          >
            Explore
          </a>

          <a
            href="#direction"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #bbb",
              textDecoration: "none",
              color: "inherit",
              fontWeight: 600,
            }}
          >
            Direction
          </a>

          <a
            href="#soon"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #222",
              background: "#222",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Coming Soon
          </a>
        </div>
      </div>

      {/* HERO */}
      <header style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 40, margin: 0 }}>A technical blog about systems and meaning</h1>

        <p style={{ fontSize: 18, marginTop: 10, maxWidth: 860 }}>
          I build software, but what I’m really tracking is how structure emerges in complexity —
          how systems stay reliable, how information holds up under noise, and how design choices
          shape what’s possible.
        </p>

        <p style={{ marginTop: 12, opacity: 0.9, maxWidth: 860 }}>
          This isn’t a portfolio. My personal site handles that. This is the place where I write
          down the real thinking: tradeoffs, models, failures, fixes, and the deeper theory behind
          the engineering.
        </p>
      </header>

      {/* TOPIC PICKER */}
      <section id="explore" style={{ marginBottom: 30 }}>
        <h2 style={{ marginBottom: 10 }}>What I’m exploring</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          {TOPICS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTopic(t.key)}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: topic === t.key ? "1px solid #222" : "1px solid #bbb",
                background: topic === t.key ? "#222" : "transparent",
                color: topic === t.key ? "white" : "inherit",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {t.title}
            </button>
          ))}
        </div>

        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 14,
            padding: 16,
            background: "#fafafa",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{activeTopic.title}</div>
          <div style={{ opacity: 0.92 }}>{activeTopic.desc}</div>

          <div style={{ marginTop: 12, opacity: 0.9 }}>
            <span style={{ fontWeight: 800 }}>Core idea:</span> tools change fast, but the patterns
            underneath them don’t. I’m writing for the patterns.
          </div>
        </div>
      </section>

      {/* DIRECTION (jobs + education without "About" link) */}
      <section id="direction" style={{ marginBottom: 30 }}>
        <h2 style={{ marginBottom: 10 }}>Direction</h2>

        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <p style={{ marginTop: 0 }}>
            I’m focused on backend and systems engineering — the layer where architecture choices,
            correctness, and reliability actually matter.
          </p>

          <ul style={{ margin: "10px 0 0 18px" }}>
            <li>
              <strong>Education:</strong> computer science background, continuing to deepen theory and
              real-world system design.
            </li>
            <li>
              <strong>What I’m looking for:</strong> backend / full-stack roles with strong backend
              ownership (APIs, data modeling, event-driven systems, reliability).
            </li>
            <li>
              <strong>What I’m building:</strong> projects that force real tradeoffs — not toy demos.
            </li>
          </ul>

          <p style={{ marginBottom: 0, marginTop: 12, opacity: 0.9 }}>
            If you’re reading this as an employer: the point isn’t the buzzwords — it’s how I reason
            about systems when complexity is real.
          </p>
        </div>
      </section>

      {/* COMING SOON (no posts required) */}
      <section id="soon" style={{ marginBottom: 10 }}>
        <h2 style={{ marginBottom: 10 }}>Coming soon</h2>

        <div
          style={{
            border: "1px dashed #bbb",
            borderRadius: 14,
            padding: 16,
            background: "#fcfcfc",
          }}
        >
          <p style={{ marginTop: 0 }}>
            I’m actively setting up the writing pipeline now. First posts will be about:
          </p>

          <ul style={{ margin: "10px 0 0 18px" }}>
            <li>How I design event-driven flows without losing correctness</li>
            <li>Data shape as a source of truth (and how it collapses)</li>
            <li>Entropy, complexity, and why systems rot over time</li>
            <li>AI integration as infrastructure, not hype</li>
          </ul>

          <p style={{ marginBottom: 0, marginTop: 12, opacity: 0.85 }}>
            If you’re early: you’re seeing the foundation before the structure grows.
          </p>
        </div>
      </section>

      <footer style={{ marginTop: 26, opacity: 0.75, fontSize: 13 }}>
        Minimal fluff. Honest tradeoffs. Depth over noise.
      </footer>
    </div>
  );
};

export default Home;
