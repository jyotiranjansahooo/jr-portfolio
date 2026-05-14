"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ArrowRight, Mail, ExternalLink, Link2, Sparkles, Code2, Layers } from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface MousePosition {
  x: number;
  y: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const PARTICLE_COUNT = 28;

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.1,
  }));
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

function NoiseTexture() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-filter)" />
    </svg>
  );
}

function GridLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(120,180,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(120,180,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function RippleCanvas({ ripples }: { ripples: { x: number; y: number; id: number }[] }) {
  return (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-wave absolute rounded-full pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            width: 0,
            height: 0,
            transform: "translate(-50%, -50%)",
            border: "2px solid rgba(99,179,255,0.6)",
            boxShadow: "0 0 24px 6px rgba(99,179,255,0.18), inset 0 0 24px 4px rgba(99,179,255,0.08)",
          }}
        />
      ))}
    </>
  );
}

function RotatingRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[220, 170, 120].map((size, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: `rgba(99,179,255,${0.12 - i * 0.03})`,
            boxShadow: `0 0 ${24 - i * 6}px rgba(99,179,255,${0.08 - i * 0.02})`,
            animation: `spin ${14 + i * 6}s linear infinite ${i % 2 === 0 ? "" : "reverse"}`,
          }}
        >
          <span
            className="absolute rounded-full"
            style={{
              width: 6,
              height: 6,
              background: `rgba(99,179,255,${0.7 - i * 0.1})`,
              top: -3,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: `0 0 10px 3px rgba(99,179,255,0.4)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function GlowOrb({ mouse }: { mouse: MousePosition }) {
  const clampedX = Math.max(0, Math.min(1, mouse.x));
  const clampedY = Math.max(0, Math.min(1, mouse.y));
  const shiftX = (clampedX - 0.5) * 18;
  const shiftY = (clampedY - 0.5) * 18;

  return (
    <div
      className="absolute rounded-full transition-transform duration-500 ease-out"
      style={{
        width: 200,
        height: 200,
        background:
          "radial-gradient(circle at 38% 38%, rgba(120,200,255,0.28) 0%, rgba(80,140,255,0.18) 45%, rgba(60,100,255,0.06) 70%, transparent 100%)",
        boxShadow:
          "0 0 80px 30px rgba(80,160,255,0.13), 0 0 200px 60px rgba(60,120,255,0.07), inset 0 0 40px rgba(140,200,255,0.1)",
        transform: `translate(${shiftX}px, ${shiftY}px)`,
        filter: "blur(2px)",
      }}
    />
  );
}

function FloatingCard() {
  return (
    <div
      className="floating-card absolute bottom-6 -left-10 rounded-2xl px-5 py-4 backdrop-blur-xl"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,179,255,0.08)",
        minWidth: 180,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(99,179,255,0.15)", border: "1px solid rgba(99,179,255,0.2)" }}
        >
          <Code2 size={14} className="text-blue-300" />
        </span>
        <div>
          <p className="text-xs font-semibold text-white/80 leading-tight">100+ Projects</p>
          <p className="text-[10px] text-white/35 mt-0.5">Shipped to production</p>
        </div>
      </div>
    </div>
  );
}

function FloatingBadge() {
  return (
    <div
      className="floating-badge absolute -top-4 -right-8 rounded-2xl px-4 py-3 backdrop-blur-xl"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,179,255,0.08)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <p className="text-xs font-medium text-white/70">Available for work</p>
      </div>
    </div>
  );
}

function AnimatedParticles({ particles }: { particles: Particle[] }) {
  return (
    <>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `rgba(120,180,255,${p.opacity})`,
            boxShadow: `0 0 ${p.size * 3}px rgba(99,179,255,0.5)`,
            animation: `floatParticle ${p.duration}s ease-in-out infinite ${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const revealOverlayRef = useRef<HTMLDivElement>(null);
  const preRevealRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const orbContainerRef = useRef<HTMLDivElement>(null);
  const ctaBtnsRef = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const gsapCtxRef = useRef<gsap.Context | null>(null);

  const [revealed, setRevealed] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const [mouse, setMouse] = useState<MousePosition>({ x: 0.5, y: 0.5 });
  const [particles] = useState<Particle[]>(generateParticles);
  const rippleIdRef = useRef(0);

  /* ── Mouse tracking ── */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      setMouse({ x: nx, y: ny });

      if (revealed && orbContainerRef.current) {
        gsap.to(orbContainerRef.current, {
          x: (nx - 0.5) * 30,
          y: (ny - 0.5) * 30,
          duration: 1.2,
          ease: "power2.out",
        });
      }
    },
    [revealed]
  );

  /* ── Magnetic CTA buttons ── */
  const handleBtnMouseMove = useCallback((e: MouseEvent, btn: HTMLElement) => {
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: dx * 0.28, y: dy * 0.28, duration: 0.4, ease: "power2.out" });
  }, []);

  const handleBtnMouseLeave = useCallback((btn: HTMLElement) => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
  }, []);

  /* ── Ripple reveal click ── */
  const triggerReveal = useCallback((cx: number, cy: number) => {
    setRevealed(true);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Fade out pre-reveal overlay
      tl.to(preRevealRef.current, {
        opacity: 0,
        duration: 0.55,
        ease: "power2.inOut",
      });

      // Reveal overlay circle wipe
      if (revealOverlayRef.current) {
        const rect = heroRef.current!.getBoundingClientRect();
        const maxR = Math.hypot(Math.max(cx, rect.width - cx), Math.max(cy, rect.height - cy)) * 2.2;
        tl.fromTo(
          revealOverlayRef.current,
          {
            clipPath: `circle(0px at ${cx}px ${cy}px)`,
            opacity: 1,
          },
          {
            clipPath: `circle(${maxR}px at ${cx}px ${cy}px)`,
            opacity: 0,
            duration: 1.15,
            ease: "power4.inOut",
          },
          "<0.1"
        );
      }

      // Show content container
      tl.to(contentRef.current, { opacity: 1, duration: 0.3 }, "<0.3");

      // Stagger left side text elements
      const leftItems = leftRef.current?.querySelectorAll(".reveal-item");
      if (leftItems?.length) {
        tl.fromTo(
          leftItems,
          { y: 48, opacity: 0, filter: "blur(12px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.1,
            duration: 0.85,
            ease: "power3.out",
          },
          "<0.2"
        );
      }

      // Right side orb entrance
      tl.fromTo(
        rightRef.current,
        { opacity: 0, scale: 0.82, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "power3.out" },
        "<0.15"
      );

      // Floating animation for orb container
      gsap.to(orbContainerRef.current, {
        y: -18,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.5,
      });
    }, heroRef);

    gsapCtxRef.current = ctx;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (revealed) return;

      const rect = heroRef.current!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const rid = ++rippleIdRef.current;

      setRipples((prev) => [...prev, { x: cx, y: cy, id: rid }]);

      // Animate the ripple DOM element
      const maxDim = Math.max(rect.width, rect.height);
      const finalSize = maxDim * 2.8;

      setTimeout(() => {
        const el = document.querySelector(`.ripple-wave:last-child`) as HTMLElement | null;
        if (el) {
          gsap.to(el, {
            width: finalSize,
            height: finalSize,
            opacity: 0,
            duration: 1.1,
            ease: "power2.out",
            onComplete: () => setRipples((prev) => prev.filter((r) => r.id !== rid)),
          });
        }
      }, 16);

      // Trigger full reveal after short delay
      setTimeout(() => triggerReveal(cx, cy), 120);
    },
    [revealed, triggerReveal]
  );

  /* ── Mount / unmount ── */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    hero.addEventListener("mousemove", handleMouseMove);

    // Pre-reveal pulse glow
    const pulseCtx = gsap.context(() => {
      gsap.to(".click-glow", {
        boxShadow: "0 0 60px 20px rgba(99,179,255,0.25), 0 0 120px 40px rgba(99,179,255,0.1)",
        duration: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(".click-label", {
        opacity: 0.4,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.2,
      });
    }, heroRef);

    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      pulseCtx.revert();
      gsapCtxRef.current?.revert();
    };
  }, [handleMouseMove]);

  /* ── CTA magnetic listeners ── */
  useEffect(() => {
    if (!revealed) return;
    const handlers: (() => void)[] = [];
    ctaBtnsRef.current.forEach((btn) => {
      if (!btn) return;
      const onMove = (event: Event) => handleBtnMouseMove(event as MouseEvent, btn as HTMLElement);
      const onLeave = () => handleBtnMouseLeave(btn as HTMLElement);
      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", onLeave);
      handlers.push(() => {
        btn.removeEventListener("mousemove", onMove);
        btn.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => handlers.forEach((fn) => fn());
  }, [revealed, handleBtnMouseMove, handleBtnMouseLeave]);

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <>
      {/* Global keyframes injected once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap');

        @keyframes floatParticle {
          0%,100% { transform: translateY(0) scale(1); opacity: var(--op, 0.3); }
          50% { transform: translateY(-22px) scale(1.3); opacity: calc(var(--op, 0.3) * 1.6); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 8px rgba(99,179,255,0.25), inset 0 0 8px rgba(99,179,255,0.06); }
          50% { box-shadow: 0 0 22px rgba(99,179,255,0.55), 0 0 44px rgba(60,140,255,0.2), inset 0 0 14px rgba(99,179,255,0.1); }
        }
        @keyframes pulseRing {
          0% { transform: translate(-50%,-50%) scale(0.95); opacity:0.7; }
          100% { transform: translate(-50%,-50%) scale(1.55); opacity:0; }
        }
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }
        .cta-primary:hover { animation: borderGlow 1.5s ease infinite; }
        .cta-secondary:hover { animation: borderGlow 1.5s ease infinite; }
      `}</style>

      <div
        ref={heroRef}
        className="relative w-full overflow-hidden font-syne"
        style={{
          minHeight: "100svh",
          background: "linear-gradient(135deg, #050507 0%, #080912 40%, #060810 70%, #040406 100%)",
cursor: revealed ? "default" : "none"        }}
        onClick={!revealed ? handleClick : undefined}
        role="main"
        aria-label="Hero section"
      >
        {/* ── Background layers ── */}
        <NoiseTexture />
        <GridLines />

        {/* Radial ambient lights */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "20%",
            left: "60%",
            width: 600,
            height: 600,
            background: "radial-gradient(ellipse, rgba(40,90,200,0.07) 0%, transparent 70%)",
            transform: "translate(-50%,-50%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "70%",
            left: "20%",
            width: 400,
            height: 400,
            background: "radial-gradient(ellipse, rgba(60,40,180,0.05) 0%, transparent 70%)",
            transform: "translate(-50%,-50%)",
          }}
        />

        {/* Scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.018]"
          aria-hidden
        >
          <div
            className="absolute w-full h-0.5"
            style={{
              background: "rgba(120,180,255,0.6)",
              animation: "scanline 8s linear infinite",
            }}
          />
        </div>

        {/* Ripple waves */}
        <RippleCanvas ripples={ripples} />

        {/* ── Reveal overlay (circle-wipe mask) ── */}
        <div
          ref={revealOverlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #050507 0%, #08091a 100%)",
            zIndex: 30,
            opacity: 0,
          }}
          aria-hidden
        />

        {/* ══════════════════════════════════════
            PRE-REVEAL SCREEN
        ══════════════════════════════════════ */}
        <div
          ref={preRevealRef}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 select-none"
          style={{ pointerEvents: revealed ? "none" : "auto" }}
          aria-hidden={revealed}
        >
          {/* Custom dot cursor */}
          {!revealed && (
            <div
              className="fixed pointer-events-none z-50 transition-transform duration-100"
              style={{
                left: mouse.x * (typeof window !== "undefined" ? window.innerWidth : 0),
                top: mouse.y * (typeof window !== "undefined" ? window.innerHeight : 0),
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "rgba(99,179,255,0.9)", boxShadow: "0 0 12px 4px rgba(99,179,255,0.4)" }}
              />
            </div>
          )}

          {/* Mouse distortion halo */}
          <div
            className="absolute rounded-full pointer-events-none transition-all duration-300"
            style={{
              left: `${mouse.x * 100}%`,
              top: `${mouse.y * 100}%`,
              width: 200,
              height: 200,
              transform: "translate(-50%,-50%)",
              background: "radial-gradient(circle, rgba(99,179,255,0.04) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          {/* Central click-to-reveal */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Pulsing rings */}
            <div className="relative flex items-center justify-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="absolute rounded-full border border-blue-400/20"
                  style={{
                    width: 90 + i * 44,
                    height: 90 + i * 44,
                    left: "50%",
                    top: "50%",
                    animation: `pulseRing ${2.4 + i * 0.7}s ease-out infinite ${i * 0.5}s`,
                  }}
                />
              ))}

              {/* Central icon */}
              <div
                className="click-glow relative w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                style={{
                  background: "linear-gradient(135deg, rgba(99,179,255,0.12) 0%, rgba(60,120,255,0.06) 100%)",
                  border: "1px solid rgba(99,179,255,0.25)",
                  boxShadow: "0 0 30px 8px rgba(99,179,255,0.1)",
                }}
              >
                <Sparkles size={26} className="text-blue-300" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p
                className="click-label font-mono-dm text-xs tracking-[0.35em] uppercase text-blue-300/60"
              >
                Click anywhere
              </p>
              <p className="font-syne text-lg font-semibold text-white/20 tracking-wide">
                to reveal
              </p>
            </div>
          </div>

          {/* Skeleton placeholders */}
          <div className="absolute inset-0 flex items-center justify-between px-12 lg:px-24 pointer-events-none opacity-[0.06]">
            <div className="flex flex-col gap-4 w-2/5 max-w-md">
              {[180, 260, 120, 100, 80].map((w, i) => (
                <div
                  key={i}
                  className="rounded-lg animate-pulse"
                  style={{
                    width: w,
                    height: i < 2 ? 22 : 14,
                    background: "rgba(120,160,255,0.15)",
                  }}
                />
              ))}
              <div className="flex gap-3 mt-4">
                <div className="rounded-xl animate-pulse" style={{ width: 120, height: 40, background: "rgba(120,160,255,0.15)" }} />
                <div className="rounded-xl animate-pulse" style={{ width: 100, height: 40, background: "rgba(120,160,255,0.1)" }} />
              </div>
            </div>
            <div
              className="rounded-3xl animate-pulse hidden lg:block"
              style={{ width: 340, height: 340, background: "rgba(100,140,255,0.08)" }}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════
            POST-REVEAL CONTENT
        ══════════════════════════════════════ */}
        <div
          ref={contentRef}
          className="relative z-10 flex items-center min-h-svh w-full px-6 sm:px-10 lg:px-20 xl:px-28"
          style={{ opacity: 0 }}
          aria-hidden={!revealed}
        >
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center py-24">

            {/* ── LEFT SIDE ── */}
            <div ref={leftRef} className="flex flex-col gap-6 lg:gap-7">
              {/* Eyebrow */}
              <div className="reveal-item flex items-center gap-3" style={{ opacity: 0 }}>
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono-dm text-[10px] tracking-widest uppercase"
                  style={{
                    background: "rgba(99,179,255,0.08)",
                    border: "1px solid rgba(99,179,255,0.2)",
                    color: "rgba(99,179,255,0.75)",
                  }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400" />
                  </span>
                  Portfolio 2025
                </span>
              </div>

              {/* Heading */}
              <div className="reveal-item flex flex-col gap-1" style={{ opacity: 0 }}>
                <p
                  className="font-mono-dm text-sm tracking-[0.2em] uppercase"
                  style={{ color: "rgba(99,179,255,0.5)" }}
                >
                  Hi, I&apos;m
                </p>
                <h1
                  className="font-syne font-extrabold leading-none tracking-tight"
                  style={{
                    fontSize: "clamp(2.6rem, 6vw, 5rem)",
                    background: "linear-gradient(135deg, #ffffff 0%, rgba(180,210,255,0.85) 60%, rgba(99,160,255,0.7) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Your Name
                </h1>
              </div>

              {/* Role */}
              <div className="reveal-item" style={{ opacity: 0 }}>
                <h2
                  className="font-syne font-semibold leading-tight"
                  style={{
                    fontSize: "clamp(1.1rem, 2.4vw, 1.8rem)",
                    color: "rgba(180,210,255,0.65)",
                  }}
                >
                  Creative Frontend{" "}
                  <span
                    style={{
                      background: "linear-gradient(90deg, #63b3ff, #a78bfa)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Developer
                  </span>
                </h2>
              </div>

              {/* Description */}
              <div className="reveal-item max-w-md" style={{ opacity: 0 }}>
                <p
                  className="font-mono-dm font-light leading-relaxed"
                  style={{ fontSize: "clamp(0.82rem, 1.2vw, 0.95rem)", color: "rgba(180,200,240,0.42)" }}
                >
                  I craft immersive digital experiences where precision engineering
                  meets intentional design — shipping interfaces that feel{" "}
                  <span style={{ color: "rgba(99,179,255,0.65)" }}>alive</span>.
                </p>
              </div>

              {/* Stats row */}
              <div className="reveal-item flex gap-6 sm:gap-8" style={{ opacity: 0 }}>
                {[
                  { val: "5+", label: "Years exp." },
                  { val: "80+", label: "Projects" },
                  { val: "40+", label: "Clients" },
                ].map(({ val, label }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span
                      className="font-syne font-bold text-2xl"
                      style={{
                        background: "linear-gradient(135deg, #fff 0%, rgba(99,179,255,0.8) 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {val}
                    </span>
                    <span className="font-mono-dm text-[10px] tracking-widest uppercase" style={{ color: "rgba(180,200,240,0.35)" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="reveal-item flex flex-wrap gap-4 mt-1" style={{ opacity: 0 }}>
                <button
                  ref={(el) => { ctaBtnsRef.current[0] = el; }}
                  className="cta-primary group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-syne font-semibold text-sm overflow-hidden transition-transform active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, rgba(99,179,255,0.18) 0%, rgba(60,120,255,0.12) 100%)",
                    border: "1px solid rgba(99,179,255,0.3)",
                    color: "rgba(180,220,255,0.9)",
                    boxShadow: "0 4px 24px rgba(60,120,255,0.15), inset 0 1px 0 rgba(255,255,255,0.07)",
                  }}
                  aria-label="View Projects"
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    <Layers size={15} />
                    View Projects
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                  {/* Shimmer overlay */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
                    }}
                  />
                </button>

                <button
                  ref={(el) => { ctaBtnsRef.current[1] = el; }}
                  className="cta-secondary group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-syne font-semibold text-sm overflow-hidden transition-transform active:scale-95"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(200,210,240,0.6)",
                  }}
                  aria-label="Contact Me"
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    <Mail size={15} />
                    Contact Me
                  </span>
                </button>
              </div>

              {/* Social links */}
              <div className="reveal-item flex items-center gap-4 mt-2" style={{ opacity: 0 }}>
                {[
                  { Icon: ExternalLink, label: "GitHub" },
                  { Icon: Link2, label: "LinkedIn" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    ref={(el) => { ctaBtnsRef.current[ctaBtnsRef.current.length] = el; }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(180,200,240,0.45)",
                    }}
                    aria-label={label}
                  >
                    <Icon size={16} />
                  </a>
                ))}
                <span
                  className="font-mono-dm text-[10px] tracking-widest uppercase ml-1"
                  style={{ color: "rgba(180,200,240,0.2)" }}
                >
                  Find me online
                </span>
              </div>
            </div>

            {/* ── RIGHT SIDE ── */}
            <div
              ref={rightRef}
              className="relative flex items-center justify-center"
              style={{ minHeight: 380, opacity: 0 }}
            >
              <div ref={orbContainerRef} className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                {/* Outer ambient glow */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(ellipse, rgba(40,100,255,0.08) 0%, transparent 70%)",
                    filter: "blur(30px)",
                    transform: "scale(1.5)",
                  }}
                />

                {/* Rotating rings */}
                <RotatingRings />

                {/* Main orb */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <GlowOrb mouse={mouse} />
                </div>

                {/* Center glassmorphism disc */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ zIndex: 4 }}
                >
                  <div
                    className="relative rounded-3xl backdrop-blur-2xl flex items-center justify-center"
                    style={{
                      width: 110,
                      height: 110,
                      background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      boxShadow: "0 16px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,179,255,0.1)",
                    }}
                  >
                    <Code2 size={36} style={{ color: "rgba(120,190,255,0.85)" }} />
                    {/* Inner shimmer */}
                    <div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
                      }}
                    />
                  </div>
                </div>

                {/* Floating particles within orb area */}
                <div className="absolute inset-0 overflow-hidden rounded-full" style={{ zIndex: 3 }}>
                  <AnimatedParticles particles={particles.slice(0, 16)} />
                </div>

                {/* Floating glassmorphism card — bottom-left */}
                <div style={{ position: "absolute", bottom: -16, left: -36, zIndex: 10 }}>
                  <FloatingCard />
                </div>

                {/* Availability badge — top-right */}
                <div style={{ position: "absolute", top: -8, right: -32, zIndex: 10 }}>
                  <FloatingBadge />
                </div>

                {/* Tech stack chip row */}
                <div
                  className="absolute -bottom-12 left-1/2 flex gap-2"
                  style={{ transform: "translateX(-50%)", zIndex: 10 }}
                >
                  {["React", "TS", "GSAP", "Next"].map((tech) => (
                    <span
                      key={tech}
                      className="font-mono-dm text-[9px] tracking-wider px-2.5 py-1 rounded-lg"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(140,180,255,0.55)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Far background particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                <AnimatedParticles particles={particles.slice(16)} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom gradient fade ── */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(5,5,7,0.6))",
            zIndex: 5,
          }}
        />

        {/* ── Scroll hint ── */}
        {revealed && (
          <div
            className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 z-20"
            style={{ transform: "translateX(-50%)" }}
          >
            <p className="font-mono-dm text-[9px] tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.18)" }}>
              Scroll
            </p>
            <div
              className="w-px h-10 rounded-full"
              style={{
                background: "linear-gradient(to bottom, rgba(99,179,255,0.35), transparent)",
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
