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
    title: 'Từ Đường Mái Ngói Mũi Hài Cổ Truyền (Bắc Bộ)',
    url: 'https://images.unsplash.com/photo-1548625361-195fe57871b6?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1548625361-195fe57871b6?auto=format&fit=crop&q=80&w=300',
    description: 'Kiến trúc 3 gian cổ kính, ngói đỏ mũi hài, hoa văn chạm rồng phượng uy nghiêm',
  },
  {
    id: 'preset-hall-2',
    title: 'Gian Thờ Tiên Tổ Sơn Son Thiếp Vàng',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=300',
    description: 'Không gian thờ tự trang nghiêm, hoành phi đại tự, lư hương đỉnh đồng linh thiêng',
  },
  {
    id: 'preset-hall-3',
    title: 'Khuôn Viên Cây Đa Bến Nước Sân Đình Từ Đường',
    url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&q=80&w=300',
    description: 'Không gian phong thủy thanh tịnh, sân gạch đỏ, cây cối xanh mát linh khí hội tụ',
  },
  {
    id: 'preset-hall-4',
    title: 'Cổng Tam Quan & Cuốn Thư Từ Đường',
    url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=300',
    description: 'Cổng tam quan đá uy nghi, trấn phong thủy, chào đón con cháu muôn phương về dâng hương',
  },
  {
    id: 'preset-hall-5',
    title: 'Lăng Mộ Đá Tiền Nhân Uy Nghiêm',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=300',
    description: 'Khu lăng mộ đá xanh nguyên khối, tọa sơn hướng thủy, gìn giữ mộ phần các bậc tiền nhân',
  },
  {
    id: 'preset-hall-6',
    title: 'Kiến Trúc Gỗ Lim 3 Gian 2 Chái Cổ Kính',
    url: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&q=80&w=300',
    description: 'Cột gỗ lim nguyên khối, kèo cột chạm trổ tinh xảo, bền vững qua hàng trăm năm',
  },
];
