# HƯỚNG DẪN TRIỂN KHAI GIAO DIỆN CHUẨN DESIGN SYSTEM STITCH
# DỰ ÁN: GIA PHẢ GIA TỘC SaaS

---

## 🏛️ 1. HƯỚNG DẪN SỬ DỤNG BỘ UI COMPONENTS (`src/components/ui/`)

Khi phát triển thêm trang hoặc chức năng mới, lập trình viên **BẮT BUỘC** sử dụng các component chuẩn từ `src/components/ui/` thay vì viết style tùy ý:

```tsx
import { Button, Card, Badge, PageHeader, StatCard, EmptyState, Modal } from '../components/ui';
```

### A. Button Component:
```tsx
<Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
  Thêm Thành Viên
</Button>
<Button variant="secondary" size="sm">Xuất Dữ Liệu</Button>
<Button variant="gold" size="sm">Vinh Danh Công Đức</Button>
<Button variant="outline" size="sm">Xem Chi Tiết</Button>
```

### B. Card & StatCard Component:
```tsx
<Card variant="default" padding="md">
  Nội dung thẻ với viền 1px mỏng và bóng mờ nhẹ
</Card>

<StatCard
  title="Tổng Số Dư Quỹ"
  value="125.000.000 ₫"
  subtitle="3 Quỹ hoạt động"
  variant="green"
  icon={<Wallet className="w-5 h-5" />}
/>
```

### C. PageHeader & Badge Component:
```tsx
<PageHeader
  title="Cây Phả Hệ Trực Quan"
  description="Khám phá cội nguồn và kết nối trực hệ dòng tộc"
  badge={<Badge variant="gold">5 Thế Hệ</Badge>}
  action={<Button variant="primary">Thao Tác</Button>}
/>
```
