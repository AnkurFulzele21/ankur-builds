"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { RotateCcw, Sparkles, Zap } from "lucide-react";

interface BoxItem {
  id: string;
  label: string;
  sub: string;
  bg: string;
  fg: string;
  border: string;
  w: number;
  h: number;
  rounded: string;
}

const PHYSICS_BOXES: BoxItem[] = [
  { id: "b1", label: "VIBE CODING", sub: "01", bg: "#E85A2A", fg: "#EFE9DC", border: "#151E28", w: 178, h: 66, rounded: "18px" },
  { id: "b2", label: "NEXT.JS 16", sub: "02", bg: "#EFE9DC", fg: "#151E28", border: "#151E28", w: 164, h: 62, rounded: "999px" },
  { id: "b3", label: "SUPABASE PG", sub: "03", bg: "#F4A938", fg: "#151E28", border: "#151E28", w: 184, h: 64, rounded: "18px" },
  { id: "b4", label: "SHIP FAST", sub: "04", bg: "#151E28", fg: "#F4A938", border: "#EFE9DC", w: 158, h: 62, rounded: "999px" },
  { id: "b5", label: "COURSEFORGE", sub: "05", bg: "#EFE9DC", fg: "#151E28", border: "#151E28", w: 192, h: 68, rounded: "20px" },
  { id: "b6", label: "VIRAL X MACHINE", sub: "06", bg: "#E85A2A", fg: "#EFE9DC", border: "#151E28", w: 204, h: 64, rounded: "999px" },
  { id: "b7", label: "REACT EMAIL", sub: "07", bg: "#F4A938", fg: "#151E28", border: "#151E28", w: 176, h: 62, rounded: "18px" },
  { id: "b8", label: "THREE.JS 3D", sub: "08", bg: "#151E28", fg: "#EFE9DC", border: "#EFE9DC", w: 168, h: 64, rounded: "18px" },
  { id: "b9", label: "AI AGENTS", sub: "09", bg: "#EFE9DC", fg: "#E85A2A", border: "#151E28", w: 162, h: 60, rounded: "999px" },
  { id: "b10", label: "SAAS VIBES", sub: "10", bg: "#F4A938", fg: "#151E28", border: "#151E28", w: 210, h: 66, rounded: "20px" },
  { id: "b11", label: "ANKURFULZELE.IN", sub: "11", bg: "#E85A2A", fg: "#EFE9DC", border: "#151E28", w: 212, h: 64, rounded: "999px" },
  { id: "b12", label: "BUILD IN PUBLIC", sub: "12", bg: "#EFE9DC", fg: "#151E28", border: "#151E28", w: 194, h: 64, rounded: "18px" },
  { id: "b13", label: "ZERO FLUFF", sub: "13", bg: "#151E28", fg: "#EFE9DC", border: "#F4A938", w: 162, h: 60, rounded: "999px" },
  { id: "b14", label: "INDIA STUDIO", sub: "14", bg: "#F4A938", fg: "#151E28", border: "#151E28", w: 178, h: 64, rounded: "18px" },
];

