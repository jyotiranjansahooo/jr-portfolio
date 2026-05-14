"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Download, Mail, Menu, X, Leaf } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  visible: boolean;
}

interface NavLink {
  label: string;
  href: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_LINKS: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
];

// ─── Toast Hook ───────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message: string) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, visible: true }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      );
    }, 2800);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  return { toasts, addToast };
}

// ─── Toast Renderer ───────────────────────────────────────────────────────────

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`
            flex items-center gap-3 px-5 py-3.5
            rounded-2xl shadow-2xl pointer-events-auto
            border border-[#5a7a4a]/30
            bg-[#1a2a14]/90 backdrop-blur-xl
            text-[#d4e8c2] text-sm font-medium tracking-wide
            transition-all duration-500 ease-out
            ${toast.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}
          `}
          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#5a9a3a]/30">
            <Leaf size={13} className="text-[#8fcf6a]" />
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

// ─── Main Navbar Component ────────────────────────────────────────────────────

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const underlinesRef = useRef<(HTMLSpanElement | null)[]>([]);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnimating, setMenuAnimating] = useState(false);

  const { toasts, addToast } = useToast();
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);

  // ── Entrance animation on mount ──────────────────────────────────────────

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 }
      )
        .fromTo(
          logoRef.current,
          { x: -24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6 },
          "-=0.5"
        )
        .fromTo(
          linksRef.current?.children ?? [],
          { y: -16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
          "-=0.4"
        )
        .fromTo(
          actionsRef.current?.children ?? [],
          { y: -16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
          "-=0.35"
        );
    }, navRef);

    return () => ctx.revert();
  }, []);

  // ── Scroll handler ────────────────────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Mobile menu GSAP timeline ─────────────────────────────────────────────

  const buildMenuTimeline = useCallback(() => {
    if (!mobileMenuRef.current || !menuItemsRef.current) return;

    const tl = gsap.timeline({ paused: true });
    const items = menuItemsRef.current.querySelectorAll("[data-menu-item]");

    tl.fromTo(
      mobileMenuRef.current,
      { opacity: 0, y: -12, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: "power3.out" }
    ).fromTo(
      items,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, stagger: 0.07, ease: "power2.out" },
      "-=0.2"
    );

    return tl;
  }, []);

  useEffect(() => {
    menuTlRef.current = buildMenuTimeline() ?? null;
  }, [buildMenuTimeline]);

  const toggleMenu = useCallback(() => {
    if (menuAnimating) return;

    if (!menuOpen) {
      setMenuOpen(true);
      setMenuAnimating(true);

      // Rebuild in case DOM just mounted
      setTimeout(() => {
        menuTlRef.current = buildMenuTimeline() ?? null;
        menuTlRef.current?.play().then(() => setMenuAnimating(false));
      }, 10);

      // Animate hamburger → X
      if (hamburgerRef.current) {
        gsap.to(hamburgerRef.current, {
          rotation: 180,
          duration: 0.35,
          ease: "back.out(1.5)",
        });
      }
    } else {
      setMenuAnimating(true);
      menuTlRef.current?.reverse().then(() => {
        setMenuOpen(false);
        setMenuAnimating(false);
      });

      if (hamburgerRef.current) {
        gsap.to(hamburgerRef.current, {
          rotation: 0,
          duration: 0.35,
          ease: "back.out(1.5)",
        });
      }
    }
  }, [menuOpen, menuAnimating, buildMenuTimeline]);

  // ── Close menu on ESC ─────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) toggleMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, toggleMenu]);

  // ── Link underline hover ──────────────────────────────────────────────────

  const handleLinkEnter = (i: number) => {
    const el = underlinesRef.current[i];
    if (!el) return;
    gsap.to(el, { scaleX: 1, duration: 0.28, ease: "power2.out", transformOrigin: "left center" });
  };

  const handleLinkLeave = (i: number) => {
    const el = underlinesRef.current[i];
    if (!el) return;
    gsap.to(el, { scaleX: 0, duration: 0.22, ease: "power2.in", transformOrigin: "right center" });
  };

  // ── Button press micro-animation ──────────────────────────────────────────

  const handleButtonPress = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.93 },
      { scale: 1, duration: 0.35, ease: "elastic.out(1.2, 0.5)" }
    );
  };

  // ── CV download ───────────────────────────────────────────────────────────

  const handleDownloadCV = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleButtonPress(e);

    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("CV download completed");
  };

  // ── Button hover glow ─────────────────────────────────────────────────────

  const handleBtnHoverEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1.05, duration: 0.22, ease: "power2.out" });
  };

  const handleBtnHoverLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.22, ease: "power2.out" });
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Navbar ── */}
      <nav
        ref={navRef}
        role="navigation"
        aria-label="Main navigation"
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500 ease-out
          ${scrolled
            ? "py-3 bg-[#0f2808]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(15,40,8,0.45)] border-b border-[#5a9a3a]/15"
            : "py-5 bg-transparent"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between">

          {/* ── Logo ── */}
          <div ref={logoRef} className="flex items-center gap-2.5 select-none">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-[#5a9a3a]/80 to-[#2a5a18]/90 shadow-[0_2px_12px_rgba(90,154,58,0.35)]">
              <Leaf size={17} className="text-[#d4e8c2]" />
              <span className="absolute inset-0 rounded-xl ring-1 ring-[#8fcf6a]/25" />
            </div>
            <span
              className="text-[1.35rem] font-semibold tracking-[-0.01em] text-[#d4e8c2]"
              style={{ fontFamily: "var(--font-cormorant), serif", letterSpacing: "-0.01em" }}
            >
              devfolio
              <span className="text-[#8fcf6a]">.</span>
            </span>
          </div>

          {/* ── Desktop nav links ── */}
          <div
            ref={linksRef}
            className="hidden md:flex items-center gap-8"
          >
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className="relative group py-1 text-[0.9rem] font-medium text-[#a8d18a]/80 hover:text-[#d4e8c2] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fcf6a]/60 focus-visible:ring-offset-1 rounded"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif", letterSpacing: "0.01em" }}
                onMouseEnter={() => handleLinkEnter(i)}
                onMouseLeave={() => handleLinkLeave(i)}
              >
                {link.label}
                <span
                  ref={(el) => { underlinesRef.current[i] = el; }}
                  className="absolute bottom-0 left-0 right-0 h-px rounded-full bg-linear-to-r from-[#8fcf6a] to-[#5a9a3a]/60"
                  style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>

          {/* ── Desktop action buttons ── */}
          <div
            ref={actionsRef}
            className="hidden md:flex items-center gap-3"
          >
            {/* Download CV */}
            <button
              onClick={handleDownloadCV}
              onMouseEnter={handleBtnHoverEnter}
              onMouseLeave={handleBtnHoverLeave}
              aria-label="Download CV as PDF"
              className="
                group relative flex items-center gap-2 px-4 py-2.5
                rounded-xl text-[0.82rem] font-medium tracking-wide
                text-[#a8d18a] border border-[#5a9a3a]/40
                hover:border-[#8fcf6a]/60 hover:text-[#d4e8c2]
                hover:bg-[#5a9a3a]/10 hover:shadow-[0_0_18px_rgba(90,154,58,0.2)]
                transition-all duration-250 ease-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fcf6a]/60 focus-visible:ring-offset-1
                active:scale-[0.96]
              "
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              <Download size={14} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
              Download CV
            </button>

            {/* Contact */}
            <button
              onMouseEnter={handleBtnHoverEnter}
              onMouseLeave={handleBtnHoverLeave}
              onClick={handleButtonPress}
              aria-label="Contact me"
              className="
                relative flex items-center gap-2 px-5 py-2.5
                rounded-xl text-[0.82rem] font-semibold tracking-wide
                text-[#1a3d10]
                bg-linear-to-br from-[#8fcf6a] via-[#6ab84e] to-[#4a9630]
                shadow-[0_2px_16px_rgba(90,154,58,0.35)]
                hover:shadow-[0_4px_24px_rgba(90,154,58,0.5)]
                hover:brightness-110
                transition-all duration-250 ease-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fcf6a]/80 focus-visible:ring-offset-1
                active:scale-[0.96]
                overflow-hidden
              "
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              {/* shine sweep */}
              <span
                className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                aria-hidden="true"
              />
              <Mail size={14} />
              Contact
            </button>
          </div>

          {/* ── Hamburger (mobile) ── */}
          <button
            ref={hamburgerRef}
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="
              md:hidden relative flex items-center justify-center w-10 h-10
              rounded-xl border border-[#5a9a3a]/30 text-[#a8d18a]
              hover:border-[#8fcf6a]/50 hover:text-[#d4e8c2] hover:bg-[#5a9a3a]/10
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fcf6a]/60
            "
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile dropdown menu ── */}
        {menuOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="
              md:hidden absolute top-full left-0 right-0
              mx-4 mt-2 rounded-2xl overflow-hidden
              bg-[#0f2808]/95 backdrop-blur-2xl
              border border-[#5a9a3a]/20
              shadow-[0_16px_48px_rgba(10,25,6,0.7)]
            "
            style={{ opacity: 0 }}
          >
            <div ref={menuItemsRef} className="flex flex-col px-5 py-6 gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  data-menu-item
                  href={link.href}
                  onClick={toggleMenu}
                  className="
                    group flex items-center justify-between
                    px-4 py-3.5 rounded-xl
                    text-[1rem] font-medium text-[#a8d18a]/80
                    hover:text-[#d4e8c2] hover:bg-[#5a9a3a]/12
                    transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fcf6a]/60
                  "
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  {link.label}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8fcf6a]/40 group-hover:bg-[#8fcf6a] transition-colors duration-200" />
                </a>
              ))}

              {/* Divider */}
              <div className="my-2 h-px bg-linear-to-r from-transparent via-[#5a9a3a]/25 to-transparent" data-menu-item />

              {/* Mobile: Download CV */}
              <button
                data-menu-item
                onClick={(e) => { handleDownloadCV(e); toggleMenu(); }}
                aria-label="Download CV as PDF"
                className="
                  flex items-center gap-3 px-4 py-3.5 rounded-xl
                  text-[0.9rem] font-medium text-[#a8d18a]
                  border border-[#5a9a3a]/30
                  hover:border-[#8fcf6a]/50 hover:text-[#d4e8c2] hover:bg-[#5a9a3a]/10
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fcf6a]/60
                "
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                <Download size={16} />
                Download CV
              </button>

              {/* Mobile: Contact */}
              <button
                data-menu-item
                onClick={(e) => { handleButtonPress(e); toggleMenu(); }}
                aria-label="Contact me"
                className="
                  flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl mt-1
                  text-[0.9rem] font-semibold text-[#1a3d10]
                  bg-linear-to-br from-[#8fcf6a] via-[#6ab84e] to-[#4a9630]
                  shadow-[0_2px_16px_rgba(90,154,58,0.3)]
                  hover:brightness-110 hover:shadow-[0_4px_20px_rgba(90,154,58,0.45)]
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fcf6a]/80
                "
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                <Mail size={16} />
                Contact
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Toast notifications ── */}
      <ToastContainer toasts={toasts} />
    </>
  );
}