/**
 * Utility nén ảnh tự động trên client bằng HTML5 Canvas
 * Giúp giảm 70-90% dung lượng ảnh mà vẫn giữ độ nét cao,
 * tối ưu bộ nhớ lưu trữ CSDL và tăng tốc độ tải trang.
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính toán tỷ lệ co giãn giữ nguyên aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }

        // Vẽ ảnh lên canvas với smoothing tối ưu
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Xuất định dạng WebP hoặc JPEG chất lượng cao tối ưu dung lượng
        let compressedDataUrl = canvas.toDataURL('image/webp', quality);
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * 6 Hình ảnh mẫu Từ đường & Nhà thờ tổ chuẩn truyền thống Việt Nam
 * Được tối ưu hóa tỉ lệ và chất lượng cho Gia Phả Gia Tộc
 */
export const ANCESTRAL_HALL_PRESETS = [
  {
    id: 'preset-hall-1',
    title: 'Từ Đường Nhà Gỗ Mái Ngói Sân Gạch Cổ Truyền',
    url: '/images/presets/tu-duong-san-gach.png',
    thumbnail: '/images/presets/tu-duong-san-gach.png',
    description: 'Kiến trúc nhà gỗ 3 gian mái ngói đỏ sân gạch, hoa cúc vạn thọ trước sân trang nghiêm',
  },
  {
    id: 'preset-hall-2',
    title: 'Gian Thờ Tiên Tổ Sơn Son Thiếp Vàng Linh Thiêng',
    url: '/images/presets/gian-tho-son-son.jpg',
    thumbnail: '/images/presets/gian-tho-son-son.jpg',
    description: 'Không gian thờ tự trang trọng với hoành phi câu đối Phụng Tiên Tư, ngai thờ, lư hương đỉnh đồng và mâm ngũ quả',
  },
  {
    id: 'preset-hall-3',
    title: 'Khuôn Viên Hồ Bán Nguyệt & Cây Đa Từ Đường',
    url: '/images/presets/ho-ban-nguyet-tu-duong.png',
    thumbnail: '/images/presets/ho-ban-nguyet-tu-duong.png',
    description: 'Cổng tam quan, cờ đại gia tộc bên hồ bán nguyệt phong thủy tụ thủy sinh tài, cây đa bóng mát linh thiêng',
  },
  {
    id: 'preset-hall-4',
    title: 'Lăng Mộ Đá Mỹ Nghệ Tiền Nhân Gia Tộc',
    url: '/images/presets/lang-mo-da-tien-nhan.png',
    thumbnail: '/images/presets/lang-mo-da-tien-nhan.png',
    description: 'Khu lăng mộ đá xanh nguyên khối chạm khắc rồng phượng uy nghiêm, lưu giữ phần mộ tiền nhân vĩnh hằng',
  },
  {
    id: 'preset-hall-5',
    title: 'Kiến Trúc Nhà Gỗ Cổ 3 Gian 2 Chái Truyền Thống',
    url: 'https://villagold.vn/uploads/nha-go-nha-co/3-gian-2-chai-xay-1/5-interactive-lightmix.jpg',
    thumbnail: 'https://villagold.vn/uploads/nha-go-nha-co/3-gian-2-chai-xay-1/5-interactive-lightmix.jpg',
    description: 'Kiến trúc gỗ cổ truyền 3 gian 2 chái, vì kèo cột lim chạm khắc tinh tế đậm đà bản sắc Việt',
  },
  {
    id: 'preset-hall-6',
    title: 'Từ Đường Mái Ngói Mũi Hài Cổ Kính',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGhYeiltQG5qUQvGDSDnswI7NMoN682brydl58CsCEEIiITcrTJ8blFBQ&s=10',
    thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGhYeiltQG5qUQvGDSDnswI7NMoN682brydl58CsCEEIiITcrTJ8blFBQ&s=10',
    description: 'Mái ngói mũi hài rêu phong cổ kính, kết tinh truyền thống ngàn đời của dòng họ',
  },
];
