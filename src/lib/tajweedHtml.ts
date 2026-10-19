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
