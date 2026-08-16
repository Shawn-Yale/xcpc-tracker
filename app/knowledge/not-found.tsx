import Link from "next/link";

export default function KnowledgeNotFound() {
  return <div className="py-16 text-center"><h1 className="text-2xl font-semibold">找不到知识点</h1><Link className="mt-4 inline-flex text-sky-800 underline" href="/knowledge">返回知识分类</Link></div>;
}
