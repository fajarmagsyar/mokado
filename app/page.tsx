"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { DecorBg } from "@/components/ui/DecorBg";
import { MokadoIcon } from "@/components/ui/MokadoIcon";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 } as never,
  },
};

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--cream)" }}
    >
      <DecorBg />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-6 w-full max-w-xs"
      >
        {/* Logo mark */}
        <motion.div
          variants={item}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              ease: "easeInOut",
              type: "tween",
            }}
          >
            <MokadoIcon size={72} />
          </motion.div>

          <div className="text-center">
            <h1
              style={{
                fontWeight: 900,
                fontSize: 44,
                color: "var(--navy)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              MOKADO
            </h1>
            <p
              style={{
                color: "#059669",
                fontWeight: 800,
                fontSize: 12,
                marginTop: 5,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Modal Kartu Doang!
            </p>
            <p
              style={{
                color: "#9ca3af",
                fontWeight: 600,
                fontSize: 13,
                marginTop: 6,
              }}
            >
              MOKONDO??? MOKADO!!!
            </p>
          </div>
        </motion.div>

        {/* Card container */}
        <motion.div
          variants={item}
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "28px 24px",
            width: "100%",
            boxShadow: "0 8px 32px rgba(26,26,46,0.10)",
          }}
        >
          <div className="flex flex-col gap-3">
            <Link
              href="/join"
              style={{ display: "block", textDecoration: "none" }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, y: 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                style={{
                  background: "var(--red)",
                  borderRadius: 14,
                  padding: "16px 20px",
                  boxShadow: "0 4px 0 var(--red-dark)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 16,
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                Gabung Room
              </motion.div>
            </Link>

            <Link
              href="/dashboard"
              style={{ display: "block", textDecoration: "none" }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, y: 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                style={{
                  background: "#F3F4F6",
                  borderRadius: 14,
                  padding: "16px 20px",
                  boxShadow: "0 4px 0 #D1D5DB",
                  color: "var(--navy)",
                  fontWeight: 800,
                  fontSize: 16,
                  textAlign: "center",
                  cursor: "pointer",
                  border: "2px solid #E5E7EB",
                }}
              >
                Buat Room
              </motion.div>
            </Link>
          </div>

          <p
            style={{
              color: "#9ca3af",
              fontSize: 12,
              fontWeight: 600,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Hanya host yang perlu daftar akun
          </p>
        </motion.div>

        {/* GitHub link */}
        <motion.div variants={item}>
          <a
            href="https://github.com/fajarmagsyar/mokado"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              color: "#6b7280",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: 10,
              border: "2px solid #E5E7EB",
              background: "#fff",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--navy)"
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--navy)"
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#6b7280"
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = "#E5E7EB"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.465-2.381 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            fajarmagsyar/mokado
          </a>
        </motion.div>

        {/* Decorative cards preview */}
        <motion.div variants={item} className="flex gap-3 justify-center">
          {["red", "green", "red"].map((type, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
                delay: i * 0.4,
                type: "tween",
              }}
              style={{
                width: 48,
                height: 68,
                borderRadius: 8,
                background: "#fff",
                boxShadow: "0 3px 12px rgba(0,0,0,0.12)",
                border: `3px solid ${type === "red" ? "var(--red)" : "var(--green)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: type === "red" ? "var(--red)" : "var(--green)",
                  opacity: 0.5,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
