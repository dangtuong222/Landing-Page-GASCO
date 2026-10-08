import json, zipfile, pathlib, xml.etree.ElementTree as ET
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
p=pathlib.Path(r'C:\Users\ADMIN\Desktop\ISO-MẪU-KẾ HOẠCH SXKD THÁNG VÀ BÁO CÁO KẾT QUẢ THỰC HIỆN.xlsx')
with zipfile.ZipFile(p) as z:
    ss=[]
    if 'xl/sharedStrings.xml' in z.namelist():
        ss=[''.join(n.itertext()) for n in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
    wb=ET.fromstring(z.read('xl/workbook.xml'))
    print('SHEETS',[(n.attrib) for n in wb.findall('s:sheets/s:sheet',ns)])
    for name in z.namelist():
        if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
            root=ET.fromstring(z.read(name))
            print('\nSHEET',name, 'MERGES',[n.attrib['ref'] for n in root.findall('s:mergeCells/s:mergeCell',ns)])
            for row in root.findall('s:sheetData/s:row',ns):
                cells=[]
                for c in row.findall('s:c',ns):
                    v=c.find('s:v',ns);f=c.find('s:f',ns)
                    val=v.text if v is not None else ''.join(c.find('s:is',ns).itertext()) if c.find('s:is',ns) is not None else ''
                    if c.get('t')=='s' and val: val=ss[int(val)]
                    if val or f is not None: cells.append([c.get('r'),val,('='+f.text) if f is not None else '',c.get('s')])
                if cells: print(json.dumps(cells,ensure_ascii=False))
            print('FEATURES',[n.tag.split('}')[-1] for n in root])
    print('ZIP FEATURES',[n for n in z.namelist() if any(x in n for x in ['drawings/','comments','vba','externalLink','printerSettings','tables/'])])
root=pathlib.Path(r'D:\HK7\THUCTAP')
for d in sorted(root.iterdir()):
    if d.is_dir() and len(d.name)>2 and d.name[:2].isdigit() and d.name[2]=='_' and d.name[3]=='S':
        files=list(d.glob('*'))
        print('SERVICE',d.name,'DOCS',len(list(d.glob('*.docx'))),'XLSX',len(list(d.glob('*.xlsx'))))
        profile=next(d.glob('*02_Service_Profile*.docx'),None)
        if profile:
            with zipfile.ZipFile(profile) as z:
                doc=ET.fromstring(z.read('word/document.xml'))
                paragraphs=[''.join(x.itertext()) for x in doc.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')]
                print('PROFILE',json.dumps([x for x in paragraphs if x][:12],ensure_ascii=False))
