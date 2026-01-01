export default function Toast({ text, kind = "info" }) {
  const bg =
    kind === "success"
      ? "linear-gradient(135deg, #2fbf71, #1fa463)"
      : kind === "error"
      ? "linear-gradient(135deg, #e5533d, #c63b28)"
      : "linear-gradient(135deg, #0b5ed7, #2a7fff)";

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        background: bg,
        color: "#fff",
        padding: "12px 16px",
        borderRadius: 16,
        boxShadow: "0 14px 35px rgba(0,0,0,0.25)",
        fontWeight: 900,
        maxWidth: 320,
        animation: "toast-in 0.25s ease-out",
      }}
    >
      {text}

      {/* animation inline pour éviter CSS externe */}
      <style>{`
          @keyframes toast-in {
            from {
              transform: translateY(-10px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
    </div>
  );
}
