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

> **Quan trọng sau khi cập nhật code:** chép lại nội dung `firestore.rules` vào **Firestore Database > Rules** và bấm **Publish**. Nếu chưa publish rules mới, thao tác reaction và chốt món sẽ trả về `permission-denied`.

- `allowedUsers/{email}`: danh sách email được phép dùng ứng dụng, gồm `active` và `displayName`.
- `spins/{autoId}`: kết quả quay gồm `uid`, `authorName`, `foodId` và `createdAt`.
- `spins/{spinId}/reactions/{uid}`: reaction của một thành viên cho một kết quả, gồm `uid`, `type` (`eat`, `reroll` hoặc `fire`) và `updatedAt`. Document ID là Firebase Auth UID nên mỗi người chỉ có tối đa một reaction trên mỗi Live Drop; bấm lại cùng reaction sẽ xóa nó.
- `dailyDecisions/{YYYY-MM-DD}`: món được chốt theo ngày Việt Nam (`Asia/Ho_Chi_Minh`), gồm `dateKey`, `spinId`, `foodId`, người chốt và `createdAt`.

App dùng transaction khi chốt món nên nếu nhiều người thao tác cùng lúc, chỉ document được tạo đầu tiên thành công. Daily decision chỉ được tạo mới; Security Rules không cho frontend sửa hoặc xóa. Nếu quản trị viên thật sự cần đính chính, hãy xử lý trực tiếp trong Firebase Console.

Lịch sử cá nhân, bộ đếm và trạng thái phân phối món vẫn được giữ trong `localStorage` của từng trình duyệt. Kết quả chưa gửi được cũng nằm trong một outbox ở `localStorage`; app dùng cùng document ID khi retry và xóa khỏi outbox sau khi Firestore xác nhận.

Feed chung chỉ tải 20 kết quả gần nhất và mở tối đa khoảng 20 listener reaction, phù hợp với nhóm nhỏ. Thiết kế không cần Cloud Functions hay gói có billing, nhưng số lượt đọc Firestore vẫn tăng theo số thành viên và reaction; nên theo dõi tab **Usage** để không vượt quota Spark.

Security Rules bảo đảm thành viên chỉ được ghi reaction ở document UID của mình, giới hạn loại reaction, đối chiếu món đã chốt với spin gốc và không cho sửa/xóa spin hoặc daily decision từ frontend. Việc quay và khóa ngày vẫn được khởi tạo ở trình duyệt: một thành viên có kiến thức kỹ thuật vẫn có thể tự gửi một `foodId` hợp lệ hoặc chủ động tạo trước document của một ngày tương lai hợp lệ, khiến ngày đó bị khóa cho tới khi quản trị viên xử lý trong Firebase Console. Đây là đánh đổi để giữ kiến trúc thuần client/free-tier; nếu cần chống gian lận tuyệt đối, phải chuyển logic tin cậy sang backend (thường cần bật billing).
