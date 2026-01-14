import { Link, useLocation, useNavigate } from "react-router-dom";

function Footer() {
  return (
    <div className="border-t border-gray-300 w-full px-15 py-6">
      <div className="py-4 px-2">
        <div className="flex flex-wrap justify-between text-[13px] text-gray-800 font-sans">
          {/* Column 1 */}
          <div className="w-full sm:w-auto sm:flex-shrink-0 sm:max-w-[280px] mb-6 sm:mb-0">
            <div className="mb-2 text-center sm:text-left text-[14px] font-normal">
              Tổng đài hỗ trợ miễn phí
            </div>
            <div className="text-[12px] text-gray-700 leading-tight mb-4">
              <div>
                Mua hàng - bảo hành{" "}
                <span className="font-semibold">1800.2097</span> (7h30 - 22h00)
              </div>
              <div>
                Khiếu nại <span className="font-semibold">1800.2063</span> (8h00 -
                21h30)
              </div>
            </div>
            <div className="text-[14px] font-normal mb-2">
              Phương thức thanh toán
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              <img
                alt="Apple Pay logo, black apple icon with Pay text"
                className="h-5"
                height="20"
                src="https://storage.googleapis.com/a1aa/image/516c97ac-8a15-4362-d292-db8123b59b8c.jpg"
                width="40"
              />
              <img
                alt="VNPAY logo in red and blue text"
                className="h-5"
                height="20"
                src="https://storage.googleapis.com/a1aa/image/dce86fa6-f14d-41e0-5713-512eef7dda00.jpg"
                width="40"
              />
              <img
                alt="MOMO logo in pink text"
                className="h-5"
                height="20"
                src="https://storage.googleapis.com/a1aa/image/5cba8bbb-492b-4ae0-90c2-f18d7815424d.jpg"
                width="40"
              />
              <img
                alt="OnePAY logo in blue text"
                className="h-5"
                height="20"
                src="https://storage.googleapis.com/a1aa/image/60bb7f6e-5e94-4825-76fc-4411d0255206.jpg"
                width="40"
              />
              <img
                alt="MPOS logo in orange and red text"
                className="h-5"
                height="20"
                src="https://storage.googleapis.com/a1aa/image/9e0eaedf-2afa-4ef8-1a8a-465019405677.jpg"
                width="40"
              />
              <img
                alt="Kredivo logo in blue and red text"
                className="h-5"
                height="20"
                src="https://storage.googleapis.com/a1aa/image/2721890c-8596-473b-0286-3e84e8b7d242.jpg"
                width="40"
              />
              <img
                alt="ZaloPay logo in green and blue text"
                className="h-5"
                height="20"
                src="https://storage.googleapis.com/a1aa/image/d92bc52b-c367-44df-7315-9bd1588fe3d8.jpg"
                width="40"
              />
              <img
                alt="AlePay logo in yellow and blue text"
                className="h-5"
                height="20"
                src="https://storage.googleapis.com/a1aa/image/8d2f223c-f18b-4ae2-1e6c-1a2ad3330195.jpg"
                width="40"
              />
              <img
                alt="Fundiin logo in blue text"
                className="h-5"
                height="20"
                src="https://storage.googleapis.com/a1aa/image/ff6562ed-a64d-4b90-8adc-788cb7fa036b.jpg"
                width="40"
              />
            </div>
            <div className="font-semibold text-[14px] mb-1">
              ĐĂNG KÝ NHẬN TIN KHUYẾN MÃI
            </div>
            <div className="text-[12px] mb-1 text-red-600 font-normal">
              (*) Nhận ngay voucher 10%
            </div>
            <div className="text-[10px] mb-3 text-gray-700 font-normal">
              *Voucher sẽ được gửi sau 24h, chỉ áp dụng cho khách hàng mới
            </div>
            <form className="space-y-2">
              <input
                className="w-full rounded border border-gray-300 px-3 py-2 text-[12px] text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Email *"
                type="email"
              />
              <input
                className="w-full rounded border border-gray-300 px-3 py-2 text-[12px] text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Số điện thoại"
                type="tel"
              />
              <label className="flex items-center text-[11px] text-red-600 font-normal">
                <input defaultChecked className="mr-1 w-3 h-3" type="checkbox" />
                Tôi đồng ý với điều khoản của
              </label>
              <button
                className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold text-[13px] py-2 rounded"
                type="submit"
              >
                ĐĂNG KÝ NGAY
              </button>
            </form>
          </div>
          {/* Column 2 */}
          <div className="w-full sm:w-auto sm:flex-shrink-0 sm:max-w-[220px] mb-6 sm:mb-0 text-[12px] text-gray-700 font-normal">
            <div className="mb-2 font-normal text-[14px]">
              Thông tin và chính sách
            </div>
            <ul className="space-y-1 leading-tight">
              <li>Mua hàng và thanh toán Online</li>
              <li>Mua hàng trả góp Online</li>
              <li>Mua hàng trả góp bằng thẻ tín dụng</li>
              <li>Chính sách giao hàng</li>
              <li>Chính sách đổi trả</li>
              <li>Tra điểm Thành viên</li>
              <li>Xem ưu đãi Thành viên</li>
              <li>Tra thông tin bảo hành</li>
              <li>Tra cứu hoá đơn điện tử</li>
              <li>Thông tin hoá đơn mua hàng</li>
              <li>Trung tâm bảo hành chính hãng</li>
              <li>Quy định về việc sao lưu dữ liệu</li>
              <li>Chính sách khui hộp sản phẩm Apple</li>
            </ul>
          </div>
          {/* Column 3 */}
          <div className="w-full sm:w-auto sm:flex-shrink-0 sm:max-w-[220px] mb-6 sm:mb-0 text-[12px] text-gray-700 font-normal">
            <div className="mb-2 font-normal text-[14px]">
              Dịch vụ và thông tin khác
            </div>
            <ul className="space-y-1 leading-tight mb-2">
              <li>Khách hàng doanh nghiệp (B2B)</li>
              <li>Ưu đãi thanh toán</li>
              <li>Quy chế hoạt động</li>
              <li>Chính sách bảo mật thông tin cá nhân</li>
              <li>Chính sách Bảo hành</li>
              <li>Liên hệ hợp tác kinh doanh</li>
              <li>Tuyển dụng</li>
              <li>Dịch vụ bảo hành mở rộng</li>
              <li className="flex items-center gap-1">
                <img
                  alt="S member icon in red"
                  className="inline-block"
                  height="14"
                  src="https://storage.googleapis.com/a1aa/image/db9ab1e8-5e0c-40b6-ec73-5e403f3ec84e.jpg"
                  width="14"
                />
                Tích điểm &amp; sử dụng ưu đãi
              </li>
            </ul>
            <div className="flex gap-2">
              <img
                alt="QR code black and white square pattern"
                className="h-20 w-20"
                height="80"
                src="https://storage.googleapis.com/a1aa/image/cfbb05b3-e956-4226-c131-f70ebf77429e.jpg"
                width="80"
              />
              <div className="flex flex-col gap-2">
                <img
                  alt="Google Play store badge with Google Play icon and text"
                  className="h-10 w-auto"
                  height="40"
                  src="https://storage.googleapis.com/a1aa/image/195c5199-e04f-46e4-6d31-bb6ed2f2aec5.jpg"
                  width="100"
                />
                <img
                  alt="Apple App Store badge with Apple icon and text"
                  className="h-10 w-auto"
                  height="40"
                  src="https://storage.googleapis.com/a1aa/image/9ccc9287-01bd-4411-8353-c208d1860ac2.jpg"
                  width="100"
                />
              </div>
            </div>
          </div>
          {/* Column 4 */}
          <div className="w-full sm:w-auto sm:flex-shrink-0 sm:max-w-[220px] text-[12px] text-gray-700 font-normal">
            <div className="mb-2 font-normal text-[14px]">
              Kết nối với bọn mình
            </div>
            <div className="flex gap-2 mb-4">
              <a aria-label="YouTube" href="#">
                <img
                  alt="YouTube icon red and white"
                  className="h-7 w-7"
                  height="30"
                  src="https://storage.googleapis.com/a1aa/image/72dde191-0191-4ed1-f609-b93b8b0da311.jpg"
                  width="30"
                />
              </a>
              <a aria-label="Facebook" href="#">
                <img
                  alt="Facebook icon blue and white"
                  className="h-7 w-7"
                  height="30"
                  src="https://storage.googleapis.com/a1aa/image/5e86cb40-e407-4d69-17b9-c0172082c55d.jpg"
                  width="30"
                />
              </a>
              <a aria-label="Instagram" href="#">
                <img
                  alt="Instagram icon gradient"
                  className="h-7 w-7"
                  height="30"
                  src="https://storage.googleapis.com/a1aa/image/b69feffa-fde1-4da3-17a4-b93eb4b15057.jpg"
                  width="30"
                />
              </a>
              <a aria-label="TikTok" href="#">
                <img
                  alt="TikTok icon black and white"
                  className="h-7 w-7"
                  height="30"
                  src="https://storage.googleapis.com/a1aa/image/fee92d3d-a020-42fd-b500-4e53ebf856ba.jpg"
                  width="30"
                />
              </a>
              <a aria-label="Zalo" href="#">
                <img
                  alt="Zalo icon blue and white"
                  className="h-7 w-7"
                  height="30"
                  src="https://storage.googleapis.com/a1aa/image/7b3c7375-1ecc-470e-a396-581e6a23e854.jpg"
                  width="30"
                />
              </a>
            </div>

            <div className="mb-2 font-normal text-[14px]">Website thành viên</div>

            <div className="text-[11px] mb-1">
              Trang thông tin công nghệ mới nhất
            </div>

            <div className="w-20">
              <img
                alt="Sforum.vn logo red background with white text"
                className=""
                src="https://scontent.fhan19-1.fna.fbcdn.net/v/t39.30808-6/560340109_1406809274697020_2709773428328722767_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=yqc_luE2CNIQ7kNvwEGECho&_nc_oc=AdkfB49y5Ug1Jd1qLchgCDwy0GzeiJUwfSmzzM9Lyg7QWH3HFW_IphpqF2RV3S6vwTI&_nc_zt=23&_nc_ht=scontent.fhan19-1.fna&_nc_gid=Jb6xFPgKL8GGqBv0mYykoA&oh=00_AfdDKQ9uS3IgVfonbiIB_LMvBT0VTwas8j7b_gipl02U-g&oe=68F42ED3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Footer;
