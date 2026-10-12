import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ParticlesBackground = ({ className = "" }) => {
  const [init, setInit] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // Synchronize with document.documentElement .dark class changes
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDark();

    const observer = new MutationObserver(() => {
      checkDark();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!init) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {/* ── Ambient Glows in Purple & Blue for Dark, Light Tone for Light ── */}
      {isDark ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none transition-all duration-700" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none transition-all duration-700" />
          <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none transition-all duration-700" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/35 rounded-full blur-[140px] pointer-events-none transition-all duration-700" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-200/35 rounded-full blur-[140px] pointer-events-none transition-all duration-700" />
          <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none transition-all duration-700" />
        </>
      )}

      {/* ── Dynamic tsparticles with Theme Colors ──────────────────────── */}
      <Particles
        key={isDark ? "particles-dark" : "particles-light"}
        id="tsparticles"
        className="absolute inset-0 pointer-events-auto"
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "grab",
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 140,
                links: {
                  opacity: isDark ? 0.45 : 0.35,
                },
              },
            },
          },
          particles: {
            color: {
              value: isDark
                ? ["#a855f7", "#3b82f6", "#8b5cf6", "#60a5fa", "#c084fc"]
                : ["#94a3b8", "#64748b", "#818cf8", "#cbd5e1"],
            },
            links: {
              color: isDark ? "#8b5cf6" : "#94a3b8",
              distance: 140,
              enable: true,
              opacity: isDark ? 0.25 : 0.18,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1.2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 75,
            },
            opacity: {
              value: isDark ? 0.45 : 0.3,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1.5, max: 3.5 },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
};

export default ParticlesBackground;
