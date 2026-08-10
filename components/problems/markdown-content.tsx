import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children }) => (
    <h2 className="mt-10 border-b border-slate-200 pb-2 text-xl font-semibold tracking-tight text-slate-950 first:mt-0">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 className="mt-8 text-lg font-semibold text-slate-950">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-6 font-semibold text-slate-900">{children}</h4>
  ),
  p: ({ children }) => <p className="mt-3 leading-7 text-slate-700">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-3 list-decimal space-y-1 pl-6 text-slate-700">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-4 border-sky-300 bg-sky-50 px-4 py-2 text-slate-700">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      className="font-medium text-sky-800 underline decoration-sky-300 hover:decoration-sky-700"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-900">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-slate-300 bg-slate-100 px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-slate-300 px-3 py-2 text-slate-700">{children}</td>
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="min-w-0">
      <Markdown components={components} remarkPlugins={[remarkGfm]} skipHtml>
        {content}
      </Markdown>
    </div>
  );
}
