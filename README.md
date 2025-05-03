Cấu trúc thư mục Prototype

project-root/
├── backend/
│ ├── app.js # Main backend server
│ ├── testThoiGianThucThi.js # Script to test API response times
│ ├── ...
├── .env # Environment variables
├── Dockerfile # Dockerfile for backend and tester
├── docker-compose.yml # Docker Compose configuration
├── wait-for-it.sh # Script to wait for services to be ready
└── README.md # Project documentation

Các bước thực hiện :

1.Tải docker desktop và phải có file env

2.docker-compose up --build : để build docker-compose

3.docker-compose logs : xem tất cả các logs

4. docker-compose logs tester : xem log của tester là phần prototype

docker-compose down : dừng container.
