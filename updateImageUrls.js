import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping tên món ăn (có dấu) -> tên folder (không dấu)
const nameMapping = {
  "Phở Bò Hà Nội": "Pho_Bo_Ha_Noi",
  "Bún Chả Hà Nội": "Bun_Cha_Ha_Noi",
  "Chả Cá Lã Vọng": "Cha_Ca_La_Vong",
  "Bún Thang": "Bun_Thang",
  "Nem Rán (Chả Giò)": "Nem_Ran_(Cha_Gio)",
  "Bún Bò Huế": "Bun_Bo_Hue",
  "Mì Quảng": "Mi_Quang",
  "Cao Lầu Hội An": "Cao_Lau_Hoi_An",
  "Nem Lụi": "Nem_Lui",
  "Bánh Khoái": "Banh_Khoai",
  "Cơm Tấm Sườn Bì Chả": "Com_Tam_Suon_Bi_Cha",
  "Hủ Tiếu Nam Vang": "Hu_Tieu_Nam_Vang",
  "Bánh Xèo Miền Tây": "Banh_Xeo_Mien_Tay",
  "Cá Kho Tộ": "Ca_Kho_To",
  "Lẩu Mắm": "Lau_Mam",
  "Gỏi Cuốn": "Goi_Cuon",
  "Bột Chiên": "Bot_Chien",
  "Gỏi Ngó Sen Tôm Thịt": "Goi_Ngo_Sen_Tom_Thit",
  "Bánh Bèo Chén": "Banh_Beo_Chen",
  "Xôi Xéo": "Xoi_Xeo",
  "Canh Chua Cá Lóc": "Canh_Chua_Ca_Loc",
  "Canh Khổ Qua Nhồi Thịt": "Canh_Kho_Qua_Nhoi_Thit",
  "Canh Cua Rau Đay": "Canh_Cua_Rau_Day",
  "Canh Bí Đỏ Nấu Tôm": "Canh_Bi_Do_Nau_Tom",
  "Canh Riêu Cua": "Canh_Rieu_Cua",
  "Thịt Kho Tàu (Trứng)": "Thit_Kho_Tau_(Trung)",
  "Gà Hấp Lá Chanh": "Ga_Hap_La_Chanh",
  "Sườn Xào Chua Ngọt": "Suon_Xao_Chua_Ngot",
  "Bò Lúc Lắc": "Bo_Luc_Lac",
  "Vịt Om Sấu": "Vit_Om_Sau",
  "Đậu Phụ Sốt Cà Chua": "Dau_Phu_Sot_Ca_Chua_Đau_Phu_Sot_Ca_Chua",
  "Nấm Kho Tiêu": "Nam_Kho_Tieu",
  "Canh Nấm Hạt Sen": "Canh_Nam_Hat_Sen",
  "Rau Củ Xào Thập Cẩm": "Rau_Cu_Xao_Thap_Cam",
  "Gỏi Xoài Chay": "Goi_Xoai_Chay",
  "Chè Trôi Nước": "Che_Troi_Nuoc",
  "Chè Hạt Sen Long Nhãn": "Che_Hat_Sen_Long_Nhan",
  "Tào Phớ Nước Đường Gừng": "Tao_Pho_Nuoc_Duong_Gung",
  "Chè Bưởi": "Che_Buoi",
  "Sữa Chua Nếp Cẩm": "Sua_Chua_Nep_Cam",
  "Bánh Cuốn": "Banh_Cuon",
  "Cà Tím Om Thịt Ba Chỉ Đậu Phụ": "Ca_Tim_Om_Thit_Ba_Chi_Dau_Phu",
  "Ốc Nấu Chuối Đậu": "Oc_Nau_Chuoi_Dau_Oc_Nau_Chuoi_Đau",
  "Bánh Đúc Nóng": "Banh_Duc_Nong",
  "Cháo Sườn Sụn": "Chao_Suon_Sun",
  "Bánh Giò": "Banh_Gio",
  "Bún Đậu Mắm Tôm": "Bun_Dau_Mam_Tom",
  "Cơm Cháy Kho Quẹt": "Com_Chay_Kho_Quet",
  "Bò Bía": "Bo_Bia",
  "Bánh Tráng Trộn": "Banh_Trang_Tron",
  "Cháo Lòng": "Chao_Long",
  "Heo Quay Kho Cải Chua": "Heo_Quay_Kho_Cai_Chua",
  "Chả Rươi": "Cha_Ruoi",
  "Giả Cầy": "Gia_Cay",
  "Bánh Căn": "Banh_Can",
  "Chả Tôm Thanh Hóa": "Cha_Tom_Thanh_Hoa",
  "Cá Bống Sông Trà Kho Tiêu": "Ca_Bong_Song_Tra_Kho_Tieu",
  "Thịt Luộc Chấm Mắm Nêm": "Thit_Luoc_Cham_Mam_Nem",
  "Gà Đốt Ô Thum": "Ga_Dot_O_Thum_Ga_Đot_O_Thum",
  "Bánh Pía Sóc Trăng": "Banh_Pia_Soc_Trang",
  "Bún Kèn": "Bun_Ken",
  "Đuông Dừa Tắm Mắm": "Duong_Dua_Tam_Mam_Đuong_Dua_Tam_Mam",
  "Chè Bà Ba": "Che_Ba_Ba",
  "Gỏi Gà Xé Phay": "Goi_Ga_Xe_Phay",
  "Cháo Ám": "Chao_Am",
  "Rau Muống Xào Tỏi": "Rau_Muong_Xao_Toi",
  "Ba Khía": "Ba_Khia",
  "Chè Lam": "Che_Lam",
  "Bánh Gai": "Banh_Gai",
  "Bánh Đa Cua": "Banh_Da_Cua_Banh_Đa_Cua",
  "Phá Lấu": "Pha_Lau",
  "Chè Kho": "Che_Kho",
  "Bánh Dày Giò": "Banh_Day_Gio",
  "Chả Nem": "Cha_Nem",
  "Gà Tần Thuốc Bắc": "Ga_Tan_Thuoc_Bac",
  "Nem Nắm Giao Thủy": "Nem_Nam_Giao_Thuy",
  "Bánh Tráng Cuốn Thịt Heo": "Banh_Trang_Cuon_Thit_Heo",
  "Bún Cá Rô Đồng": "Bun_Ca_Ro_Dong",
  "Ếch Xào Măng": "Ech_Xao_Mang",
  "Xôi Lạc": "Xoi_Lac",
  "Lòng Xào Dưa": "Long_Xao_Dua",
  "Chè Sắn Nóng": "Che_San_Nong",
  "Bánh Tôm Hồ Tây": "Banh_Tom_Ho_Tay",
  "Nộm Hoa Chuối": "Nom_Hoa_Chuoi",
  "Cháo Trai": "Chao_Trai",
  "Vịt Nấu Chao": "Vit_Nau_Chao",
  "Bò Tơ Củ Chi": "Bo_To_Cu_Chi",
  "Bánh Tét": "Banh_Tet",
  "Khổ Qua Xào Trứng": "Kho_Qua_Xao_Trung",
  "Cháo Gà": "Chao_Ga",
  "Bánh Khọt": "Banh_Khot",
  "Mực Nhồi Thịt Sốt Cà Chua": "Muc_Nhoi_Thit_Sot_Ca_Chua",
  "Rau Lang Luộc Chấm Kho Quẹt": "Rau_Lang_Luoc_Cham_Kho_Quet",
  "Chè Thưng": "Che_Thung",
  "Cơm Gà Hội An": "Com_Ga_Hoi_An",
  "Bánh Canh Cua": "Banh_Canh_Cua",
  "Bò Né": "Bo_Ne",
  "Gà Nướng Cơm Lam": "Ga_Nuong_Com_Lam",
  "Chè Khúc Bạch": "Che_Khuc_Bach",
  "Nem Chua Rán": "Nem_Chua_Ran",
  "Salad Ức Gà Healthy": "Salad_Uc_Ga_Healthy"
};

const baseUrl = "https://raw.githubusercontent.com/lpsangg/img_Dataset/refs/heads/main/ai-culinary-companion";

// Đọc file mockData.ts
const filePath = path.join(__dirname, 'data', 'mockData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Thay thế URL cho từng món ăn
Object.entries(nameMapping).forEach(([dishName, folderName]) => {
  const newImageUrl = `${baseUrl}/${folderName}/Image_1.jpg`;
  
  // Tìm và thay thế image URL
  // Pattern: name: "Tên món", ... image: "URL cũ",
  const regex = new RegExp(
    `(name:\\s*["']${dishName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^}]*image:\\s*["'])([^"']+)(["'])`,
    'g'
  );
  
  content = content.replace(regex, `$1${newImageUrl}$3`);
});

// Ghi lại file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Đã cập nhật tất cả URL ảnh thành công!');
console.log(`📊 Tổng số món đã cập nhật: ${Object.keys(nameMapping).length}`);
