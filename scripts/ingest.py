"""Read service documents into a private, reproducible, cited knowledge index.

DOCX/PPTX use OOXML directly to preserve paragraph/table order and slide notes.
XLSX preserves labels, cell addresses, formulas AND cached values. PDFs use pypdf.
Nothing is uploaded by this command. No source files are changed.
"""
import argparse
import hashlib
import json
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET

import openpyxl
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      "a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
SUPPORTED = {".docx", ".xlsx", ".pptx", ".pdf", ".txt", ".md", ".csv"}


def clean(value):
    return re.sub(r"[ \t]+", " ", str(value)).strip()


def xml_paragraphs(data, ns, tag):
    root = ET.fromstring(data)
    return [clean("".join(p.itertext())) for p in root.findall(f".//{ns}:{tag}", NS)]


def extract(path):
    """Yield (precise locator, complete text) units; never silently skip a sheet."""
    if path.suffix == ".docx":
        with zipfile.ZipFile(path) as archive:
            for name in archive.namelist():
                if name == "word/document.xml" or re.match(r"word/(header|footer|footnotes|endnotes).*\.xml$", name):
                    root = ET.fromstring(archive.read(name))
                    for number, p in enumerate(root.findall(".//w:p", NS), 1):
                        text = clean("".join(t.text or "" for t in p.findall(".//w:t", NS)))
                        if text:
                            yield f"{Path(name).stem} · đoạn {number}", text
    elif path.suffix == ".pptx":
        with zipfile.ZipFile(path) as archive:
            names = [n for n in archive.namelist() if re.match(r"ppt/(slides/slide|notesSlides/notesSlide)\d+\.xml$", n)]
            for name in sorted(names, key=lambda n: ("notes" in n, int(re.search(r"(\d+)\.xml$", n)[1]))):
                text = "\n".join(xml_paragraphs(archive.read(name), "a", "p"))
                if text.strip():
                    yield Path(name).stem, text
    elif path.suffix == ".xlsx":
        formulas = openpyxl.load_workbook(path, read_only=False, data_only=False)
        values = openpyxl.load_workbook(path, read_only=False, data_only=True)
        try:
            for sheet in formulas:
                headers = None
                for row in sheet:
                    nonempty = [c for c in row if c.value is not None]
                    if not nonempty:
                        continue
                    if headers is None:
                        headers = {c.column: clean(c.value) for c in nonempty}
                    fields = []
                    for cell in nonempty:
                        value = clean(cell.value)
                        if cell.data_type == "f":
                            cached = values[sheet.title][cell.coordinate].value
                            value += " [giá trị lưu: " + (clean(cached) if cached is not None else "chưa tính") + "]"
                        label = headers.get(cell.column, "")
                        fields.append(f"{cell.coordinate} ({label}): {value}")
                        if cell.comment:
                            fields.append(f"Ghi chú {cell.coordinate}: {clean(cell.comment.text)}")
                    yield f"sheet {sheet.title} · dòng {nonempty[0].row}", " | ".join(fields)
        finally:
            formulas.close()
            values.close()
    elif path.suffix == ".pdf":
        for number, page in enumerate(PdfReader(path).pages, 1):
            text = page.extract_text() or ""
            if not text.strip():
                raise ValueError(f"Trang PDF {number} không có văn bản; cần OCR trước khi nạp")
            yield f"trang {number}", text
    else:
        yield "toàn văn", path.read_text(encoding="utf-8-sig")


