import fs from "fs/promises";

const TOKEN = process.env.FIGMA_TOKEN;
const FILE = process.env.FIGMA_FILE_KEY;

if (!TOKEN || !FILE) { 
  console.error("FIGMA_TOKEN / FIGMA_FILE_KEY missing"); 
  process.exit(1); 
}

const api = (u) => fetch(`https://api.figma.com/v1${u}`, {
  headers: { "X-FIGMA-TOKEN": TOKEN }
}).then(r => r.json());

const data = await api(`/files/${FILE}/variables`);
const tokens = {};

for (const col of data.variableCollections || []) {
  const mode = col.modes?.[0]?.modeId;
  for (const v of (data.variables || []).filter(x => x.variableCollectionId === col.id)) {
    const val = v.valuesByMode?.[mode];
    tokens[`${col.name}/${v.name}`] = (val?.value ?? val);
  }
}

await fs.mkdir("design/tokens", { recursive: true });
await fs.writeFile("design/tokens/tokens.json", JSON.stringify(tokens, null, 2));

let css = ":root{\n"; 
const kebab = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
for (const [k, v] of Object.entries(tokens)) css += `  --${kebab(k)}: ${v};\n`;
css += "}\n"; 

await fs.writeFile("design/tokens/tokens.css", css);

console.log(`Exported ${Object.keys(tokens).length} tokens.`);
