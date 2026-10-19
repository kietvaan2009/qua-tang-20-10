# Quà tặng 20/10 💕

## Cấu trúc
```
index.html          trang chính
css/style.css       giao diện
js/config.js        nội dung thư, đường dẫn ảnh và nhạc (sửa ở đây)
js/main.js          hiệu ứng, trò chơi, cây tình yêu
images/puzzle.jpg   ảnh ghép ở màn 1 (ảnh vuông 1:1)
images/gallery-*.jpg  ảnh trong khung Polaroid ở màn 3 (ảnh dọc 4:5)
music/nhac-nen.mp3  nhạc nền
```

## Cách thay
- **Ảnh:** chép đè ảnh mới lên file cũ, giữ nguyên tên. Muốn thêm ảnh Polaroid thì thêm đường dẫn vào `galleryImages` trong `js/config.js`.
- **Nhạc:** chép đè file mp3 mới lên `music/nhac-nen.mp3` (file hiện tại chỉ là nhạc mẫu).
- **Lời thư:** sửa `letterTitle`, `letterGreeting`, `letterContent` trong `js/config.js`.

## Chạy thử trên máy
Mở `index.html` bằng trình duyệt. Nhạc sẽ phát sau lần chạm đầu tiên vào màn hình.

## Đưa lên GitHub Pages
```
git init
git add .
git commit -m "Qua tang 20/10"
git branch -M main
git remote add origin https://github.com/TEN-CUA-BAN/TEN-REPO.git
git push -u origin main
```
Sau đó vào **Settings → Pages**, chọn nhánh `main`, thư mục `/ (root)` và Save. Vài phút sau trang sẽ có link dạng `https://TEN-CUA-BAN.github.io/TEN-REPO/`.
