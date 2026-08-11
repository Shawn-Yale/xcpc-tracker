import Link from "next/link";

export default function KnowledgeNotFound() {
  return <div className="py-16 text-center"><h1 className="text-2xl font-semibold">Knowledge node not found</h1><Link className="mt-4 inline-flex text-sky-800 underline" href="/knowledge">返回 Knowledge</Link></div>;
}
