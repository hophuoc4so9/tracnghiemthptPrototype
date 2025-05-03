import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const NotFound = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <span
        className="display-1 text-danger "
        style={{
          textShadow: "0px 0px 44px rgba(108, 117, 125, 0.35)", // Adjusted to match Bootstrap's secondary color
          fontWeight: "bold",
        }}
      >
        404 không tìm thấy
      </span>
    </div>
  );
};

export default NotFound;