export function PhysicsPlaygroundSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);
  const [zeroG, setZeroG] = useState(false);
  const [hasDropped, setHasDropped] = useState(false);

  // Trigger physics drop once scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasDropped(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!hasDropped) return;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.05, scale: 0.001 },
    });
    engineRef.current = engine;
    const world = engine.world;

    // Invisible walls keeping boxes neatly inside the playground
    const wallThick = 80;
    const walls = [
      Matter.Bodies.rectangle(width / 2, height + wallThick / 2, width + 120, wallThick, { isStatic: true }),
      Matter.Bodies.rectangle(width / 2, -wallThick * 2.5, width + 120, wallThick, { isStatic: true }),
      Matter.Bodies.rectangle(-wallThick / 2, height / 2, wallThick, height * 3, { isStatic: true }),
      Matter.Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height * 3, { isStatic: true }),
    ];
    Matter.Composite.add(world, walls);

    // Create rigid bodies for each HTML box
    const createdBodies = PHYSICS_BOXES.map((box, idx) => {
      const colCount = Math.max(2, Math.floor(width / 210));
      const col = idx % colCount;
      const row = Math.floor(idx / colCount);
      const startX = Math.min(
        width - box.w / 2 - 16,
        Math.max(box.w / 2 + 16, (col + 0.5) * (width / colCount) + (Math.random() - 0.5) * 30)
      );
      const startY = -60 - row * 95 - Math.random() * 40;

      const body = Matter.Bodies.rectangle(startX, startY, box.w, box.h, {
        restitution: 0.55,
        friction: 0.35,
        frictionAir: 0.012,
        chamfer: { radius: 14 },
        angle: (Math.random() - 0.5) * 0.35,
      });
      return body;
    });

    bodiesRef.current = createdBodies;
    Matter.Composite.add(world, createdBodies);

    // Mouse / Touch drag & fling support
    const mouse = Matter.Mouse.create(container);
    // Allow smooth page scrolling over the physics container without hijacking wheel
    const mouseWithEvents = mouse as unknown as {
      mousewheel?: EventListener;
      element: HTMLElement;
    };
    if (mouseWithEvents.mousewheel) {
      mouseWithEvents.element.removeEventListener("mousewheel", mouseWithEvents.mousewheel);
      mouseWithEvents.element.removeEventListener("DOMMouseScroll", mouseWithEvents.mousewheel);
      mouseWithEvents.element.removeEventListener("wheel", mouseWithEvents.mousewheel);
    }

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.22,
        render: { visible: false },
      },
    });
    Matter.Composite.add(world, mouseConstraint);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    let rafId = 0;
    const syncDom = () => {
      createdBodies.forEach((body, idx) => {
        const el = itemRefs.current[idx];
        if (!el) return;
        const box = PHYSICS_BOXES[idx];
        const x = body.position.x - box.w / 2;
        const y = body.position.y - box.h / 2;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${body.angle}rad)`;
        el.style.opacity = "1";
      });
      rafId = requestAnimationFrame(syncDom);
    };
    rafId = requestAnimationFrame(syncDom);

    return () => {
      cancelAnimationFrame(rafId);
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [hasDropped]);

  function handleShake() {
    bodiesRef.current.forEach((body) => {
      Matter.Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * 0.14,
        y: -0.14 - Math.random() * 0.08,
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.18);
    });
  }

  function handleToggleZeroG() {
    const engine = engineRef.current;
    if (!engine) return;
    const next = !zeroG;
    setZeroG(next);
    engine.gravity.y = next ? 0 : 1.05;
    if (next) {
      bodiesRef.current.forEach((body) => {
        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 4,
          y: -2 - Math.random() * 3,
        });
      });
    }
  }

  return (
    <section
      id="playground"
      className="riso-grain relative bg-[#26465C] px-6 py-20 text-[#EFE9DC] sm:px-10 sm:py-24"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono-tech text-[12px] font-bold uppercase tracking-widest text-[#F4A938]">
              INTERACTIVE SANDBOX // GRAB, DRAG &amp; THROW
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              PLAY WITH MY STACK
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleShake}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#151E28] bg-[#F4A938] px-4 py-2 font-mono-tech text-[11.5px] font-bold uppercase tracking-wider text-[#151E28] shadow-[3px_3px_0px_#151E28] transition hover:-translate-y-0.5 hover:bg-[#EFE9DC]"
            >
              <Zap className="h-3.5 w-3.5" />
              Toss Boxes
            </button>
            <button
              type="button"
              onClick={handleToggleZeroG}
              className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 font-mono-tech text-[11.5px] font-bold uppercase tracking-wider transition ${
                zeroG
                  ? "border-[#151E28] bg-[#E85A2A] text-[#EFE9DC] shadow-[3px_3px_0px_#151E28]"
                  : "border-[#EFE9DC]/30 bg-[#151E28]/60 text-[#EFE9DC] hover:border-[#F4A938]"
              }`}
            >
              {zeroG ? <RotateCcw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {zeroG ? "Restore Gravity" : "Zero Gravity"}
            </button>
          </div>
        </div>

        {/* Matter.js Physics Arena */}
        <div
          ref={containerRef}
          className="relative mt-8 h-[460px] w-full cursor-grab overflow-hidden rounded-[30px] border-2 border-[#151E28] bg-[#1B3344] shadow-[10px_10px_0px_#151E28] active:cursor-grabbing sm:h-[520px]"
        >
          {/* Subtle Blueprint Grid Background inside Playground */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(to right, #EFE9DC 1px, transparent 1px), linear-gradient(to bottom, #EFE9DC 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          <span className="pointer-events-none absolute left-5 top-4 font-mono-tech text-[11px] uppercase tracking-widest text-[#EFE9DC]/45">
            MATTER.JS 2D PHYSICS · DRAG ANY CARD
          </span>

          {PHYSICS_BOXES.map((box, idx) => (
            <div
              key={box.id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              style={{
                width: `${box.w}px`,
                height: `${box.h}px`,
                backgroundColor: box.bg,
                color: box.fg,
                borderColor: box.border,
                borderRadius: box.rounded,
                opacity: 0,
              }}
              className="absolute left-0 top-0 flex select-none items-center justify-between border-2 px-5 font-display text-[15px] font-extrabold tracking-tight shadow-[4px_4px_0px_rgba(21,30,40,0.65)] will-change-transform"
            >
              <span>{box.label}</span>
              <span className="font-mono-tech text-[10px] opacity-65">{box.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
