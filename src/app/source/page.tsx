import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

function getAllFiles(dir: string, base: string = ""): { path: string; content: string }[] {
  const results: { path: string; content: string }[] = [];
  const items = readdirSync(dir);
  for (const item of items) {
    if (["node_modules", ".next", ".git", ".env"].includes(item)) continue;
    const fullPath = join(dir, item);
    const relativePath = base ? `${base}/${item}` : item;
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...getAllFiles(fullPath, relativePath));
    } else if (
      item.endsWith(".ts") || item.endsWith(".tsx") || item.endsWith(".css") ||
      item.endsWith(".json") || item.endsWith(".mjs") || item.endsWith(".js")
    ) {
      try {
        const content = readFileSync(fullPath, "utf-8");
        results.push({ path: relativePath, content });
      } catch {}
    }
  }
  return results;
}

export default function SourcePage() {
  const files = getAllFiles("/app");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-2">📋 APnova — All Source Files</h1>
      <p className="text-slate-400 text-sm mb-2">
        For each file below: go to GitHub → <strong>Add file</strong> → <strong>Create new file</strong> → type the file path → paste the code → <strong>Commit</strong>
      </p>
      <p className="text-amber-400 text-xs mb-8">
        ⚠️ Create files in this exact order (top to bottom). The file path goes in the filename box at the top — 
        typing <code>src/db/schema.ts</code> auto-creates the folders.
      </p>

      <div className="text-sm text-slate-500 mb-6">Total files: {files.length}</div>

      <div className="space-y-6">
        {files.map((file, i) => (
          <div key={file.path} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 bg-white/[0.06] w-7 h-7 rounded-lg flex items-center justify-center">{i + 1}</span>
                <code className="text-sm font-bold text-brand-300">{file.path}</code>
              </div>
            </div>
            <pre className="p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
              {file.content}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-brand-600/10 border border-brand-500/20">
        <h2 className="font-bold text-lg mb-2">🎯 Don&apos;t forget!</h2>
        <p className="text-sm text-slate-300 mb-3">After creating all files on GitHub, also create a <code>.env</code> file with:</p>
        <pre className="p-3 rounded-lg bg-black/30 text-xs text-emerald-300 select-all">DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db</pre>
        <p className="text-xs text-slate-500 mt-2">(You&apos;ll change this to your real database URL when you deploy on Vercel)</p>
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <h2 className="font-bold text-lg mb-2">📱 iPad Tips</h2>
        <ul className="text-sm text-slate-400 space-y-2">
          <li>• <strong>To select all code:</strong> Tap on the code block, then tap <strong>&quot;Select All&quot;</strong></li>
          <li>• <strong>To copy:</strong> After selecting, tap <strong>&quot;Copy&quot;</strong></li>
          <li>• <strong>On GitHub:</strong> Tap &quot;Add file&quot; → &quot;Create new file&quot; → type the file path (like <code>src/app/page.tsx</code>) → paste → Commit</li>
          <li>• <strong>Folders auto-create</strong> when you type <code>/</code> in the filename</li>
        </ul>
      </div>
    </div>
  );
}
