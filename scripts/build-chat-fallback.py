"""Build the static chat reference from already published page text only.

Private source files, pricing workbooks and agent instructions never enter this file.
"""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IDS = "S0296 S0297 S0291 S0295 S0301 S0300 S0289 S0298 S0299 S0303 S0302 S0294 S0075 S0064 S0061".split()
VOID = set("area base br col embed hr img input link meta param source track wbr".split())
SKIP = set("script style svg canvas form nav footer dialog".split())


class Node:
    def __init__(self, tag="root", attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        if self.tag in SKIP:
            return ""
        return re.sub(r"\s+", " ", " ".join(c if isinstance(c, str) else c.text() for c in self.children)).strip()

    def find(self, tags):
        for child in self.children:
            if isinstance(child, Node) and child.tag not in SKIP:
                if child.tag in tags:
                    yield child
                yield from child.find(tags)


class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def build():
    services = []
    for i, code in enumerate(IDS, 1):
        page = f"landing_page_{i:02d}"
        parser = Parser()
        parser.feed((ROOT / page / "index.html").read_text(encoding="utf-8"))
        main = next(parser.root.find({"main"}), parser.root)
        entries = []
        for number, section in enumerate(main.find({"section"}), 1):
            anchor = section.attrs.get("id") or section.attrs.get("aria-labelledby", "").split(" ")[0]
            if re.search(r"contact|lead|ai-agent|agent|chat|lien-he", anchor, re.I):
                continue
            heading = next(section.find({"h1", "h2"}), None)
            title = heading.text() if heading else anchor or f"Mục {number}"
            faq_items = [n for n in section.find({"div", "article", "details"})
                         if n.tag == "details" or re.search(r"(?:^|\s)(?:faq-item|accordion-item)(?:\s|$)", n.attrs.get("class", ""))]
            if faq_items and re.search(r"faq|cau-hoi", anchor, re.I):
                for item in faq_items:
                    question = next(item.find({"summary", "button", "h3"}), None)
                    answers = [p.text() for p in item.find({"p", "li"}) if p.text()]
                    if question and answers:
                        entries.append({"title": question.text().rstrip(" +−"), "anchor": anchor,
                                        "text": "\n".join(answers), "file": f"{page}/index.html", "service": code, "faq": True})
                continue
            # Keep paragraphs intact, including qualifications and negative statements.
            paragraphs = [n.text() for n in section.find({"h3", "h4", "p", "li", "summary", "button", "td"})]
            paragraphs = list(dict.fromkeys(p for p in paragraphs if p and not re.search(r"HƯỚNG DẪN:|Nhập câu hỏi|Gửi nhu cầu", p)))
            if not paragraphs:
                continue
            groups, group = [], []
            for paragraph in paragraphs:
                if group and sum(map(len, group)) + len(paragraph) > 2600:
                    groups.append(group)
                    group = []
                group.append(paragraph)
            if group:
                groups.append(group)
            for group in groups:
                entries.append({"title": title, "anchor": anchor, "text": "\n".join(group), "file": f"{page}/index.html", "service": code})
        if len(entries) < 5:
            raise ValueError(f"Missing public reference sections for {code}")
        services.append({"id": code, "page": page, "entries": entries})
    result = {"version": 1, "services": services}
    (ROOT / "assets/service-faq.json").write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Static reference: {len(services)} services / {sum(len(s['entries']) for s in services)} excerpts (public page text only)")


if __name__ == "__main__":
    build()
