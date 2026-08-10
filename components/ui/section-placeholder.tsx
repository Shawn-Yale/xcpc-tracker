type SectionPlaceholderProps = {
  title: string;
  description: string;
  nextStep: string;
};

export function SectionPlaceholder({
  title,
  description,
  nextStep,
}: SectionPlaceholderProps) {
  return (
    <section aria-labelledby="page-title" className="max-w-3xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
        MVP foundation
      </p>
      <h1
        className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
        id="page-title"
      >
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>

      <div className="mt-8 border-l-4 border-sky-700 bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-900">Planned next step</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{nextStep}</p>
      </div>
    </section>
  );
}
