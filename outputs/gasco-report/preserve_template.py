"""Preserve native template features lost by Artifact Tool XLSX export.

All cell contents/formulas are authored and validated in Artifact Tool. This
package merge uses the original container to retain print settings, metadata,
rich text, original style conventions and workbook relationships.
"""
import copy,io,pathlib,zipfile,xml.etree.ElementTree as ET
from verify_export import base,out,allowed,ns
S=ns['s'];q=lambda x:'{'+S+'}'+x
ET.register_namespace('',S)
ET.register_namespace('r','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
with zipfile.ZipFile(base) as src,zipfile.ZipFile(out) as authored:
    source=ET.fromstring(src.read('xl/worksheets/sheet1.xml'))
    changed=ET.fromstring(authored.read('xl/worksheets/sheet1.xml'))
    assert source.find('s:pageSetup',ns) is not None and changed.find('s:pageSetup',ns) is None
    strings=[]
    if 'xl/sharedStrings.xml' in authored.namelist():
        strings=[''.join(n.itertext()) for n in ET.fromstring(authored.read('xl/sharedStrings.xml')).findall('s:si',ns)]
    original_cells={n.get('r'):n for n in source.findall('s:sheetData/s:row/s:c',ns)}
    new_cells={n.get('r'):n for n in changed.findall('s:sheetData/s:row/s:c',ns)}
    rows={int(n.get('r')):n for n in source.findall('s:sheetData/s:row',ns)}
    for address in allowed:
        old=original_cells.get(address)
        new=new_cells.get(address)
        if old is None:
            rowno=int(''.join(x for x in address if x.isdigit()))
            old=ET.SubElement(rows[rowno],q('c'),{'r':address})
            original_cells[address]=old
        for child in list(old):
            if child.tag in {q('f'),q('v'),q('is')}:old.remove(child)
        old.attrib.pop('t',None)
        if new is not None:
            if new.get('t')=='s':
                v=new.find('s:v',ns)
                text=strings[int(v.text)] if v is not None else ''
                old.set('t','inlineStr')
                inline=ET.SubElement(old,q('is'))
                ET.SubElement(inline,q('t')).text=text
            else:
                if new.get('t'):old.set('t',new.get('t'))
                for child in new:
                    if child.tag in {q('f'),q('v'),q('is')}:old.append(copy.deepcopy(child))
    styles=ET.fromstring(src.read('xl/styles.xml'))
    xfs=styles.find('s:cellXfs',ns)
    cache={}
    def local_style(address,left=False):
        c=original_cells.get(address)
        if c is None:return
        oldid=int(c.get('s','0'));key=(oldid,left)
        if key not in cache:
            xf=copy.deepcopy(xfs[oldid]);align=xf.find('s:alignment',ns)
            if align is None:align=ET.SubElement(xf,q('alignment'))
            align.set('wrapText','1')
            if left:align.set('horizontal','left')
            xf.set('applyAlignment','1');cache[key]=len(xfs);xfs.append(xf)
        c.set('s',str(cache[key]))
    for r in range(5,17):
        rows[r].set('ht','43');rows[r].set('customHeight','1')
        for col in ['B','C','J']:local_style(f'{col}{r}',left=True)
    for r in range(21,26):
        rows[r].set('ht','64' if r==22 else '54');rows[r].set('customHeight','1')
        for col in 'BCDEFGHIJ':local_style(f'{col}{r}',left=col in 'DEFJ')
    for r in [27,28,29]:
        rows[r].set('ht','30');rows[r].set('customHeight','1')
        for col in 'BCDEFGHIJ':local_style(f'{col}{r}')
    rows[30].set('ht','30');rows[30].set('customHeight','1')
    for col in 'ABCDEFGHIJ':local_style(f'{col}30')
    xfs.set('count',str(len(xfs)))
    workbook=ET.fromstring(src.read('xl/workbook.xml'))
    calc=workbook.find('s:calcPr',ns)
    if calc is None:calc=ET.SubElement(workbook,q('calcPr'))
    calc.set('fullCalcOnLoad','1')
    replacements={
        'xl/worksheets/sheet1.xml':ET.tostring(source,encoding='utf-8',xml_declaration=True),
        'xl/styles.xml':ET.tostring(styles,encoding='utf-8',xml_declaration=True),
        'xl/workbook.xml':ET.tostring(workbook,encoding='utf-8',xml_declaration=True),
    }
    buf=io.BytesIO()
    with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as target:
        for item in src.infolist():target.writestr(item,replacements.get(item.filename,src.read(item.filename)))
out.write_bytes(buf.getvalue())
with zipfile.ZipFile(base) as src,zipfile.ZipFile(out) as final:
    assert src.namelist()==final.namelist(),'Native parts must all be preserved'
    for n in src.namelist():
        if n not in replacements:assert src.read(n)==final.read(n),('Unrelated native part changed',n)
    sr=ET.fromstring(src.read('xl/worksheets/sheet1.xml'))
    fr=ET.fromstring(final.read('xl/worksheets/sheet1.xml'))
    for tag in ['sheetPr','sheetViews','cols','mergeCells','pageMargins','pageSetup']:
        assert ET.tostring(sr.find('s:'+tag,ns))==ET.tostring(fr.find('s:'+tag,ns)),('Native feature changed',tag)
print('Preserved original print layout, custom XML, properties, relationships and unrelated formatting.')
