import { MUTED, TEXT } from '../theme.js';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-16 text-center">
      <h1 tabIndex={-1} className="text-2xl font-semibold" style={{ color: TEXT }}>
        That page doesn’t exist
      </h1>
      <p className="mt-2" style={{ color: MUTED }}>
        The link may be out of date. <a href="#/" className="underline">Go to the start</a> or{' '}
        <a href="#/components" className="underline">browse the components</a>.
      </p>
    </div>
  );
}
