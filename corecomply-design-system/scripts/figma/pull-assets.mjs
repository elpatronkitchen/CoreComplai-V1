import fs from "fs/promises";
import path from "path";

const TOKEN = process.env.FIGMA_TOKEN;
const FILE = process.env.FIGMA_FILE_KEY;

if (!TOKEN || !FILE) { 
  console.error("FIGMA_TOKEN / FIGMA_FILE_KEY missing"); 
  process.exit(1); 
}

const api = (u) => fetch(`https://api.figma.com/v1${u}`, {
  headers: { "X-FIGMA-TOKEN": TOKEN } 
}).then(r => r.json());

const ensure = (p) => fs.mkdir(p, { recursive: true });

const walk = (n, a = []) => { 
  if (!n) return a; 
  if (n.name?.startsWith("Icon/") || n.name?.startsWith("Logo/")) a.push({ id: n.id, name: n.name });
  (n.children || []).forEach(c => walk(c, a)); 
  return a; 
};

const file = await api(`/files/${FILE}`); 
const nodes = walk(file.document, []);
const icons = nodes.filter(n => n.name.startsWith("Icon/"));
const logos = nodes.filter(n => n.name.startsWith("Logo/"));

await ensure("design/icons/svg"); 
await ensure("design/logos/png");

const dl = async (arr, fmt, out) => {
  if (arr.length === 0) return;
  const ids = arr.map(a => a.id).join(",");
  const q = fmt === "png" ? "&format=png&scale=2" : "&format=svg";
  const res = await api(`/images/${FILE}?ids=${encodeURIComponent(ids)}${q}`);
  for (const [id, url] of Object.entries(res.images || {})) {
    const name = (arr.find(a => a.id === id)?.name || "asset").replace(/[^\w-]+/g, "_").replace(/\//g, "-");
    const bin = await fetch(url).then(r => r.arrayBuffer());
    await fs.writeFile(path.join(out, `${name}.${fmt}`), Buffer.from(bin));
  }
};

await dl(icons, "svg", "design/icons/svg");
await dl(logos, "png", "design/logos/png");

console.log(`Exported ${icons.length} icon(s), ${logos.length} logo(s).`);
