export default function ProgressBar({ step, progress, stepsLength, accent }) {
  return (
    <div className="mt-3 h-1 w-full overflow-hidden rounded" style={{ background: '#111c31' }}>
      <div style={{ width: `${((step + progress) / stepsLength) * 100}%`, background: accent, height: '100%' }} />
    </div>
  );
}
