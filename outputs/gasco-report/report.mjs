import fs from 'node:fs/promises';
import {FileBlob, SpreadsheetFile} from '@oai/artifact-tool';
const input=process.argv.includes('--verify-saved')?'D:/HK7/THUCTAP/Landing_Page/outputs/gasco-report/GASCO_Ke_hoach_SXKD_va_Bao_cao.xlsx':'C:/Users/ADMIN/Desktop/ISO-MẪU-KẾ HOẠCH SXKD THÁNG VÀ BÁO CÁO KẾT QUẢ THỰC HIỆN.xlsx';
const outputDir='D:/HK7/THUCTAP/Landing_Page/outputs/gasco-report';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(input));
console.log((await wb.inspect({kind:'workbook,sheet',maxChars:3500})).ndjson);
const sheet=wb.worksheets.getItemAt(0);
const edit=process.argv.includes('--edit');
if(!edit){
  if(process.argv.includes('--verify-saved')){
    wb.recalculate();
    for(const row of [5,8,11,14]){
      const g=sheet.getRange(`G${row}`).values[0][0];
      if(g!==null&&g!=='')throw new Error('Actual KPI was not preserved as blank');
      if(sheet.getRange(`H${row}`).values[0][0]!=='')throw new Error('Blank dependent KPI was not preserved');
    }
    if(sheet.getRange('H17').values[0][0]!=='')throw new Error('Incomplete total should be blank');
    console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',options:{useRegex:true,maxResults:20},maxChars:1200})).ndjson);
    console.log('Saved workbook re-import and recalculation verified.');
  }else{
    const image=await wb.render({sheetName:sheet.name,range:'A1:J17',scale:1.4,format:'png'});
    await fs.writeFile(`${outputDir}/template.png`,new Uint8Array(await image.arrayBuffer()));
  }
} else {
  const entries=[
    [5,'Nghiên cứu và chuẩn hóa hồ sơ dịch vụ UAV',
      'Đề xuất: rà soát 15 bộ hồ sơ dịch vụ UAV, mỗi bộ gồm 10 nhóm tài liệu: nghiên cứu, cơ sở kiến thức, hồ sơ dịch vụ, metadata, SOP/checklist, đề xuất, thương mại, thư viện prompt AI, nội dung landing page và cấu hình/test case AI. Tiêu chí: thống nhất mã, nội dung, nguồn dẫn và trạng thái phê duyệt. Ngày hoàn thành, giờ công: chờ bổ sung.',
      'Chờ bổ sung link upload.\nHiện có 15 thư mục hồ sơ dịch vụ.\nS0075, S0064, S0061 là dự thảo nội bộ.\nChờ xác nhận kết quả trong tháng.'],
    [8,'Xây dựng giao diện 15 landing page dịch vụ',
      'Đề xuất: hoàn thiện 15 landing page bằng HTML/CSS/JavaScript, có nội dung, ảnh minh họa và trình bày phù hợp trên máy tính, điện thoại. Tiêu chí: đúng hồ sơ nguồn, bố cục rõ ràng, tài nguyên hiển thị đầy đủ. Ba trang S0075, S0064, S0061 dùng để review nội bộ. Ngày hoàn thành, giờ công: chờ bổ sung.',
      'Chờ bổ sung link upload.\nHiện có landing_page_01 đến landing_page_15.\nBa trang mới ghi nhãn bản nháp nội bộ.\nChờ xác nhận nghiệm thu.'],
    [11,'Tích hợp dashboard và điều hướng dịch vụ',
      'Đề xuất: hoàn thiện 01 dashboard liên kết 15 dịch vụ, có tìm kiếm theo tên/mã/công nghệ, lọc theo nhóm và đếm kết quả. Chuẩn hóa đường dẫn tương đối, điều hướng về dashboard và sang dịch vụ kế tiếp. Tiêu chí: truy cập được đầy đủ các trang, tìm kiếm và bộ lọc hoạt động đúng. Ngày hoàn thành, giờ công: chờ bổ sung.',
      'Chờ bổ sung link upload.\nHiện có dashboard 15 thẻ dịch vụ và mã tìm kiếm, bộ lọc.\nChờ xác nhận kiểm thử và kết quả trong tháng.'],
    [14,'Kiểm tra, tối ưu và chuẩn bị bàn giao',
      'Đề xuất: thực hiện 01 đợt rà soát 15 trang về nội dung, ảnh, liên kết, menu và hiển thị trên máy tính/điện thoại. Cập nhật 01 hướng dẫn chạy thử, bàn giao mã nguồn và danh sách việc còn chờ. Nêu rõ form/chat mô phỏng, phần chưa có backend và phạm vi review nội bộ. Ngày hoàn thành, giờ công: chờ bổ sung.',
      'Chờ bổ sung link upload.\nHiện có README hướng dẫn chạy thử và bàn giao.\nChưa có biên bản nghiệm thu hoặc kết quả kiểm thử đầy đủ.'],
  ];
  for(const [row,title,description,status] of entries){
    sheet.getRange(`B${row}`).values=[[title]];
    sheet.getRange(`C${row}`).values=[[description]];
    sheet.getRange(`G${row}`).clear({applyTo:'contents'});
    sheet.getRange(`H${row}`).formulas=[[`=IF(G${row}="","",G${row}*D${row}/E${row})`]];
    sheet.getRange(`J${row}`).values=[[status]];
    sheet.getRange(`B${row}:C${row+2}`).format.wrapText=true;
    sheet.getRange(`B${row}:C${row+2}`).format.horizontalAlignment='left';
    sheet.getRange(`J${row}:J${row+2}`).format.wrapText=true;
    sheet.getRange(`J${row}:J${row+2}`).format.horizontalAlignment='left';
    sheet.getRange(`A${row}:J${row+2}`).format.rowHeight=43;
  }
  sheet.getRange('H17').formulas=[['=IF(COUNT(G5,G8,G11,G14)<4,"",SUM(H5:H16))']];
  const requirements=[
    [21,'Đề xuất: lưu hồ sơ và mã nguồn đúng cấu trúc, cập nhật phiên bản và link bàn giao.','Chưa có link upload hoặc xác nhận lưu trữ.'],
    [22,'Đề xuất: tự học HTML/CSS/JavaScript, kỹ năng nghiên cứu và sử dụng AI. Ghi nhận giờ học, đào tạo, chia sẻ và cách áp dụng.','Số giờ và minh chứng: chờ bổ sung.'],
    [23,'Đề xuất: chia sẻ kiến thức, kinh nghiệm và thông tin tích cực đã được phép công bố về dự án.','Nội dung, số lần chia sẻ: chờ bổ sung.'],
    [24,'Chờ xác nhận nhiệm vụ kiến nghị Bộ/ngành được giao trong tháng.','Chưa có dữ liệu về nhiệm vụ này.'],
    [25,'Đề xuất: bảo mật hồ sơ, tuân thủ phạm vi sử dụng và quyền công bố nội dung.','Ba hồ sơ mới là dự thảo nội bộ.'],
  ];
  sheet.getRange('B25').values=[['Bảo mật và tuân thủ phạm vi sử dụng']];
  for(const [row,plan,note] of requirements){
    sheet.getRange(`D${row}`).values=[[plan]];
    sheet.getRange(`G${row}`).values=[['Chờ xác nhận']];
    sheet.getRange(`J${row}`).values=[[note]];
    sheet.getRange(`B${row}:J${row}`).format.wrapText=true;
    sheet.getRange(`D${row}:F${row}`).format.horizontalAlignment='left';
    sheet.getRange(`J${row}`).format.horizontalAlignment='left';
    sheet.getRange(`A${row}:J${row}`).format.rowHeight=row===22?64:54;
  }
  for(const row of [27,28,29]){
    sheet.getRange(`B${row}`).values=[['Chờ bổ sung chỉ đạo thực tế trong tháng.']];
    sheet.getRange(`G${row}`).values=[['Chờ xác nhận']];
    sheet.getRange(`B${row}:J${row}`).format.wrapText=true;
    sheet.getRange(`A${row}:J${row}`).format.rowHeight=30;
  }
  sheet.getRange('A30').values=[['GASCO (GASCOLAE). Kế hoạch đề xuất; hiện trạng kiểm kê tại 07/10/2026 chưa xác nhận kết quả tháng. KPI thực tế chờ bổ sung.']];
  sheet.getRange('A30:J30').format.wrapText=true;
  sheet.getRange('A30:J30').format.rowHeight=30;
  wb.recalculate();
  console.log((await wb.inspect({kind:'table',range:`'${sheet.name}'!B5:J17`,include:'values,formulas',tableMaxRows:13,tableMaxCols:9,maxChars:2500,tableMaxCellChars:70})).ndjson);
  // Check calculations with temporary input, then restore every edited input.
  sheet.getRange('G5').values=[[0.8]];
  if(Math.abs(sheet.getRange('H5').values[0][0]-0.32)>1e-10)throw new Error('Partial KPI calculation failed');
  if(sheet.getRange('H17').values[0][0]!=='')throw new Error('Incomplete total must remain unavailable');
  for(const row of [5,8,11,14])sheet.getRange(`G${row}`).values=[[1]];
  if(Math.abs(sheet.getRange('H17').values[0][0]-1)>1e-10)throw new Error('Total KPI calculation failed');
  sheet.getRange('G14').values=[[0]];
  if(Math.abs(sheet.getRange('H17').values[0][0]-0.85)>1e-10)throw new Error('Zero KPI must be preserved');
  for(const row of [5,8,11,14])sheet.getRange(`G${row}`).clear({applyTo:'contents'});
  wb.recalculate();
  console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'final formula error scan',maxChars:1200})).ndjson);
  for(const [label,range] of [['filled-top','A1:J17'],['filled-bottom','A19:J42']]){
    const image=await wb.render({sheetName:sheet.name,range,scale:1.4,format:'png'});
    await fs.writeFile(`${outputDir}/${label}.png`,new Uint8Array(await image.arrayBuffer()));
  }
  const output=await SpreadsheetFile.exportXlsx(wb);
  await output.save(`${outputDir}/GASCO_Ke_hoach_SXKD_va_Bao_cao.xlsx`);
  console.log('Saved workbook successfully');
}
