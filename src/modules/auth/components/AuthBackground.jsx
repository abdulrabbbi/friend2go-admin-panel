import React, { useEffect, useRef } from "react";

// Animated neon gradient blobs + starfield sparkles.
// No external libs — pure CSS + a bit of JS for gentle parallax.

export default function AuthBackground() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      el.style.setProperty("--rx", `${dy * 6}deg`);
      el.style.setProperty("--ry", `${-dx * 6}deg`);
      el.style.setProperty("--tx", `${-dx * 10}px`);
      el.style.setProperty("--ty", `${-dy * 10}px`);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* gradient blobs */}
      <div
        className="absolute w-[60vw] h-[60vw] rounded-full blur-3xl opacity-30 animate-[float_22s_ease-in-out_infinite]"
        style={{
          left: "-10vw",
          top: "-10vh",
          background:
            "radial-gradient(60% 60% at 50% 50%, #a8ff1a 0%, rgba(168,255,26,.15) 45%, transparent 70%)",
          transform: "translateZ(-200px) rotateX(var(--rx)) rotateY(var(--ry))",
        }}
      />
      <div
        className="absolute w-[50vw] h-[50vw] rounded-full blur-3xl opacity-20 animate-[float_26s_ease-in-out_infinite]"
        style={{
          right: "-15vw",
          bottom: "-15vh",
          background:
            "radial-gradient(60% 60% at 50% 50%, #7dd3fc 0%, rgba(125,211,252,.12) 45%, transparent 70%)",
          transform: "translateZ(-180px) rotateX(var(--rx)) rotateY(var(--ry))",
        }}
      />
      {/* stars */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.35) 50%, transparent 51%), radial-gradient(1px 1px at 80% 70%, rgba(255,255,255,.25) 50%, transparent 51%), radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,.25) 50%, transparent 51%)",
          backgroundSize: "auto",
          transform: "translateZ(-300px)",
          opacity: 0.5,
          animation: "twinkle 8s linear infinite",
        }}
      />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) }
          50% { transform: translateY(-20px) translateX(10px) }
        }
        @keyframes twinkle {
          0%, 100% { opacity: .5 }
          50% { opacity: .8 }
        }
      `}</style>
    </div>
  );
}
