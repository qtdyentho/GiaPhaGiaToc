import { getNapAm, getCungPhi, getCanChiHour, calculateBatTu } from '../src/lib/fengshui';

/**
 * TEST SUITE: PHONG THỦY BÁT TỰ & TRÍCH LỤC VĂN KHẤN GIA TIÊN
 */

interface TestItem {
  id: string;
  name: string;
  expected: any;
  actual: any;
  pass: boolean;
}

const results: TestItem[] = [];

function check(id: string, name: string, pass: boolean, expected: any, actual: any) {
  results.push({ id, name, pass, expected, actual });
  console.log(`${pass ? '✅' : '❌'} [${id}] ${name}: ${pass ? 'PASS' : 'FAIL'}`);
  if (!pass) {
    console.error(`   Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    process.exitCode = 1;
  }
}

console.log('\n--- KIỂM THỬ BỘ 3 TÍNH NĂNG BÁT TỰ & PHONG THỦY CỔ TRUYỀN ---');

// 1. Test Nạp Âm 30 Mệnh Ngũ Hành
const giapTy = getNapAm('Giáp Tý');
check('FS-001', 'Giáp Tý Nạp Âm Hải Trung Kim', giapTy.napAm === 'Hải Trung Kim' && giapTy.element === 'KIM', 'Hải Trung Kim', giapTy.napAm);

const binhDan = getNapAm('Bính Dần');
check('FS-002', 'Bính Dần Nạp Âm Lư Trung Hỏa', binhDan.napAm === 'Lư Trung Hỏa' && binhDan.element === 'HOA', 'Lư Trung Hỏa', binhDan.napAm);

const mauThin = getNapAm('Mậu Thìn');
check('FS-003', 'Mậu Thìn Nạp Âm Đại Lâm Mộc', mauThin.napAm === 'Đại Lâm Mộc' && mauThin.element === 'MOC', 'Đại Lâm Mộc', mauThin.napAm);

const atTy = getNapAm('Ất Tỵ');
check('FS-004', 'Ất Tỵ Nạp Âm Phú Đăng Hỏa', atTy.napAm === 'Phú Đăng Hỏa' && atTy.element === 'HOA', 'Phú Đăng Hỏa', atTy.napAm);

const nhamThan = getNapAm('Nhâm Thân');
check('FS-005', 'Nhâm Thân Nạp Âm Kiếm Phong Kim', nhamThan.napAm === 'Kiếm Phong Kim' && nhamThan.element === 'KIM', 'Kiếm Phong Kim', nhamThan.napAm);

// 2. Test Cung Phi Bát Trạch
const nam1985 = getCungPhi(1985, 'MALE');
check('FS-006', 'Nam 1985 (Ất Sửu) Cung Càn Tây Tứ Mệnh', nam1985.cung === 'Càn' && nam1985.menhType === 'Tây Tứ Mệnh', 'Càn / Tây Tứ Mệnh', `${nam1985.cung} / ${nam1985.menhType}`);

const nu1985 = getCungPhi(1985, 'FEMALE');
check('FS-007', 'Nữ 1985 (Ất Sửu) Cung Ly Đông Tứ Mệnh', nu1985.cung === 'Ly' && nu1985.menhType === 'Đông Tứ Mệnh', 'Ly / Đông Tứ Mệnh', `${nu1985.cung} / ${nu1985.menhType}`);

// 3. Test Ngũ Thử Độn Giờ Sinh
const gioDanGiap = getCanChiHour('Giờ Dần (03h00 - 05h00)', 'Giáp Tý');
check('FS-008', 'Ngày Giáp Giờ Dần khởi Bính Dần', gioDanGiap === 'Bính Dần', 'Bính Dần', gioDanGiap);

const gioTyAt = getCanChiHour('Giờ Tý (23h00 - 01h00)', 'Ất Sửu');
check('FS-009', 'Ngày Ất Giờ Tý khởi Bính Tý', gioTyAt === 'Bính Tý', 'Bính Tý', gioTyAt);

// 4. Test Bát Tự Toàn Diện
const batTu = calculateBatTu('1985-10-20', 1985, 9, 7, 'Giờ Thìn (07h00 - 09h00)', 'MALE');
check('FS-010', 'Bát Tự 4 Trụ đầy đủ', batTu.truNam === 'Ất Sửu' && batTu.napAm.napAm === 'Hải Trung Kim', 'Ất Sửu / Hải Trung Kim', `${batTu.truNam} / ${batTu.napAm.napAm}`);

console.log(`\n============================================================`);
console.log(`TỔNG KẾT KIỂM THỬ PHONG THỦY: ${results.filter((r) => r.pass).length}/${results.length} PASS`);
console.log(`============================================================\n`);