def make_chunks(units, size=2400):
    buffer, locations = [], []
    previous_sheet = None
    for locator, raw in units:
        sheet = locator.split(" · ")[0] if locator.startswith("sheet ") else None
        if sheet != previous_sheet and buffer:
            yield " → ".join(dict.fromkeys(locations)), "\n".join(buffer)
            buffer, locations = [], []
        previous_sheet = sheet
        # Long cells/pages/paragraphs are split with overlap, never truncated.
        pieces = [raw[i:i + size] for i in range(0, len(raw), size - 240)]
        for piece in pieces:
            if sum(len(t) for t in buffer) + len(piece) > size and buffer:
                yield " → ".join(dict.fromkeys(locations)), "\n".join(buffer)
                buffer, locations = [], []
            buffer.append(piece)
            locations.append(locator)
    if buffer:
        yield " → ".join(dict.fromkeys(locations)), "\n".join(buffer)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=ROOT.parent)
    parser.add_argument("--output", type=Path, default=ROOT / ".knowledge/index.json")
    args = parser.parse_args()
    directories = sorted(d for d in args.source.iterdir() if d.is_dir() and re.fullmatch(r"\d{2}_S\d{4}", d.name))
    if len(directories) != 15:
        raise SystemExit(f"Cần đúng 15 thư mục dịch vụ, hiện tìm thấy {len(directories)}")
    services, documents, chunks, failures, cases = [], [], [], [], []
    for directory in directories:
        number, code = directory.name.split("_")
        page = ROOT / f"landing_page_{number}/index.html"
        title_match = re.search(r"<title>(.*?)</title>", page.read_text(encoding="utf-8"), re.S)
        service = {"id": code, "page": f"landing_page_{number}", "title": title_match[1] if title_match else code,
                   "internal": int(number) >= 13, "documentCount": 0, "policies": []}
        services.append(service)
        # Include all supporting documents, even files with SRC rather than CODE names.
        files = sorted(p for p in directory.rglob("*") if p.is_file() and p.suffix.lower() in SUPPORTED
                       and not p.name.startswith("~$") and not any(x.startswith("landing_page_") for x in p.relative_to(directory).parts))
        for path in files:
            relative = path.relative_to(args.source).as_posix()
            try:
                units = list(extract(path))
                if not units:
                    raise ValueError("Không trích xuất được nội dung")
                document_id = hashlib.sha256(relative.encode()).hexdigest()[:16]
                evaluation = "10_Service_AI_Agent" in path.name
                pricing = "07_Service_" in path.name
                document = {"id": document_id, "service": code, "file": path.name, "path": relative,
                            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "units": len(units),
                            "characters": sum(len(t) for _, t in units), "evaluation": evaluation, "pricing": pricing}
                documents.append(document)
                service["documentCount"] += 1
                for index, (locator, text) in enumerate(make_chunks(units)):
                    chunks.append({"id": f"{document_id}-{index + 1}", "document": document_id,
                                   "service": code, "file": path.name, "locator": locator, "text": text,
                                   "evaluation": evaluation, "pricing": pricing})
                # Runtime rules are selected from configuration, never from adversarial test inputs.
                if evaluation:
                    for locator, text in units:
                        sheet = locator.split(" · ")[0].lower()
                        if "test_cases" in sheet:
                            values = re.search(r"A\d+ \([^)]*\): (T\d+) \| B\d+ \([^)]*\): (.*?) \| C\d+ \([^)]*\): (.*?) \| D\d+ \([^)]*\): (.*?)(?: \| E\d+ |$)", text)
                            if values:
                                test_id, category, question, expected = values.groups()
                                cases.append({"id": test_id, "service": code, "category": category,
                                              "question": question, "expected": expected, "file": path.name,
                                              "locator": locator, "placeholder": question.startswith("[") or expected.startswith("[")})
                        if any(word in sheet for word in ("guardrail", "agent_config", "agent config", "system_prompt", "system prompt")):
                            service["policies"].append({"file": path.name, "locator": locator, "text": text})
            except Exception as error:
                failures.append({"file": relative, "error": str(error)})
        print(f"{code}: {service['documentCount']} tài liệu", flush=True)
    result = {"version": 1, "generatedAt": datetime.now(timezone.utc).isoformat(), "services": services,
              "documents": documents, "chunks": chunks, "failures": failures, "cases": cases}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # Fail closed: retain the last good index if even one source cannot be extracted.
    report = {"services": [{k: v for k, v in s.items() if k != "policies"} for s in services],
              "documentCount": len(documents), "chunkCount": len(chunks), "failures": failures,
              "generatedAt": result["generatedAt"]}
    (args.output.parent / "manifest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if failures:
        print(json.dumps(failures, ensure_ascii=False, indent=2), file=sys.stderr)
        raise SystemExit("Nạp chưa hoàn tất; chưa thay thế index đang hoạt động.")
    temporary = args.output.with_suffix(".tmp")
    temporary.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    temporary.replace(args.output)
    print(f"Hoàn tất: {len(documents)} tài liệu, {len(chunks)} đoạn, 15 dịch vụ.")


if __name__ == "__main__":
    main()
