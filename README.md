# LunchDrop

Web quay mở hòm để chọn món ăn trưa. Ứng dụng chạy tĩnh trên GitHub Pages, dùng Firebase Authentication để đăng nhập Google và Cloud Firestore để chia sẻ kết quả theo thời gian thực.

## Thiết lập Firebase miễn phí

1. Tạo một Firebase project ở gói Spark và đăng ký một **Web app**.
2. Vào **Authentication > Sign-in method**, bật provider **Google**.
3. Trong **Authentication > Settings > Authorized domains**, thêm host GitHub Pages của bạn, ví dụ `username.github.io`. Nếu dùng custom domain, thêm cả domain đó.
4. Vào **Firestore Database**, tạo database ở **Production mode**.
5. Mở tab **Rules**, chép nội dung `firestore.rules` vào và bấm **Publish**.
6. Tạo collection `allowedUsers`. Với mỗi thành viên, tạo một document có ID là email Google chính xác, ví dụ `member@gmail.com`, cùng hai field bắt buộc:

```text
active: true
displayName: "Tên hiển thị của thành viên"
```

Đặt `active` thành `false` hoặc xóa document để thu hồi quyền ngay cả khi người đó đang mở trang. `displayName` do quản trị viên đặt và được Security Rules dùng làm tên tác giả đáng tin cậy trên feed.
7. Vào **Project settings > Your apps > SDK setup and configuration**, chép các giá trị config vào `firebase-config.js`:

```js
export const firebaseConfig = Object.freeze({
  apiKey: '...',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project',
  storageBucket: 'your-project.firebasestorage.app',
  messagingSenderId: '...',
  appId: '...'
});
```

Firebase Web config không phải secret và có thể nằm trong repository public. Không được đặt service-account key hoặc private key trong project này; dữ liệu được bảo vệ bằng `firestore.rules`.

## Chạy local

Không mở trực tiếp bằng `file://`, vì Google Authentication cần một web origin. Tại thư mục project trên Windows, chạy:

```powershell
py -m http.server 5500
```

Sau đó mở `http://localhost:5500`. Nếu Firebase chưa cho phép `localhost`, thêm host này vào **Authorized domains**.

## Deploy

Push lên branch `main`. Workflow `.github/workflows/deploy-pages.yml` sẽ deploy site tĩnh lên GitHub Pages. Không có bước build hay dependency cần cài đặt.

## Mô hình dữ liệu

- `allowedUsers/{email}`: danh sách email được phép dùng ứng dụng, gồm `active` và `displayName`.
- `spins/{autoId}`: kết quả gồm `uid`, `authorName`, `foodId` và `createdAt`.
- Lịch sử cá nhân, bộ đếm và trạng thái phân phối món vẫn được giữ trong `localStorage` của từng trình duyệt.
- Kết quả chưa gửi được cũng được giữ trong một outbox ở `localStorage`; app dùng cùng document ID khi retry và xóa khỏi outbox sau khi Firestore xác nhận.
- Feed chung chỉ tải 20 kết quả gần nhất. Thành viên chỉ được tạo kết quả mang UID và tên đã cấu hình của chính mình; không ai được sửa hoặc xóa kết quả từ frontend.

Kết quả quay vẫn được chọn ở trình duyệt. Security Rules ngăn người ngoài và giới hạn schema, nhưng một thành viên có kiến thức kỹ thuật vẫn có thể tự gọi Firestore với một `foodId` hợp lệ. Nếu cần chống gian lận tuyệt đối, phải chuyển việc chọn món sang backend đáng tin cậy (thường cần gói có billing).
