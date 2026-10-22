/** Quran.com uthmani_tajweed → HTML aman untuk ditampilkan */

export function prepareTajweedHtml(raw: string): string {
  if (!raw) return "";

  let html = raw
    .replace(/<tajweed class=([a-z0-9_]+)\s*\/?>/gi, '<span class="tjw tjw-$1">')
    .replace(/<tajweed class="([^"]+)"\s*\/?>/gi, '<span class="tjw tjw-$1">')
    .replace(/<\/tajweed>/gi, "</span>")
    .replace(/<span class=end>\d+<\/span>/gi, "")
    .replace(/<span class="end">\d+<\/span>/gi, "");

  // Buang tag asing; sisakan teks Arab + span tjw
  html = html.replace(/<(?!\/?span\b)[^>]+>/gi, "");

  return html.trim();
}

export function looksLikeTajweedMarkup(text: string): boolean {
  return text.includes("<tajweed") || text.includes('class="tjw') || text.includes("tjw-");
}

/** Pecah HTML tajwid menjadi kata (spasi di luar tag). */
export function tajweedWords(raw: string): string[] {
  const html = prepareTajweedHtml(raw);
  const out: string[] = [];
  let cur = "";
  let depth = 0;
  for (let i = 0; i < html.length; i++) {
    const ch = html[i]!;
    if (ch === "<") {
      const end = html.indexOf(">", i);
      const tag = html.slice(i, end + 1);
      depth += tag.startsWith("</") ? -1 : tag.endsWith("/>") ? 0 : 1;
      cur += tag;
      i = end;
    } else if (/\s/.test(ch) && depth <= 0) {
      if (cur.trim()) out.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}
