import "./footer.css";
export const Footer = () => {
  return (
    <div className="mt-auto flex w-full gap-5 ">
      <footer className="footer">
        <div className="container3">
          <div className="row footer-content">
            <section
              className="col-md-4 col-12"
              aria-labelledby="gettingStartedTitle"
            >
              <h2>P2N</h2>
              <ul>
                <li>
                  <a className="nav-link" href="/About">
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a className="nav-link" href="/Contact">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </section>
            <section
              className="col-md-4 col-12"
              aria-labelledby="resourcesTitle"
            >
              <h2>Tài Nguyên</h2>
              <ul>
                <li>
                  <a className="nav-link" href="/Ontap">
                    FlashCard Ôn Tập
                  </a>
                </li>
                <li>
                  <a className="nav-link" href="/KyThi">
                    Tham Gia Đề Thi
                  </a>
                </li>
              </ul>
            </section>
            <section
              className="col-md-4 col-12"
              aria-labelledby="contactInfoTitle"
            >
              <h2>Thông Tin Liên Hệ</h2>
              <ul className="contact-info">
                <li>
                  <i className="fa fa-phone" aria-hidden="true"></i> Số Điện
                  Thoại: 0123456789
                </li>
                <li>
                  <i className="fa fa-address-card" aria-hidden="true"></i> Địa
                  Chỉ: Đại Học Thủ Dầu Một
                </li>
                <li>
                  <i className="fa fa-envelope" aria-hidden="true"></i> Email:
                  contact@domain.com
                </li>
              </ul>
            </section>
          </div>
        </div>
      </footer>
    </div>
  );
};
