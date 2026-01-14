import React, { useMemo, useState } from "react";

/**
 * Home page goals:
 * - not a resume
 * - signal depth + systems thinking
 * - show visitors what to read first
 *
 * Replace the placeholder links when your routes exist.
 */

const TOPICS = [
  {
    key: "systems",
    title: "Systems & Architecture",
    desc: "Event-driven design, queues, contracts, reliability, and why systems fail in the real world.",
  },
  {
    key: "info",
    title: "Information & Entropy",
    desc: "Compression, structure, and how meaning survives noise — in data and in decisions.",
  },
  {
    key: "dsp",
    title: "Signals & DSP",
    desc: "Signal vs noise, transforms, filters, and the math that shapes perception.",
  },
  {
    key: "ai",
    title: "AI (as a system)",
    desc: "Not just models — deployment, evaluation, feedback loops, and product reality.",
  },
];

const FEATURED = [
  {
    title: "Start Here: How I Think About Building Systems",
    blurb:
      "A short map of the themes behind this blog: structure, constraints, and meaning inside complexity.",
    href: "/blog/start-here", // TODO: update when this post exists
    tag: "Start Here",
  },
  {
    title: "Event-Driven Inventory: From Webhooks to Truth",
    blurb:
      "How I model product relationships and keep state sane when events arrive out of order.",
    href: "/blog/event-driven-inventory", // TODO: update
    tag: "Architecture",
  },
  {
    title: "Entropy as a Design Tool",
    blurb:
      "A practical lens: what entropy means for APIs, data shape, and operational complexity.",
    href: "/blog/entropy-design-tool", // TODO: update
    tag: "Theory → Practice",
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
      {/* HERO */}
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 40, margin: 0 }}>Notes on Systems, Meaning, and Reality</h1>

        <p style={{ fontSize: 18, marginTop: 10, maxWidth: 820 }}>
          I build software — but I’m mostly obsessed with how <em>complex systems</em> behave:
          when signals get noisy, when assumptions leak, and when structure is the difference
          between chaos and clarity.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
          <a
            href="/blog"
            style={{
              padding: "10px 14px",
              border: "1px solid #222",
              borderRadius: 10,
              textDecoration: "none",
              color: "inherit",
              fontWeight: 600,
            }}
          >
            Browse Posts
          </a>

          <a
            href="/blog/start-here"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              color: "white",
              background: "#222",
              fontWeight: 600,
            }}
          >
            Start Here
          </a>

          <a
            href="/about"
            style={{
              padding: "10px 14px",
              border: "1px solid #999",
              borderRadius: 10,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            About (education + what I’m looking for)
          </a>
        </div>

        <p style={{ marginTop: 14, opacity: 0.85 }}>
          If you like posts that connect implementation to fundamentals — you’ll feel at home here.
        </p>
      </header>

      {/* TOPIC PICKER */}
      <section style={{ marginBottom: 30 }}>
        <h2 style={{ marginBottom: 10 }}>What I’m exploring right now</h2>

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
                fontWeight: 600,
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
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{activeTopic.title}</div>
          <div style={{ opacity: 0.9 }}>{activeTopic.desc}</div>

          <div style={{ marginTop: 12, opacity: 0.9 }}>
            <span style={{ fontWeight: 700 }}>Why this matters:</span>{" "}
            I’m not collecting facts — I’m building a mental model that transfers across domains.
          </div>
        </div>
      </section>

      {/* FEATURED POSTS */}
      <section style={{ marginBottom: 34 }}>
        <h2 style={{ marginBottom: 12 }}>Featured reads</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          {FEATURED.map((p) => (
            <a
              key={p.title}
              href={p.href}
              style={{
                display: "block",
                border: "1px solid #e0e0e0",
                borderRadius: 14,
                padding: 16,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 800 }}>{p.title}</div>
                <span
                  style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid #bbb",
                    opacity: 0.9,
                    whiteSpace: "nowrap",
                    height: "fit-content",
                  }}
                >
                  {p.tag}
                </span>
              </div>

              <div style={{ marginTop: 8, opacity: 0.9 }}>{p.blurb}</div>
            </a>
          ))}
        </div>
      </section>

      {/* JOB / DIRECTION */}
      <section
        style={{
          borderTop: "1px solid #eee",
          paddingTop: 20,
          marginTop: 18,
          opacity: 0.95,
        }}
      >
        <h2 style={{ marginBottom: 10 }}>Where I’m headed</h2>

        <p style={{ margin: 0, maxWidth: 900 }}>
          I’m currently focused on backend + systems engineering and growing deeper into AI systems
          and information-centric problems. I’m looking for roles where design tradeoffs are taken
          seriously — reliability, clarity, and good architecture matter.
        </p>

        <p style={{ marginTop: 10, opacity: 0.9 }}>
          If you’re here for collaboration, interviews, or just shared curiosity:{" "}
          <a href="/about" style={{ fontWeight: 700 }}>
            the About page
          </a>{" "}
          has my education + what I’m targeting next.
        </p>
      </section>

      {/* FOOTER NOTE */}
      <footer style={{ marginTop: 26, opacity: 0.75, fontSize: 13 }}>
        Built for people who enjoy thinking. Minimal fluff. Honest tradeoffs.
      </footer>
    </div>
  );
};

export default Home;
