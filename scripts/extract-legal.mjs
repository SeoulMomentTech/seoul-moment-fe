import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";

const text = (n) => n.text;

function attr(el, name) {
  const a = el.attributes.properties.find(
    (p) => ts.isJsxAttribute(p) && p.name.getText() === name,
  );
  if (!a || !a.initializer) return undefined;
  if (ts.isStringLiteral(a.initializer)) return a.initializer.text;
  if (ts.isJsxExpression(a.initializer) && a.initializer.expression) {
    const e = a.initializer.expression;
    if (ts.isArrayLiteralExpression(e)) {
      return e.elements.map((x) => {
        if (!ts.isStringLiteral(x) && !ts.isNoSubstitutionTemplateLiteral(x))
          throw new Error("비문자열 bullet: " + x.getText());
        return text(x);
      });
    }
    if (ts.isStringLiteral(e)) return e.text;
  }
  throw new Error("해석 못 한 attr " + name);
}

function childrenOf(el) {
  const kids = el.children ?? [];
  return kids.filter((c) => ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c));
}

function tagOf(node) {
  return (ts.isJsxElement(node) ? node.openingElement : node).tagName.getText();
}

function walk(node) {
  const el = ts.isJsxElement(node) ? node.openingElement : node;
  const tag = tagOf(node);

  if (tag === "Bullets") return { t: "bullets", items: attr(el, "items") };
  if (tag === "Paragraph") {
    const kids = ts.isJsxElement(node) ? node.children : [];
    const parts = kids.filter((c) => ts.isJsxText(c)).map((c) => c.text.trim()).filter(Boolean);
    const strs = kids.filter((c) => ts.isStringLiteral(c)).map(text);
    const all = [...parts, ...strs];
    if (all.length !== 1) throw new Error("Paragraph 본문이 1개가 아님: " + node.getText().slice(0, 80));
    return { t: "p", text: all[0] };
  }
  if (tag === "Section" || tag === "SubSection" || tag === "LegalDocument") {
    return {
      t: tag === "LegalDocument" ? "doc" : tag === "Section" ? "section" : "sub",
      title: attr(el, "title"),
      children: childrenOf(node).map(walk),
    };
  }
  throw new Error("모르는 태그 " + tag);
}

function extract(file) {
  const src = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let doc = null;
  const visit = (n) => {
    if ((ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) && tagOf(n) === "LegalDocument") {
      doc = walk(n);
      return;
    }
    ts.forEachChild(n, visit);
  };
  visit(src);
  if (!doc) throw new Error("LegalDocument 없음");
  return doc;
}

const [, , inFile, outFile, name] = process.argv;
const doc = extract(inFile);

const counts = { section: 0, sub: 0, p: 0, bullets: 0, items: 0 };
const tally = (n) => {
  if (n.t in counts) counts[n.t]++;
  if (n.t === "bullets") counts.items += n.items.length;
  (n.children ?? []).forEach(tally);
};
tally(doc);
console.error(inFile, JSON.stringify(counts));

writeFileSync(
  outFile,
  `// 이 파일은 apps/web 의 법무 문서에서 기계적으로 추출했다. 손으로 고치지 말 것.\n` +
  `// 출처: ${inFile.replace(/^.*apps\//, "apps/")}\n` +
  `// 추출 스크립트: scripts/extract-legal.mjs\n\n` +
  `import type { LegalNode } from "@shared/ui/legal-document";\n\n` +
  `export const ${name}: LegalNode = ${JSON.stringify(doc, null, 2)};\n`,
);
