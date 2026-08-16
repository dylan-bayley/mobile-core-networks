export default function GlossaryTermButton({ termKey, active, onOpen, children }) {
  return (
    <button
      type="button"
      onClick={(e) => onOpen(termKey, e.currentTarget)}
      aria-haspopup="dialog"
      aria-expanded={active}
      className="cursor-help decoration-dotted underline underline-offset-2"
      style={{ color: 'inherit', background: 'none', border: 0, padding: 0, font: 'inherit' }}
    >
      {children}
    </button>
  );
}
