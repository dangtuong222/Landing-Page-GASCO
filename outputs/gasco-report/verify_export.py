import pathlib,zipfile,xml.etree.ElementTree as ET,json
base=pathlib.Path(r'C:\Users\ADMIN\Desktop\ISO-MẪU-KẾ HOẠCH SXKD THÁNG VÀ BÁO CÁO KẾT QUẢ THỰC HIỆN.xlsx')
out=pathlib.Path(r'D:\HK7\THUCTAP\Landing_Page\outputs\gasco-report\GASCO_Ke_hoach_SXKD_va_Bao_cao.xlsx')
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def read(p):
    with zipfile.ZipFile(p) as z:
        strs=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            strs=[''.join(t.itertext()) for t in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
        root=ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        vals={};forms={}
        for c in root.findall('.//s:sheetData/s:row/s:c',ns):
            a=c.attrib['r'];v=c.find('s:v',ns);f=c.find('s:f',ns)
            value=v.text if v is not None else ''.join(c.find('s:is',ns).itertext()) if c.find('s:is',ns) is not None else ''
            if c.get('t')=='s' and value:value=strs[int(value)]
            if value is not None and value!='':vals[a]=value
            if f is not None:forms[a]=f.text
        return vals,forms,root,z.namelist(),ET.fromstring(z.read('xl/workbook.xml'))
v0,f0,r0,n0,w0=read(base);v1,f1,r1,n1,w1=read(out)
allowed={'A30','B25','H17'}
for r in [5,8,11,14]:allowed.update(f'{c}{r}' for c in 'BCGHJ')
for r in [21,22,23,24,25]:allowed.update(f'{c}{r}' for c in 'DGJ')
for r in [27,28,29]:allowed.update(f'{c}{r}' for c in 'BG')
diffs=[a for a in v0.keys()|v1.keys() if v0.get(a)!=v1.get(a) and a not in allowed and a not in f0]
assert not diffs,('Unexpected cell value changes',diffs)
assert all(f0[a]==f1.get(a) for a in f0 if a not in allowed),'Unrelated formula changes'
assert [n.get('ref') for n in r0.findall('s:mergeCells/s:mergeCell',ns)]==[n.get('ref') for n in r1.findall('s:mergeCells/s:mergeCell',ns)],'Merged cells changed'
assert [(n.get('name'),n.get('state','visible')) for n in w0.findall('s:sheets/s:sheet',ns)]==[(n.get('name'),n.get('state','visible')) for n in w1.findall('s:sheets/s:sheet',ns)],'Worksheet names/order changed'
for r in [5,8,11,14]:
    assert f'G{r}' not in v1,'Unconfirmed actual KPI must remain blank'
    assert f'H{r}' in f1,'KPI calculation missing'
for a in ['F5','F8','F11','F14','I5','I8','I11','I14','D34','D35','H34','H35']:
    assert a not in v1,'Unconfirmed approval was filled'
print('Verified values, formulas, approvals, sheet names, merged ranges and blank actual KPIs.')
print('Original worksheet features',[n.tag.split('}')[-1] for n in r0])
print('Exported worksheet features',[n.tag.split('}')[-1] for n in r1])
print('Parts dropped',[n for n in n0 if n not in n1])
print('Original print settings',json.dumps([n.attrib for n in r0 if n.tag.endswith(('pageSetup','pageMargins'))]))
print('Exported print settings',json.dumps([n.attrib for n in r1 if n.tag.endswith(('pageSetup','pageMargins'))]))
