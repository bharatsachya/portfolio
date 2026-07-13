"use client";

import { useEffect, type CSSProperties } from "react";

export default function PortfolioPage() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* ========================================================
       Mobile menu
       ======================================================== */
    (() => {
      const btn = document.getElementById("menuBtn");
      const panel = document.getElementById("mobilePanel");
      if (!btn || !panel) return;

      const onToggle = () => {
        const open = document.body.classList.toggle("mobile-open");
        btn.setAttribute("aria-expanded", String(open));
        btn.textContent = open ? "Close" : "Menu";
      };
      btn.addEventListener("click", onToggle);
      cleanups.push(() => btn.removeEventListener("click", onToggle));

      const onLink = () => {
        document.body.classList.remove("mobile-open");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Menu";
      };
      const links = Array.from(panel.querySelectorAll("a"));
      links.forEach((a) => a.addEventListener("click", onLink));
      cleanups.push(() =>
        links.forEach((a) => a.removeEventListener("click", onLink))
      );
    })();

    /* ========================================================
       Scroll reveals
       ======================================================== */
    (() => {
      const els = document.querySelectorAll(".reveal");
      if (!("IntersectionObserver" in window)) {
        els.forEach((e) => e.classList.add("in"));
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      els.forEach((e) => io.observe(e));
      cleanups.push(() => io.disconnect());
    })();

    /* ========================================================
       Fig. 01 — Embedding field
       A drifting point cloud. The cursor acts as a query vector:
       its k nearest neighbours light up and link to it (k-NN).
       ======================================================== */
    (() => {
      const canvas = document.getElementById("field") as HTMLCanvasElement | null;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const css = getComputedStyle(document.documentElement);
      const INK = css.getPropertyValue("--ink").trim() || "#0E1116";
      const COBALT = css.getPropertyValue("--cobalt").trim() || "#2337EC";
      const YELLOW = css.getPropertyValue("--yellow").trim() || "#FFD21E";

      type Pt = { x: number; y: number; vx: number; vy: number };
      let w = 0,
        h = 0,
        dpr = 1,
        pts: Pt[] = [],
        lastW = 0;
      const pointer: { x: number | null; y: number | null } = {
        x: null,
        y: null,
      };
      const K = 6,
        LINK = 78,
        REACH = 170;

      function resize() {
        const r = canvas!.getBoundingClientRect();
        if (pts.length && Math.abs(r.width - lastW) < 8) return; // ignore mobile URL-bar jitter
        lastW = r.width;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = r.width;
        h = r.height;
        canvas!.width = Math.round(w * dpr);
        canvas!.height = Math.round(h * dpr);
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.max(40, Math.min(90, Math.round((w * h) / 5200)));
        pts = Array.from({ length: n }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
        }));
        if (reduced) draw();
      }

      function draw() {
        ctx!.clearRect(0, 0, w, h);

        // ambient neighbour links
        ctx!.lineWidth = 1;
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x,
              dy = pts[i].y - pts[j].y;
            const d = Math.hypot(dx, dy);
            if (d < LINK) {
              ctx!.globalAlpha = (1 - d / LINK) * 0.16;
              ctx!.strokeStyle = INK;
              ctx!.beginPath();
              ctx!.moveTo(pts[i].x, pts[i].y);
              ctx!.lineTo(pts[j].x, pts[j].y);
              ctx!.stroke();
            }
          }
        }
        ctx!.globalAlpha = 1;

        // query vector: k nearest neighbours of the cursor
        let near: { p: Pt; d: number }[] = [];
        if (pointer.x !== null && pointer.y !== null) {
          near = pts
            .map((p) => ({
              p,
              d: Math.hypot(p.x - pointer.x!, p.y - pointer.y!),
            }))
            .filter((o) => o.d < REACH)
            .sort((a, b) => a.d - b.d)
            .slice(0, K);

          ctx!.strokeStyle = YELLOW;
          ctx!.lineWidth = 2;
          near.forEach((o) => {
            ctx!.globalAlpha = 0.95;
            ctx!.beginPath();
            ctx!.moveTo(pointer.x!, pointer.y!);
            ctx!.lineTo(o.p.x, o.p.y);
            ctx!.stroke();
          });
          ctx!.globalAlpha = 1;
        }

        // points
        const hot = new Set(near.map((o) => o.p));
        pts.forEach((p) => {
          ctx!.beginPath();
          if (hot.has(p)) {
            ctx!.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx!.fillStyle = YELLOW;
            ctx!.fill();
            ctx!.lineWidth = 1.5;
            ctx!.strokeStyle = INK;
            ctx!.stroke();
          } else {
            ctx!.arc(p.x, p.y, 2.1, 0, Math.PI * 2);
            ctx!.globalAlpha = 0.55;
            ctx!.fillStyle = INK;
            ctx!.fill();
            ctx!.globalAlpha = 1;
          }
        });

        // the query itself
        if (pointer.x !== null && pointer.y !== null) {
          ctx!.beginPath();
          ctx!.arc(pointer.x, pointer.y, 5.5, 0, Math.PI * 2);
          ctx!.lineWidth = 2.5;
          ctx!.strokeStyle = COBALT;
          ctx!.stroke();
        }
      }

      function step() {
        pts.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 4 || p.x > w - 4) p.vx *= -1;
          if (p.y < 4 || p.y > h - 4) p.vy *= -1;
        });
        draw();
      }

      // pointer tracking (mouse + touch)
      function setPointer(e: any) {
        const r = canvas!.getBoundingClientRect();
        const t = e.touches ? e.touches[0] : e;
        pointer.x = t.clientX - r.left;
        pointer.y = t.clientY - r.top;
        if (reduced) draw();
      }
      const onLeave = () => {
        pointer.x = pointer.y = null;
        if (reduced) draw();
      };
      canvas.addEventListener("pointermove", setPointer);
      canvas.addEventListener("touchmove", setPointer, { passive: true });
      canvas.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        canvas.removeEventListener("pointermove", setPointer);
        canvas.removeEventListener("touchmove", setPointer);
        canvas.removeEventListener("pointerleave", onLeave);
      });

      // run only while visible; respect reduced motion
      let raf: number | null = null,
        visible = false;
      function loop() {
        step();
        raf = requestAnimationFrame(loop);
      }
      function start() {
        if (!raf && !reduced && visible && !document.hidden) loop();
      }
      function stop() {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      }

      const vio = new IntersectionObserver(
        (en) => {
          visible = en[0].isIntersecting;
          visible ? start() : stop();
        },
        { threshold: 0.05 }
      );
      vio.observe(canvas);

      const onVisibility = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("resize", resize);
      cleanups.push(() => {
        stop();
        vio.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("resize", resize);
      });

      resize();
      if (reduced) draw();
    })();

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      {/* ============================================================
          HEADER
          ============================================================ */}
      <header id="top">
        <div className="wrap nav">
          <a className="brand" href="#top" aria-label="Lovanshu Garg — home">
            <span className="mark" aria-hidden="true">
              LG
            </span>
            <span className="who">Lovanshu&nbsp;Garg</span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            <a href="#about">About</a>
            <a href="#experience">Experience</a>
            <a href="#projects">Projects</a>
            <a href="#stack">Stack</a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <a className="btn btn-primary btn-sm" href="#contact">
              Say hello
            </a>
            <button
              className="menu-btn"
              id="menuBtn"
              type="button"
              aria-expanded="false"
              aria-controls="mobilePanel"
            >
              Menu
            </button>
          </div>
        </div>

        <nav className="mobile-panel" id="mobilePanel" aria-label="Mobile">
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#stack">Stack</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      {/* ============================================================
          HERO
          ============================================================ */}
      <main>
        <section className="hero" aria-label="Introduction">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">
                <span>Portfolio — 2026</span>
                <span className="dotsep">Based in India</span>
              </p>

              <h1 className="display">
                <span className="row">
                  <span className="rise" style={{ "--d": ".05s" } as CSSProperties}>
                    Lovanshu
                  </span>
                </span>
                <span className="row">
                  <span className="rise alt" style={{ "--d": ".16s" } as CSSProperties}>
                    Garg
                  </span>
                </span>
              </h1>

              <p className="role-line">Full-Stack &amp; AI Engineer</p>

              <p className="thesis">
                I build web applications with machine learning inside — RAG
                pipelines, multi-agent systems, and the interfaces that make
                them feel effortless.
              </p>

              <div className="hero-cta">
                <a className="btn btn-primary" href="#projects">
                  View projects <span className="arrow">→</span>
                </a>
                <a
                  className="btn"
                  href="https://github.com/bharatsachya"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub <span className="arrow">→</span>
                </a>
              </div>

              <p className="status">
                <span className="pulse" aria-hidden="true"></span> AI Engineer @
                ByteBell — open to collaborations
              </p>
            </div>

            <div>
              <figure className="plate field-plate">
                <figcaption className="fig-tab">
                  Fig. 01 — Embedding field
                </figcaption>
                <canvas
                  id="field"
                  role="img"
                  aria-label="Interactive particle field. Moving your cursor retrieves its nearest neighbours, like a vector search."
                ></canvas>
              </figure>
              <p className="fig-caption">
                Move your cursor — its k-nearest neighbours light up. A small
                picture of how retrieval works.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            ABOUT
            ============================================================ */}
        <section id="about">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="label">About</span>
              <span className="note">Who I am / How I got here</span>
            </div>

            <div className="about-grid">
              <div className="reveal">
                <p className="about-lede">
                  What began as curiosity in 2018 — tinkering with HTML, CSS and
                  small JavaScript projects — grew into{" "}
                  <em>a career building intelligent software.</em>
                </p>
                <div className="about-copy">
                  <p>
                    Since then I&apos;ve worked across the whole range:
                    hackathons, freelance AI tools, and full-stack applications
                    for startups and independent clients. My focus today is
                    designing scalable, efficient, user-friendly web
                    applications — often with AI models and automation pipelines
                    built in to deliver smarter solutions.
                  </p>
                  <p>
                    I also love sharing what I learn. I contribute to open
                    source, guide fellow developers on AI and web topics, and
                    enjoy experimenting with ideas that push past what
                    conventional software can do.
                  </p>
                </div>
              </div>

              <ul className="facts reveal" aria-label="Quick facts">
                <li>
                  <span className="k">Location</span>{" "}
                  <span className="v">India</span>
                </li>
                <li>
                  <span className="k">Writing code since</span>{" "}
                  <span className="v">2018</span>
                </li>
                <li>
                  <span className="k">Currently</span>{" "}
                  <span className="v">AI Engineer @ ByteBell</span>
                </li>
                <li>
                  <span className="k">Focus</span>{" "}
                  <span className="v">RAG systems · Full-stack apps</span>
                </li>
                <li>
                  <span className="k">Also into</span>{" "}
                  <span className="v">Open source · Mentoring</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ============================================================
            EXPERIENCE
            ============================================================ */}
        <section id="experience">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="label">Experience</span>
              <span className="note">Datasheet / Reverse-chronological</span>
            </div>

            <article className="xp reveal">
              <div className="when">
                Aug 2025 – Present
                <br />
                <span className="now">Current</span>
              </div>
              <div>
                <h3>AI Engineer &amp; Full-Stack Developer</h3>
                <p className="co">ByteBell</p>
                <ul>
                  <li>
                    Built a robust LLM ingestion pipeline on Pinecone and
                    MongoDB to manage embeddings and context storage.
                  </li>
                  <li>
                    Improved retrieval accuracy with meta-strategies for data
                    curation and vector-space efficiency.
                  </li>
                  <li>
                    Developed “Agent Box”, a multi-agent framework for
                    intelligent query routing and context-aware LLM responses.
                  </li>
                </ul>
              </div>
              <div className="tags">
                <span>LLM</span>
                <span>RAG</span>
                <span>Pinecone</span>
                <span>MongoDB</span>
              </div>
            </article>

            <article className="xp reveal">
              <div className="when">Feb 2025 – Jun 2025</div>
              <div>
                <h3>Research &amp; Development Intern</h3>
                <p className="co">Cadence Design Systems</p>
                <ul>
                  <li>
                    Cut cloud-dashboard load times with Google Closure Compiler
                    JavaScript minification.
                  </li>
                  <li>
                    Resolved critical front-end and back-end CCRs to keep
                    production stable.
                  </li>
                  <li>
                    Built a standalone C++ file manager to handle file
                    operations across Cadence components.
                  </li>
                  <li>
                    Ran Git and Perforce workflows — branching, merging,
                    rollback — with peer review on Review Board.
                  </li>
                  <li>
                    Fine-tuned software components for performance, scalability
                    and reliability.
                  </li>
                </ul>
              </div>
              <div className="tags">
                <span>C++</span>
                <span>JavaScript</span>
                <span>Git</span>
                <span>Perforce</span>
              </div>
            </article>

            <article className="xp xp-earlier reveal">
              <div className="when">2018 – 2024</div>
              <p>
                Earlier — hackathons, freelance AI tools and open-source
                contributions. Where the curiosity started.
              </p>
            </article>
          </div>
        </section>

        {/* ============================================================
            PROJECTS
            ============================================================ */}
        <section id="projects">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="label">Projects</span>
              <span className="note">Selected builds / Live &amp; open source</span>
            </div>

            <div className="proj-grid">
              {/* Project 1 */}
              <article className="proj plate reveal">
                <div className="media" aria-hidden="true">
                  <span className="fig-tab">Fig. 02 — Retrieval flow</span>
                  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" fill="none">
                    {/* documents */}
                    <g stroke="#0E1116" strokeWidth="2">
                      <rect x="46" y="60" width="58" height="72" fill="#FBFBF8" />
                      <rect x="56" y="50" width="58" height="72" fill="#FBFBF8" />
                      <rect x="66" y="40" width="58" height="72" fill="#FFFFFF" />
                      <line x1="78" y1="58" x2="112" y2="58" strokeWidth="1.5" />
                      <line x1="78" y1="70" x2="112" y2="70" strokeWidth="1.5" />
                      <line x1="78" y1="82" x2="104" y2="82" strokeWidth="1.5" />
                    </g>
                    <text x="85" y="160" fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="1" fill="#676D75" textAnchor="middle">
                      DOCS
                    </text>

                    {/* arrow 1 */}
                    <line className="flow" x1="136" y1="86" x2="212" y2="86" stroke="#2337EC" strokeWidth="2" />
                    <path d="M212 86 l-9 -5 v10 z" fill="#2337EC" />

                    {/* chunks */}
                    <g stroke="#0E1116" strokeWidth="2" fill="#FFD21E">
                      <rect x="228" y="52" width="20" height="20" />
                      <rect x="254" y="52" width="20" height="20" />
                      <rect x="228" y="78" width="20" height="20" />
                      <rect x="254" y="78" width="20" height="20" fill="#FBFBF8" />
                      <rect x="228" y="104" width="20" height="20" fill="#FBFBF8" />
                      <rect x="254" y="104" width="20" height="20" />
                    </g>
                    <text x="251" y="160" fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="1" fill="#676D75" textAnchor="middle">
                      CHUNKS
                    </text>

                    {/* arrow 2 */}
                    <line className="flow" x1="290" y1="86" x2="358" y2="86" stroke="#2337EC" strokeWidth="2" />
                    <path d="M358 86 l-9 -5 v10 z" fill="#2337EC" />

                    {/* vector cluster */}
                    <g stroke="#0E1116" strokeWidth="1.5">
                      <circle cx="392" cy="62" r="5" fill="#FBFBF8" />
                      <circle cx="414" cy="84" r="5" fill="#FFD21E" />
                      <circle cx="386" cy="102" r="5" fill="#FBFBF8" />
                      <circle cx="418" cy="112" r="5" fill="#FBFBF8" />
                      <circle cx="402" cy="86" r="5" fill="#FFD21E" />
                    </g>
                    <line x1="402" y1="86" x2="414" y2="84" stroke="#2337EC" strokeWidth="1.5" />
                    <line x1="402" y1="86" x2="392" y2="62" stroke="#2337EC" strokeWidth="1.5" opacity=".4" />
                    <text x="402" y="160" fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="1" fill="#676D75" textAnchor="middle">
                      VECTORS
                    </text>

                    {/* arrow 3 */}
                    <line className="flow" x1="442" y1="86" x2="502" y2="86" stroke="#2337EC" strokeWidth="2" />
                    <path d="M502 86 l-9 -5 v10 z" fill="#2337EC" />

                    {/* answer bubble */}
                    <g stroke="#0E1116" strokeWidth="2">
                      <rect x="510" y="56" width="64" height="44" fill="#2337EC" />
                      <path d="M522 100 l0 12 12 -12 z" fill="#2337EC" />
                    </g>
                    <line x1="522" y1="72" x2="562" y2="72" stroke="#FFFFFF" strokeWidth="2" />
                    <line x1="522" y1="84" x2="550" y2="84" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="542" y="160" fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="1" fill="#676D75" textAnchor="middle">
                      ANSWER
                    </text>

                    {/* baseline annotation */}
                    <line x1="46" y1="196" x2="574" y2="196" stroke="#0E1116" strokeWidth="1" opacity=".2" />
                    <text x="46" y="218" fontFamily="IBM Plex Mono" fontSize="10.5" letterSpacing="1.5" fill="#676D75">
                      INGEST → EMBED → RETRIEVE → RESPOND
                    </text>
                  </svg>
                </div>
                <div className="body">
                  <h3>I Am Your Bot</h3>
                  <p className="desc">
                    An AI-powered RAG chatbot that analyzes whatever you feed it
                    — no database required. Built from core architecture up with
                    Python, NumPy and pandas.
                  </p>
                  <div className="tags">
                    <span>Python</span>
                    <span>LLM</span>
                    <span>NumPy</span>
                    <span>Pandas</span>
                  </div>
                  <div className="links">
                    <a
                      className="link"
                      href="https://iamyourbot.streamlit.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View live
                    </a>
                    <a
                      className="link"
                      href="https://github.com/bharatsachya/doc-image-analyzer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View code
                    </a>
                  </div>
                </div>
              </article>

              {/* Project 2 */}
              <article className="proj plate reveal">
                <div className="media" aria-hidden="true">
                  <span className="fig-tab">Fig. 03 — Forecast</span>
                  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" fill="none">
                    {/* axes */}
                    <line x1="60" y1="30" x2="60" y2="190" stroke="#0E1116" strokeWidth="2" />
                    <line x1="60" y1="190" x2="560" y2="190" stroke="#0E1116" strokeWidth="2" />
                    <g fontFamily="IBM Plex Mono" fontSize="10" fill="#676D75" letterSpacing="1">
                      <text x="48" y="46" textAnchor="end">
                        HI
                      </text>
                      <text x="48" y="188" textAnchor="end">
                        LO
                      </text>
                      <text x="60" y="212">
                        T-30
                      </text>
                      <text x="356" y="212">
                        NOW
                      </text>
                      <text x="522" y="212">
                        T+7
                      </text>
                    </g>
                    {/* history */}
                    <polyline
                      className="drawline"
                      points="60,150 100,138 140,148 180,118 220,128 260,96 300,110 340,84 372,92"
                      stroke="#0E1116"
                      strokeWidth="2.5"
                    />
                    {/* prediction cone */}
                    <path d="M372 92 L544 46 L544 118 Z" fill="#2337EC" opacity="0.10" />
                    {/* prediction line */}
                    <polyline points="372,92 420,78 470,70 544,56" stroke="#2337EC" strokeWidth="2.5" strokeDasharray="7 6" />
                    {/* junction marker */}
                    <circle cx="372" cy="92" r="7" fill="#FFD21E" stroke="#0E1116" strokeWidth="2" />
                    <line x1="372" y1="30" x2="372" y2="190" stroke="#0E1116" strokeWidth="1" strokeDasharray="3 5" opacity=".35" />
                    {/* legend */}
                    <g fontFamily="IBM Plex Mono" fontSize="10.5" letterSpacing="1.5">
                      <line x1="60" y1="236" x2="84" y2="236" stroke="#0E1116" strokeWidth="2.5" />
                      <text x="92" y="240" fill="#676D75">
                        MARKET
                      </text>
                      <line x1="176" y1="236" x2="200" y2="236" stroke="#2337EC" strokeWidth="2.5" strokeDasharray="6 5" />
                      <text x="208" y="240" fill="#676D75">
                        RNN FORECAST
                      </text>
                    </g>
                  </svg>
                </div>
                <div className="body">
                  <h3>Stock Prediction App</h3>
                  <p className="desc">
                    A real-time market prediction platform: RNN models on Yahoo
                    Finance data, served through FastAPI and visualized in
                    Streamlit dashboards.
                  </p>
                  <div className="tags">
                    <span>PyTorch</span>
                    <span>RNN</span>
                    <span>FastAPI</span>
                    <span>Streamlit</span>
                  </div>
                  <div className="links">
                    <a
                      className="link"
                      href="https://github.com/bharatsachya/WiseTrader"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View code
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ============================================================
            STACK
            ============================================================ */}
        <section id="stack">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="label">Stack</span>
              <span className="note">Tools I reach for / Grouped by layer</span>
            </div>

            <div className="stack-grid">
              <div className="stack-col reveal">
                <p className="col-label">Interface</p>
                <ul>
                  <li>Next.js</li>
                  <li>React</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                  <li>Framer Motion</li>
                </ul>
              </div>
              <div className="stack-col reveal">
                <p className="col-label">Intelligence</p>
                <ul>
                  <li>Python</li>
                  <li>PyTorch</li>
                  <li>TensorFlow</li>
                  <li>Scikit-learn</li>
                  <li>NumPy · Pandas</li>
                </ul>
              </div>
              <div className="stack-col reveal">
                <p className="col-label">Infrastructure</p>
                <ul>
                  <li>Node.js</li>
                  <li>FastAPI</li>
                  <li>Docker</li>
                  <li>AWS · Firebase</li>
                  <li>MongoDB · Pinecone</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            CONTACT
            ============================================================ */}
        <section id="contact" className="contact">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="label">Contact</span>
              <span className="note">Inbox always open</span>
            </div>

            <div className="reveal">
              <h2 className="display">
                Let&apos;s build <span className="alt">something.</span>
              </h2>
              <p>
                Whether you have a question, a project, or just want to say hi —
                I&apos;ll do my best to get back to you. Reach out about
                potential projects or collaborations.
              </p>
              <div className="cta-row">
                <a
                  className="btn btn-primary"
                  href="mailto:lovanshugarg22703@gmail.com"
                >
                  Say hello <span className="arrow">→</span>
                </a>
              </div>
              <div className="socials">
                <a
                  href="https://github.com/bharatsachya"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/lovgarg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                <a
                  href="https://x.com/Bharatsachya"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer>
        <div className="wrap foot">
          <span>Designed &amp; built by Lovanshu Garg</span>
          <span>Set in Archivo &amp; IBM Plex Mono</span>
          <a href="#top">© 2026 — Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
