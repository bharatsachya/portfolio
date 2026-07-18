"use client";

import { useEffect } from "react";

export default function PortfolioPage() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- mobile menu ---------- */
    (() => {
      const btn = document.getElementById("menuBtn");
      const panel = document.getElementById("mobilePanel");
      if (!btn || !panel) return;

      const onToggle = () => {
        const open = document.body.classList.toggle("mobile-open");
        btn.setAttribute("aria-expanded", String(open));
      };
      const close = () => {
        document.body.classList.remove("mobile-open");
        btn.setAttribute("aria-expanded", "false");
      };
      btn.addEventListener("click", onToggle);
      const links = Array.from(panel.querySelectorAll("a"));
      links.forEach((a) => a.addEventListener("click", close));
      cleanups.push(() => {
        btn.removeEventListener("click", onToggle);
        links.forEach((a) => a.removeEventListener("click", close));
        document.body.classList.remove("mobile-open");
      });
    })();

    /* ---------- scroll reveal ---------- */
    (() => {
      const revealEls = document.querySelectorAll(".reveal");
      if ("IntersectionObserver" in window && !REDUCED) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                io.unobserve(e.target);
              }
            });
          },
          { threshold: 0.12 }
        );
        revealEls.forEach((el) => io.observe(el));
        cleanups.push(() => io.disconnect());
      } else {
        revealEls.forEach((el) => el.classList.add("in"));
      }
    })();

    /* ---------- ticker: duplicate once for seamless loop ---------- */
    (() => {
      const track = document.getElementById("tickerTrack");
      if (track && !track.dataset.duplicated) {
        track.innerHTML += track.innerHTML;
        track.dataset.duplicated = "1";
      }
    })();

    /* ---------- FIG.01 — orchestration trace ---------- */
    (() => {
      const canvas = document.getElementById("trace") as HTMLCanvasElement | null;
      const consoleBox = document.getElementById("console");
      if (!canvas || !canvas.getContext) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const COL = {
        ink: "#EAE8E1",
        muted: "#8E939E",
        dim: "#4A4F58",
        amber: "#FFB224",
        blue: "#5B8CFF",
        ok: "#4ADE80",
        surface: "#17191E",
        line: "#262A32",
      };

      type Node = { id: string; x: number; y: number; lbl: "above" | "below" };
      const NODES: Node[] = [
        { id: "TASK", x: 0.06, y: 0.52, lbl: "below" },
        { id: "PLANNER", x: 0.24, y: 0.52, lbl: "below" },
        { id: "RETRIEVER", x: 0.44, y: 0.22, lbl: "above" },
        { id: "MEMORY", x: 0.63, y: 0.22, lbl: "above" },
        { id: "TOOLS", x: 0.5, y: 0.8, lbl: "below" },
        { id: "LLM", x: 0.78, y: 0.52, lbl: "below" },
        { id: "CRITIC", x: 0.92, y: 0.52, lbl: "above" },
      ];
      const EDGES = [
        [0, 1],
        [1, 2],
        [1, 4],
        [2, 3],
        [3, 5],
        [4, 5],
        [5, 6],
      ];
      const RETRY_EDGE = [6, 1];

      const LOGS: Record<string, { a: string; t: string; c: string }> = {
        TASK: { a: "api", t: "POST /v1/query · task accepted", c: "" },
        PLANNER: { a: "planner", t: "decomposed → 3 subtasks", c: "" },
        RETRIEVER: { a: "retriever", t: "pinecone top_k=5 · 38ms", c: "" },
        MEMORY: { a: "memory", t: "neo4j hops=2 · ctx 12.4k tok", c: "" },
        TOOLS: { a: "tools", t: "tool call · web_search · ok", c: "" },
        LLM: { a: "llm", t: "draft generated · 412 tok", c: "" },
        CRITIC: { a: "critic", t: "grounding check · pass", c: "ok" },
        FAIL: { a: "critic", t: "low confidence → replan", c: "warn" },
        DONE: { a: "api", t: "200 · answer served · 112ms", c: "ok" },
      };

      type Route = { seq: Array<number | "F">; w: number };
      const ROUTES: Route[] = [
        { seq: [0, 1, 2, 3, 5, 6], w: 45 },
        { seq: [0, 1, 4, 5, 6], w: 35 },
        { seq: [0, 1, 2, 3, 5, 6, "F", 1, 4, 5, 6], w: 20 },
      ];

      let W = 0,
        H = 0,
        DPR = 1;
      function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = canvas!.clientWidth;
        H = canvas!.clientHeight;
        canvas!.width = W * DPR;
        canvas!.height = H * DPR;
        ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      }
      resize();
      const onResize = () => {
        resize();
        if (REDUCED) drawFrame(null, "");
      };
      window.addEventListener("resize", onResize);

      const px = (n: Node) => ({ x: n.x * W, y: n.y * H });

      const mouse = { x: -999, y: -999 };
      const onMove = (e: PointerEvent | TouchEvent) => {
        const r = canvas!.getBoundingClientRect();
        const t =
          "touches" in e && e.touches.length
            ? e.touches[0]
            : (e as PointerEvent);
        mouse.x = t.clientX - r.left;
        mouse.y = t.clientY - r.top;
      };
      const onLeave = () => {
        mouse.x = -999;
        mouse.y = -999;
      };
      canvas.addEventListener("pointermove", onMove as EventListener);
      canvas.addEventListener("touchmove", onMove as EventListener, {
        passive: true,
      });
      canvas.addEventListener("pointerleave", onLeave);

      const flash = NODES.map(() => 0);

      function drawEdge(a: number, b: number, active: boolean, dashed: boolean) {
        const p = px(NODES[a]),
          q = px(NODES[b]);
        ctx!.beginPath();
        if (dashed) {
          ctx!.moveTo(p.x, p.y);
          ctx!.quadraticCurveTo((p.x + q.x) / 2, H * 0.99, q.x, q.y);
        } else {
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(q.x, q.y);
        }
        ctx!.strokeStyle = active ? COL.amber : COL.line;
        ctx!.lineWidth = active ? 1.6 : 1;
        ctx!.setLineDash(dashed ? [3, 5] : []);
        ctx!.stroke();
        ctx!.setLineDash([]);
      }

      function drawNode(i: number) {
        const n = NODES[i],
          p = px(n);
        const hov =
          Math.abs(mouse.x - p.x) < 34 && Math.abs(mouse.y - p.y) < 34;
        const f = flash[i];
        const s = 11 + f * 3;

        if (f > 0.02) {
          ctx!.save();
          ctx!.shadowColor = COL.amber;
          ctx!.shadowBlur = 18 * f;
          ctx!.fillStyle = COL.amber;
          ctx!.fillRect(p.x - s / 2, p.y - s / 2, s, s);
          ctx!.restore();
        } else {
          ctx!.fillStyle = COL.surface;
          ctx!.fillRect(p.x - s / 2, p.y - s / 2, s, s);
          ctx!.strokeStyle = hov ? COL.amber : COL.muted;
          ctx!.lineWidth = 1.2;
          ctx!.strokeRect(p.x - s / 2, p.y - s / 2, s, s);
        }
        if (hov) {
          ctx!.strokeStyle = COL.amber;
          ctx!.lineWidth = 1;
          ctx!.strokeRect(p.x - s / 2 - 5, p.y - s / 2 - 5, s + 10, s + 10);
        }
        ctx!.font = "600 8.5px var(--font-plex-mono), 'IBM Plex Mono', monospace";
        ctx!.textAlign = "center";
        ctx!.fillStyle = hov || f > 0.02 ? COL.ink : COL.muted;
        const ly = n.lbl === "above" ? p.y - 16 : p.y + 24;
        ctx!.fillText(n.id, p.x, ly);
      }

      function drawFrame(
        pulse: { x: number; y: number } | null,
        activeEdgeKey: string
      ) {
        ctx!.clearRect(0, 0, W, H);
        ctx!.fillStyle = "rgba(142,147,158,0.18)";
        for (let d = 0; d < 14; d++) {
          const dx = (Math.sin(d * 37.1) * 0.5 + 0.5) * W,
            dy = (Math.sin(d * 91.7) * 0.5 + 0.5) * H;
          ctx!.fillRect(dx, dy, 2, 2);
        }
        EDGES.forEach((e) => {
          drawEdge(e[0], e[1], activeEdgeKey === e[0] + "-" + e[1], false);
        });
        drawEdge(RETRY_EDGE[0], RETRY_EDGE[1], activeEdgeKey === "6-1", true);
        for (let i = 0; i < NODES.length; i++) drawNode(i);
        if (pulse) {
          ctx!.save();
          ctx!.shadowColor = COL.amber;
          ctx!.shadowBlur = 12;
          ctx!.fillStyle = COL.amber;
          ctx!.beginPath();
          ctx!.arc(pulse.x, pulse.y, 4, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();
        }
      }

      /* console */
      const MAXLN = 5;
      const ts = () => {
        const d = new Date();
        const z = (n: number) => (n < 10 ? "0" : "") + n;
        return z(d.getHours()) + ":" + z(d.getMinutes()) + ":" + z(d.getSeconds());
      };
      const logLine = (key: string) => {
        if (!consoleBox) return;
        const L = LOGS[key];
        if (!L) return;
        const ln = document.createElement("div");
        ln.className = "ln";
        const cls = L.c === "ok" ? "okc" : L.c === "warn" ? "warn" : "";
        ln.innerHTML =
          '<span class="t">' +
          ts() +
          '</span><span class="agent">[' +
          L.a +
          ']</span><span class="' +
          cls +
          '">' +
          L.t +
          "</span>";
        consoleBox.appendChild(ln);
        while (consoleBox.children.length > MAXLN)
          consoleBox.removeChild(consoleBox.firstChild!);
      };

      if (consoleBox) consoleBox.innerHTML = "";
      logLine("TASK");
      logLine("PLANNER");
      logLine("RETRIEVER");

      if (REDUCED) {
        drawFrame(null, "");
        cleanups.push(() => {
          window.removeEventListener("resize", onResize);
          canvas.removeEventListener("pointermove", onMove as EventListener);
          canvas.removeEventListener("touchmove", onMove as EventListener);
          canvas.removeEventListener("pointerleave", onLeave);
        });
        return;
      }

      /* pulse engine */
      const pickRoute = (): Array<number | "F"> => {
        const total = ROUTES.reduce((s, r) => s + r.w, 0);
        let roll = Math.random() * total;
        for (let i = 0; i < ROUTES.length; i++) {
          roll -= ROUTES[i].w;
          if (roll <= 0) return ROUTES[i].seq;
        }
        return ROUTES[0].seq;
      };

      let route = pickRoute(),
        hop = 0,
        prog = 0,
        waiting = 0;
      const HOP_MS = 950,
        WAIT_MS = 2100;
      let last = performance.now();
      let rafId = 0;

      const nodeAt = (step: number) => route[step];

      function tick(now: number) {
        const dt = now - last;
        last = now;
        for (let i = 0; i < flash.length; i++)
          flash[i] = Math.max(0, flash[i] - dt / 650);

        let pulse: { x: number; y: number } | null = null,
          activeEdgeKey = "";

        if (waiting > 0) {
          waiting -= dt;
          if (waiting <= 0) {
            route = pickRoute();
            hop = 0;
            prog = 0;
            flash[route[0] as number] = 1;
            logLine("TASK");
          }
        } else {
          const a = nodeAt(hop) as number;
          let b = nodeAt(hop + 1);
          if (b === "F") b = nodeAt(hop + 2);

          if (b === undefined) {
            logLine("DONE");
            waiting = WAIT_MS;
          } else {
            prog += dt / HOP_MS;
            const pa = px(NODES[a]),
              pb = px(NODES[b as number]);
            const t = Math.min(prog, 1);
            const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const isRetry = a === 6 && b === 1;
            if (isRetry) {
              const mx = (pa.x + pb.x) / 2,
                my = H * 0.99;
              const u = 1 - e;
              pulse = {
                x: u * u * pa.x + 2 * u * e * mx + e * e * pb.x,
                y: u * u * pa.y + 2 * u * e * my + e * e * pb.y,
              };
            } else {
              pulse = { x: pa.x + (pb.x - pa.x) * e, y: pa.y + (pb.y - pa.y) * e };
            }
            activeEdgeKey = a + "-" + b;
            if (prog >= 1) {
              prog = 0;
              hop++;
              let arrived = nodeAt(hop);
              if (arrived === "F") {
                hop++;
                arrived = nodeAt(hop);
              }
              flash[arrived as number] = 1;
              if (nodeAt(hop + 1) === "F") logLine("FAIL");
              else logLine(NODES[arrived as number].id);
            }
          }
        }
        drawFrame(pulse, activeEdgeKey);
        rafId = requestAnimationFrame(tick);
      }
      flash[0] = 1;
      rafId = requestAnimationFrame(tick);

      cleanups.push(() => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("pointermove", onMove as EventListener);
        canvas.removeEventListener("touchmove", onMove as EventListener);
        canvas.removeEventListener("pointerleave", onLeave);
      });
    })();

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      {/* ================= NAV ================= */}
      <header className="nav">
        <div className="nav-inner">
          <a className="brand" href="#top" aria-label="Lovanshu Garg — home">
            <span className="brand-mark">LG</span>
            <span className="brand-name">LOVANSHU&nbsp;GARG</span>
          </a>
          <ul className="nav-links">
            <li>
              <a href="#about">ABOUT</a>
            </li>
            <li>
              <a href="#experience">EXPERIENCE</a>
            </li>
            <li>
              <a href="#projects">PROJECTS</a>
            </li>
            <li>
              <a href="#stack">STACK</a>
            </li>
          </ul>
          <div className="nav-right">
            <a
              className="btn btn-solid say-hello"
              href="mailto:lovanshugarg22703@gmail.com"
            >
              SAY HELLO
            </a>
            <button
              className="menu-btn"
              id="menuBtn"
              type="button"
              aria-label="Toggle menu"
              aria-expanded="false"
              aria-controls="mobilePanel"
            >
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav className="mobile-panel" id="mobilePanel" aria-label="Mobile">
          <a href="#about">ABOUT</a>
          <a href="#experience">EXPERIENCE</a>
          <a href="#projects">PROJECTS</a>
          <a href="#stack">STACK</a>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>

      <main id="top">
        {/* ================= HERO ================= */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <div className="kicker">
                <span>PORTFOLIO — 2026</span>
                <span className="dot" />
                <span>GURUGRAM, INDIA</span>
              </div>
              <h1>
                LOVANSHU
                <br />
                <span className="alt">GARG</span>
              </h1>
              <div className="role">AGENTIC AI ENGINEER — LLM &amp; BACKEND</div>
              <p className="lede">
                I build <strong>multi-agent systems and RAG pipelines</strong> —
                and the production backends that keep them{" "}
                <strong>fast, observable, and honest</strong>. Reasoning,
                retrieval, and deployment, wired end to end.
              </p>
              <div className="hero-cta">
                <a className="btn btn-solid" href="#projects">
                  VIEW PROJECTS →
                </a>
                <a
                  className="btn btn-ghost"
                  href="https://github.com/bharatsachya"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GITHUB ↗
                </a>
              </div>
              <div className="status">
                <span className="pulse" aria-hidden="true" />
                AI/ML ENGINEER @ BYTEBELL — OPEN TO COLLABORATIONS
              </div>
            </div>

            <div>
              <div className="fig-panel">
                <span className="fig-tab">FIG. 01 — ORCHESTRATION TRACE</span>
                <div className="trace-canvas-box">
                  <canvas
                    id="trace"
                    aria-label="Animated diagram of a task routing between AI agents"
                    role="img"
                  />
                </div>
                <div className="console" id="console" aria-hidden="true" />
              </div>
              <p className="fig-cap">
                A TASK ENTERS THE SYSTEM — WATCH IT ROUTE BETWEEN AGENTS. MOVE
                YOUR CURSOR TO INSPECT A NODE. A SMALL PICTURE OF HOW MY
                PIPELINES THINK.
              </p>
            </div>
          </div>
        </section>

        {/* ================= TICKER ================= */}
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track" id="tickerTrack">
            <span>
              [planner] task decomposed → <b>3 subtasks</b>
            </span>
            <span>
              [retriever] pinecone top_k=5 · <b>38ms</b>
            </span>
            <span>[graph] neo4j hops=2 · entities linked</span>
            <span>
              [memory] context assembled · <b>12.4k tokens</b>
            </span>
            <span>
              [critic] hallucination check · <b>pass</b>
            </span>
            <span>[queue] rabbitmq ack · celery worker-04</span>
            <span>
              [api] fastapi /v1/answer · <b>200</b> · 112ms
            </span>
            <span>
              [deploy] k8s rollout · aws · <b>healthy</b>
            </span>
          </div>
        </div>

        {/* ================= ABOUT ================= */}
        <section className="section" id="about">
          <div className="wrap">
            <div className="sec-head reveal">
              <div className="sec-title">ABOUT</div>
              <div className="sec-note">WHO I AM / HOW I GOT HERE</div>
            </div>
            <div className="about-grid">
              <div className="reveal">
                <h3>
                  What began as curiosity — tinkering with HTML, CSS and small
                  scripts — grew into{" "}
                  <span className="hl">
                    a career building systems that reason, retrieve, and act.
                  </span>
                </h3>
                <p>
                  Today I work on <strong>agentic AI at ByteBell</strong>:
                  multi-agent workflows with LangChain, LlamaIndex and CrewAI,
                  RAG pipelines backed by vector and graph stores, and the
                  asynchronous data machinery that feeds them at the scale of{" "}
                  <strong>a million-plus documents</strong>.
                </p>
                <p>
                  I care about the unglamorous parts that make AI real:{" "}
                  <strong>secure APIs, message queues, containers, CI/CD</strong>.
                  A clever agent that can&apos;t ship is a demo — I build the ones
                  that run in production.
                </p>
                <p>
                  I also love sharing what I learn — contributing to open source,
                  mentoring fellow developers, and grinding algorithms for the joy
                  of it.
                </p>
              </div>
              <div className="reveal">
                <div className="datasheet">
                  <div className="datasheet-row">
                    <span className="k">LOCATION</span>
                    <span className="v">Gurugram, India</span>
                  </div>
                  <div className="datasheet-row">
                    <span className="k">CURRENTLY</span>
                    <span className="v">AI/ML Engineer @ ByteBell</span>
                  </div>
                  <div className="datasheet-row">
                    <span className="k">FOCUS</span>
                    <span className="v">Agentic systems · RAG · Backend</span>
                  </div>
                  <div className="datasheet-row">
                    <span className="k">EDUCATION</span>
                    <span className="v">B.E. Computer Engineering &rsquo;25</span>
                  </div>
                  <div className="datasheet-row">
                    <span className="k">ALSO INTO</span>
                    <span className="v">Open source · Mentoring</span>
                  </div>
                </div>
                <div className="chips">
                  <span className="chip">
                    <b>500+</b> LEETCODE · TOP 10% GLOBAL
                  </span>
                  <span className="chip">
                    <b>1400+</b> CONTEST RATING
                  </span>
                  <span className="chip">KAGGLE CERTIFIED — ML · PYTHON · SQL</span>
                  <span className="chip">HACKTOBERFEST — MERGED PRS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= EXPERIENCE ================= */}
        <section className="section" id="experience">
          <div className="wrap">
            <div className="sec-head reveal">
              <div className="sec-title">EXPERIENCE</div>
              <div className="sec-note">DATASHEET / REVERSE-CHRONOLOGICAL</div>
            </div>

            <article className="xp reveal">
              <div>
                <div className="xp-when">
                  AUG 2025 — PRESENT
                  <br />
                  REMOTE
                </div>
                <span className="badge">CURRENT</span>
              </div>
              <div>
                <h4 className="xp-role">
                  AI/ML Engineer — Agentic AI &amp; Backend
                </h4>
                <div className="xp-org">BYTEBELL</div>
                <ul>
                  <li>
                    Design <strong>multi-agent workflows</strong> with CrewAI,
                    LangChain and LlamaIndex — reasoning, planning and
                    vector-backed memory wired into autonomous pipelines.
                  </li>
                  <li>
                    Built a production{" "}
                    <strong>RAG system on Pinecone + Neo4j</strong> (vector +
                    graph retrieval) that{" "}
                    <strong>cut model hallucinations by 40%</strong>.
                  </li>
                  <li>
                    Engineered async ingestion with{" "}
                    <strong>RabbitMQ and Celery</strong> — 1M+ documents cleaned,
                    annotated and structured for model readiness.
                  </li>
                  <li>
                    Ship secure <strong>FastAPI / Flask microservices</strong>{" "}
                    with OAuth and JWT, serving low-latency model outputs to
                    frontend apps.
                  </li>
                  <li>
                    Containerize and deploy with{" "}
                    <strong>Docker and Kubernetes</strong>; run CI/CD on AWS for
                    smooth model rollouts.
                  </li>
                </ul>
              </div>
              <div className="tags">
                <span className="tag">LANGCHAIN</span>
                <span className="tag">CREWAI</span>
                <span className="tag">LLAMAINDEX</span>
                <span className="tag">PINECONE</span>
                <span className="tag">NEO4J</span>
                <span className="tag">RABBITMQ</span>
                <span className="tag">FASTAPI</span>
                <span className="tag">K8S</span>
                <span className="tag">AWS</span>
              </div>
            </article>

            <article className="xp reveal">
              <div>
                <div className="xp-when">
                  FEB 2025 — JUN 2025
                  <br />
                  NOIDA, INDIA
                </div>
              </div>
              <div>
                <h4 className="xp-role">Software Trainee</h4>
                <div className="xp-org">CADENCE DESIGN SYSTEMS</div>
                <ul>
                  <li>
                    Built an <strong>NLP failure-prediction model</strong>
                    (scikit-learn, TF-IDF) that reads failure logs and automates
                    ticket assignment.
                  </li>
                  <li>
                    Optimized cloud-monitoring dashboards with JavaScript
                    performance work — metrics, visualization, web architecture.
                  </li>
                  <li>
                    Developed a <strong>C++ utility</strong> for robust
                    large-file management across system components.
                  </li>
                  <li>
                    Maintained rigorous code quality and versioning with{" "}
                    <strong>Git and Perforce</strong> in an agile team.
                  </li>
                </ul>
              </div>
              <div className="tags">
                <span className="tag">PYTHON</span>
                <span className="tag">SCIKIT-LEARN</span>
                <span className="tag">TF-IDF</span>
                <span className="tag">C++</span>
                <span className="tag">JAVASCRIPT</span>
                <span className="tag">PERFORCE</span>
              </div>
            </article>

            <div className="xp-earlier reveal">
              <div className="xp-when">2021 — 2024</div>
              <p>
                The B.E. years — hackathons, freelance AI tools, and open-source
                contributions. Where the curiosity compounded.
              </p>
            </div>
          </div>
        </section>

        {/* ================= PROJECTS ================= */}
        <section className="section" id="projects">
          <div className="wrap">
            <div className="sec-head reveal">
              <div className="sec-title">PROJECTS</div>
              <div className="sec-note">SELECTED BUILDS / OPEN SOURCE</div>
            </div>
            <div className="proj-grid">
              <article className="proj reveal">
                <div className="proj-fig">
                  <svg
                    className="fig-svg"
                    viewBox="0 0 460 210"
                    role="img"
                    aria-label="Diagram: documents are chunked, indexed into Pinecone and Neo4j, retrieved and answered by an LLM"
                  >
                    <text x="4" y="14" fontSize="9" letterSpacing="2" fill="#8E939E">
                      FIG. 02 — DUAL-STORE RETRIEVAL
                    </text>
                    <rect x="14" y="86" width="34" height="44" fill="none" stroke="#EAE8E1" />
                    <rect x="20" y="80" width="34" height="44" fill="#17191E" stroke="#EAE8E1" />
                    <line x1="27" y1="92" x2="47" y2="92" stroke="#8E939E" />
                    <line x1="27" y1="100" x2="47" y2="100" stroke="#8E939E" />
                    <line x1="27" y1="108" x2="43" y2="108" stroke="#8E939E" />
                    <text x="18" y="146" fontSize="8" letterSpacing="1.5" fill="#8E939E">
                      DOCS
                    </text>
                    <line x1="60" y1="102" x2="92" y2="102" stroke="#FFB224" strokeDasharray="4 4" />
                    <path d="M92 102 l-7 -4 v8 z" fill="#FFB224" />
                    <rect x="100" y="78" width="15" height="15" fill="#FFB224" />
                    <rect x="119" y="78" width="15" height="15" fill="#17191E" stroke="#FFB224" />
                    <rect x="100" y="97" width="15" height="15" fill="#17191E" stroke="#FFB224" />
                    <rect x="119" y="97" width="15" height="15" fill="#FFB224" />
                    <rect x="100" y="116" width="15" height="15" fill="#17191E" stroke="#FFB224" />
                    <rect x="119" y="116" width="15" height="15" fill="#17191E" stroke="#FFB224" />
                    <text x="98" y="146" fontSize="8" letterSpacing="1.5" fill="#8E939E">
                      CHUNKS
                    </text>
                    <path d="M146 96 C168 84 176 70 196 62" fill="none" stroke="#5B8CFF" strokeDasharray="4 4" />
                    <path d="M196 62 l-8 -1 4 7 z" fill="#5B8CFF" />
                    <path d="M146 112 C168 124 176 138 196 146" fill="none" stroke="#5B8CFF" strokeDasharray="4 4" />
                    <path d="M196 146 l-8 1 4 -7 z" fill="#5B8CFF" />
                    <rect x="202" y="44" width="92" height="34" fill="#17191E" stroke="#5B8CFF" />
                    <text x="216" y="65" fontSize="9" letterSpacing="1.5" fill="#EAE8E1">
                      PINECONE
                    </text>
                    <text x="202" y="38" fontSize="7.5" letterSpacing="1.5" fill="#8E939E">
                      VECTOR
                    </text>
                    <rect x="202" y="130" width="92" height="34" fill="#17191E" stroke="#5B8CFF" />
                    <text x="228" y="151" fontSize="9" letterSpacing="1.5" fill="#EAE8E1">
                      NEO4J
                    </text>
                    <text x="202" y="178" fontSize="7.5" letterSpacing="1.5" fill="#8E939E">
                      GRAPH
                    </text>
                    <path d="M296 61 C322 70 330 88 344 98" fill="none" stroke="#FFB224" strokeDasharray="4 4" />
                    <path d="M296 147 C322 138 330 120 344 110" fill="none" stroke="#FFB224" strokeDasharray="4 4" />
                    <rect x="348" y="88" width="52" height="32" fill="#FFB224" />
                    <text x="360" y="108" fontSize="10" fontWeight="600" fill="#0C0D10">
                      LLM
                    </text>
                    <line x1="402" y1="104" x2="420" y2="104" stroke="#EAE8E1" />
                    <path d="M424 104 l-7 -4 v8 z" fill="#EAE8E1" />
                    <rect x="426" y="92" width="24" height="24" fill="none" stroke="#4ADE80" />
                    <path d="M431 104 l4 4 8 -9" fill="none" stroke="#4ADE80" strokeWidth="2" />
                    <text x="352" y="146" fontSize="8" letterSpacing="1.5" fill="#8E939E">
                      ANSWER
                    </text>
                    <text x="308" y="196" fontSize="8.5" letterSpacing="1.5" fill="#4ADE80">
                      HALLUCINATIONS −40%
                    </text>
                    <text x="14" y="196" fontSize="8" letterSpacing="1.5" fill="#8E939E">
                      INGEST → EMBED → RETRIEVE → GROUND
                    </text>
                  </svg>
                </div>
                <div className="proj-body">
                  <h4>Iamyourbot</h4>
                  <p>
                    An end-to-end RAG information-extraction system — generative
                    AI paired with vector search and Hugging Face embeddings for
                    fast indexing and accurate querying over structured and
                    unstructured text.
                  </p>
                  <div className="chips" style={{ marginTop: 0 }}>
                    <span className="chip">PYTHON</span>
                    <span className="chip">RAG</span>
                    <span className="chip">HUGGING FACE</span>
                    <span className="chip">VECTOR SEARCH</span>
                  </div>
                  <div className="proj-links">
                    <a
                      href="https://iamyourbot.streamlit.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      VIEW LIVE
                    </a>
                    <a
                      href="https://github.com/bharatsachya/doc-image-analyzer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      VIEW CODE
                    </a>
                  </div>
                </div>
              </article>

              <article className="proj reveal">
                <div className="proj-fig">
                  <svg
                    className="fig-svg"
                    viewBox="0 0 460 210"
                    role="img"
                    aria-label="Diagram: market price history with a CNN and LSTM forecast cone"
                  >
                    <text x="4" y="14" fontSize="9" letterSpacing="2" fill="#8E939E">
                      FIG. 03 — SEQUENCE FORECAST
                    </text>
                    <line x1="30" y1="30" x2="30" y2="160" stroke="#262A32" />
                    <line x1="30" y1="160" x2="440" y2="160" stroke="#262A32" />
                    <text x="12" y="34" fontSize="7.5" fill="#8E939E">
                      HI
                    </text>
                    <text x="12" y="160" fontSize="7.5" fill="#8E939E">
                      LO
                    </text>
                    <polyline
                      points="30,128 62,112 88,124 116,96 142,106 170,82 198,94 226,70 254,84 282,62 306,72"
                      fill="none"
                      stroke="#EAE8E1"
                      strokeWidth="2"
                    />
                    <rect x="226" y="30" width="80" height="130" fill="#5B8CFF" opacity="0.08" />
                    <text x="230" y="26" fontSize="7.5" letterSpacing="1.5" fill="#5B8CFF">
                      LSTM WINDOW
                    </text>
                    <line x1="306" y1="30" x2="306" y2="160" stroke="#8E939E" strokeDasharray="3 5" />
                    <text x="298" y="172" fontSize="7.5" letterSpacing="1.5" fill="#8E939E">
                      NOW
                    </text>
                    <path d="M306 72 L430 34 L430 108 Z" fill="#FFB224" opacity="0.14" />
                    <polyline
                      points="306,72 340,62 374,54 430,44"
                      fill="none"
                      stroke="#FFB224"
                      strokeWidth="2"
                      strokeDasharray="6 5"
                    />
                    <circle cx="306" cy="72" r="5" fill="#FFB224" />
                    <text x="366" y="130" fontSize="7.5" letterSpacing="1.5" fill="#8E939E">
                      T+N
                    </text>
                    <text x="40" y="172" fontSize="7.5" letterSpacing="1.5" fill="#8E939E">
                      T−30
                    </text>
                    <line x1="30" y1="192" x2="54" y2="192" stroke="#EAE8E1" strokeWidth="2" />
                    <text x="60" y="195" fontSize="8" letterSpacing="1.5" fill="#8E939E">
                      MARKET
                    </text>
                    <line x1="130" y1="192" x2="154" y2="192" stroke="#FFB224" strokeWidth="2" strokeDasharray="5 4" />
                    <text x="160" y="195" fontSize="8" letterSpacing="1.5" fill="#8E939E">
                      CNN + LSTM FORECAST
                    </text>
                  </svg>
                </div>
                <div className="proj-body">
                  <h4>WiseTrader</h4>
                  <p>
                    Deep-learning time-series prediction — CNN and LSTM models in
                    PyTorch and TensorFlow for pattern recognition in financial
                    data, with the full data lifecycle managed from collection to
                    feature engineering.
                  </p>
                  <div className="chips" style={{ marginTop: 0 }}>
                    <span className="chip">PYTORCH</span>
                    <span className="chip">TENSORFLOW</span>
                    <span className="chip">CNN</span>
                    <span className="chip">LSTM</span>
                  </div>
                  <div className="proj-links">
                    <a
                      href="https://github.com/bharatsachya/WiseTrader"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      VIEW CODE
                    </a>
                  </div>
                </div>
              </article>

              <article className="proj reveal">
                <div className="proj-fig">
                  <svg
                    className="fig-svg"
                    viewBox="0 0 460 210"
                    role="img"
                    aria-label="Diagram: an agent writes a quiz about its diff, a human answers and is graded live, and a pre-push git hook blocks the push until the review passes"
                  >
                    <text x="4" y="14" fontSize="9" letterSpacing="2" fill="#8E939E">
                      FIG. 04 — QUIZ-GATED PUSH
                    </text>

                    <rect x="14" y="84" width="42" height="40" fill="#17191E" stroke="#EAE8E1" />
                    <line x1="22" y1="98" x2="48" y2="98" stroke="#8E939E" />
                    <line x1="22" y1="106" x2="44" y2="106" stroke="#8E939E" />
                    <line x1="22" y1="114" x2="48" y2="114" stroke="#8E939E" />
                    <text x="16" y="146" fontSize="8" letterSpacing="1.5" fill="#8E939E">
                      AGENT
                    </text>

                    <line x1="56" y1="104" x2="84" y2="104" stroke="#FFB224" strokeDasharray="4 4" />
                    <path d="M84 104 l-7 -4 v8 z" fill="#FFB224" />

                    <rect x="90" y="88" width="60" height="32" fill="#17191E" stroke="#FFB224" />
                    <text x="96" y="108" fontSize="8" letterSpacing="1" fill="#EAE8E1">
                      QUIZ.JSON
                    </text>
                    <text x="90" y="146" fontSize="8" letterSpacing="1.5" fill="#8E939E">
                      WRITES QUIZ
                    </text>

                    <line x1="150" y1="104" x2="178" y2="104" stroke="#5B8CFF" strokeDasharray="4 4" />
                    <path d="M178 104 l-7 -4 v8 z" fill="#5B8CFF" />

                    <rect x="184" y="64" width="96" height="78" fill="#17191E" stroke="#5B8CFF" />
                    <text x="196" y="86" fontSize="9" fontWeight="600" fill="#EAE8E1">
                      DIFF
                    </text>
                    <line x1="196" y1="98" x2="228" y2="98" stroke="#4ADE80" strokeWidth="2" />
                    <line x1="196" y1="106" x2="216" y2="106" stroke="#8E939E" strokeWidth="2" />
                    <rect x="196" y="116" width="72" height="18" fill="none" stroke="#8E939E" />
                    <text x="200" y="128" fontSize="6.5" fill="#8E939E">
                      Q: WHY THIS?
                    </text>
                    <text x="186" y="156" fontSize="8" letterSpacing="1.5" fill="#8E939E">
                      HUMAN ANSWERS
                    </text>

                    <path
                      d="M232 64 C 214 26 76 22 42 78"
                      fill="none"
                      stroke="#8E939E"
                      strokeDasharray="3 5"
                    />
                    <path d="M42 78 l8 -3 -2 -8 z" fill="#8E939E" />
                    <text x="110" y="44" fontSize="7.5" letterSpacing="1.5" fill="#8E939E">
                      GRADED LIVE — NEVER AUTO-PASSED
                    </text>

                    <line x1="282" y1="104" x2="308" y2="104" stroke="#4ADE80" strokeDasharray="4 4" />
                    <path d="M308 104 l-7 -4 v8 z" fill="#4ADE80" />

                    <rect x="312" y="88" width="32" height="32" fill="none" stroke="#4ADE80" />
                    <path d="M318 104 l4 4 8 -9" fill="none" stroke="#4ADE80" strokeWidth="2" />
                    <text x="328" y="146" fontSize="8" letterSpacing="1" fill="#8E939E" textAnchor="middle">
                      PASSED
                    </text>

                    <text x="368" y="92" fontSize="6.5" fill="#8E939E" textAnchor="middle">
                      git push
                    </text>
                    <line x1="350" y1="104" x2="386" y2="104" stroke="#EAE8E1" />
                    <path d="M386 104 l-7 -4 v8 z" fill="#EAE8E1" />

                    <rect x="390" y="78" width="54" height="52" fill="#17191E" stroke="#EAE8E1" />
                    <path d="M408 96 v-6 a6 6 0 0 1 12 0 v6" fill="none" stroke="#EAE8E1" />
                    <rect x="406" y="96" width="18" height="14" fill="none" stroke="#EAE8E1" />
                    <text x="417" y="146" fontSize="7" letterSpacing="1" fill="#8E939E" textAnchor="middle">
                      PRE-PUSH HOOK
                    </text>

                    <text x="14" y="196" fontSize="8" letterSpacing="1.5" fill="#8E939E">
                      CONTENT-ADDRESSED · NO SERVER AT PUSH TIME
                    </text>
                    <text x="288" y="172" fontSize="8.5" letterSpacing="1.5" fill="#4ADE80">
                      UNREVIEWED PUSH → BLOCKED
                    </text>
                  </svg>
                </div>
                <div className="proj-body">
                  <h4>quiz-axi</h4>
                  <p>
                    A git push gate for AI-authored diffs — after an agent
                    finishes a change, it writes a short quiz about the diff,
                    grades your answers live in the browser, and a Husky
                    pre-push hook refuses to push anything that hasn&apos;t
                    passed.
                  </p>
                  <div className="chips" style={{ marginTop: 0 }}>
                    <span className="chip">NODE.JS</span>
                    <span className="chip">CLI</span>
                    <span className="chip">GIT HOOKS</span>
                    <span className="chip">AGENTIC WORKFLOWS</span>
                  </div>
                  <div className="proj-links">
                    <a
                      href="https://github.com/bharatsachya/quiz-axi"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      VIEW CODE
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ================= STACK ================= */}
        <section className="section" id="stack">
          <div className="wrap">
            <div className="sec-head reveal">
              <div className="sec-title">STACK</div>
              <div className="sec-note">TOOLS I REACH FOR / GROUPED BY LAYER</div>
            </div>
            <div className="stack-grid">
              <div className="stack-col reveal">
                <h5>AGENTIC AI &amp; LLMS</h5>
                <ul>
                  <li>LangChain</li>
                  <li>LlamaIndex</li>
                  <li>CrewAI</li>
                  <li>RAG · Multi-Agent Systems</li>
                  <li>Hugging Face · Transformers</li>
                  <li>Prompt &amp; Tool Design</li>
                </ul>
              </div>
              <div className="stack-col reveal">
                <h5>ML FRAMEWORKS</h5>
                <ul>
                  <li>PyTorch</li>
                  <li>TensorFlow</li>
                  <li>Scikit-learn</li>
                  <li>Pandas · NumPy</li>
                  <li>CNNs · LSTMs</li>
                  <li>NLP · TF-IDF</li>
                </ul>
              </div>
              <div className="stack-col reveal">
                <h5>BACKEND &amp; APIS</h5>
                <ul>
                  <li>FastAPI</li>
                  <li>Flask</li>
                  <li>RESTful Microservices</li>
                  <li>OAuth · JWT</li>
                  <li>Celery · RabbitMQ</li>
                  <li>
                    Python <span className="lv">PROFICIENT</span>
                  </li>
                </ul>
              </div>
              <div className="stack-col reveal">
                <h5>CLOUD &amp; MLOPS</h5>
                <ul>
                  <li>AWS</li>
                  <li>Azure</li>
                  <li>Docker</li>
                  <li>Kubernetes</li>
                  <li>CI/CD Pipelines</li>
                  <li>Git · Perforce</li>
                </ul>
              </div>
              <div className="stack-col reveal">
                <h5>DATA &amp; SEARCH</h5>
                <ul>
                  <li>
                    Pinecone <span className="lv">VECTOR</span>
                  </li>
                  <li>
                    Neo4j <span className="lv">GRAPH</span>
                  </li>
                  <li>
                    Redis <span className="lv">CACHE</span>
                  </li>
                  <li>
                    ElasticSearch <span className="lv">SEARCH</span>
                  </li>
                  <li>MongoDB · MySQL</li>
                </ul>
              </div>
              <div className="stack-col reveal">
                <h5>LANGUAGES</h5>
                <ul>
                  <li>Python</li>
                  <li>C++</li>
                  <li>SQL</li>
                  <li>JavaScript</li>
                  <li>HTML · CSS</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= EDUCATION / PROOF ================= */}
        <section className="section" id="education">
          <div className="wrap">
            <div className="sec-head reveal">
              <div className="sec-title">CREDENTIALS</div>
              <div className="sec-note">DEGREE / PROOF OF WORK</div>
            </div>
            <div className="edu-grid">
              <div className="edu-card reveal">
                <div className="k">EDUCATION</div>
                <h6>B.E. Computer Engineering</h6>
                <div className="sub">
                  J.C. BOSE UNIVERSITY OF SCIENCE &amp; TECHNOLOGY, YMCA —
                  FARIDABAD
                  <br />
                  2021 — 2025 · CGPA <b>8.2</b>
                </div>
              </div>
              <div className="edu-card reveal">
                <div className="k">PROOF OF WORK</div>
                <h6>Algorithms &amp; Open Source</h6>
                <div className="sub">
                  <b>500+</b> LEETCODE PROBLEMS · TOP 10% GLOBAL · <b>1400+</b>{" "}
                  RATING
                  <br />
                  KAGGLE CERTIFIED — ML · PYTHON · SQL · HACKTOBERFEST CONTRIBUTOR
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section className="contact" id="contact">
          <div className="wrap">
            <div className="sec-head reveal">
              <div className="sec-title">CONTACT</div>
              <div className="sec-note">INBOX ALWAYS OPEN</div>
            </div>
            <h2 className="reveal">
              LET&apos;S BUILD
              <br />
              <span className="alt">SOMETHING AGENTIC.</span>
            </h2>
            <p className="reveal">
              Whether you have a question, a project, or just want to say hi —
              I&apos;ll do my best to get back to you. Reach out about agentic
              systems, RAG pipelines, or potential collaborations.
            </p>
            <a
              className="btn btn-solid reveal"
              href="mailto:lovanshugarg22703@gmail.com"
            >
              SAY HELLO →
            </a>
            <div className="socials reveal">
              <a
                href="https://github.com/bharatsachya"
                target="_blank"
                rel="noopener noreferrer"
              >
                GITHUB
              </a>
              <a
                href="https://linkedin.com/in/lovgarg"
                target="_blank"
                rel="noopener noreferrer"
              >
                LINKEDIN
              </a>
              <a
                href="https://x.com/Bharatsachya"
                target="_blank"
                rel="noopener noreferrer"
              >
                TWITTER
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="footer-inner">
          <span>DESIGNED &amp; BUILT BY LOVANSHU GARG</span>
          <span>SET IN ARCHIVO &amp; IBM PLEX MONO</span>
          <a href="#top">© 2026 — BACK TO TOP ↑</a>
        </div>
      </footer>
    </>
  );
}
