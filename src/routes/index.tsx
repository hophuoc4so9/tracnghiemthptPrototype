import { ReactNode } from "react";
import { LinkProps } from "react-router-dom";

import {
  ProtectedRouteAdmin,
  ProtectedRouteUser,
  ProtectedRouteTeacher,
} from "@/components/ProtectedRoute";
import Layout from "@/pages/default/Layout";
import Home from "@/pages/default/Home";
import { Login } from "@/pages/default/Login";
import { SignUp } from "@/pages/default/Login/SignUp";
import LayoutGiaoVien from "@/pages/giaovien/LayoutGiaoVien";
import { DashBoardGiaoVien } from "@/pages/giaovien/DashBoard";
import { QuanLyCauHoi } from "@/pages/giaovien/QuanLyCauHoi";
import NotFound from "@/pages/NotFound";
import { UpdateExamQuestion } from "@/pages/giaovien/QuanLyDeThi/DeThi/UpdateExam";
import { KyThi } from "@/pages/default/KyThi";
import { DetailExam } from "@/pages/default/KyThi/BaiLam/DetailExam";
import { KetQua } from "@/pages/default/KyThi/KetQua";
import QuanLyDeThiIndex from "@/pages/giaovien/QuanLyDeThi/indexDeThi";
import { CreateExamQuestion } from "@/pages/giaovien/QuanLyDeThi/DeThi/CreateExamQuestion.tsx";
import BaiLam from "@/pages/default/KyThi/BaiLam/BaiLam";
export enum ERolePath {
  ADMIN = 2,
  GIAOVIEN = 3,
  USER = 1,
  STUDENT = 0,
}

// const isCorrectPath = (path: string) => {
//   if (!path.startsWith("/")) return false;
//   return true;
// };

export const createRoute = (
  path: TRoutePaths,
  element: ReactNode,
  roleAccess?: number
) => {
  if (roleAccess) {
    const Wrapper = roleAccess === 2 ? ProtectedRouteAdmin : (roleAccess === 3? ProtectedRouteTeacher : ProtectedRouteUser ) ;
    element = <Wrapper>{element}</Wrapper>;
  }

  return {
    path,
    element,
  };
};

export const router = [
  {
    path: "/",
    element: <Layout />,
    children: [
      createRoute("/", <Home />, ERolePath.USER),

      createRoute("/KyThi", <KyThi />, ERolePath.USER),
      createRoute("/KyThi/ChiTiet/:_id", <DetailExam />, ERolePath.USER),
      createRoute("/KyThi/BaiLam/", <BaiLam />, ERolePath.USER),
      createRoute("/KetQua", <KetQua />, ERolePath.USER),

    ],
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      createRoute("/Login", <Login />, ERolePath.USER),
      createRoute("/SignUp", <SignUp />, ERolePath.USER),
    ],
  },
  {
    path: "/",
    element: <LayoutGiaoVien />,
    children: [
      createRoute("/GiaoVien", <DashBoardGiaoVien />, ERolePath.GIAOVIEN),
      createRoute("/giaovien/NganHangCauHoi", <QuanLyCauHoi />, ERolePath.GIAOVIEN),
      createRoute(
        "/giaovien/QuanLyDeThi",
        <QuanLyDeThiIndex />,
        ERolePath.GIAOVIEN
      ),
      createRoute(
        "/giaovien/QuanLyDeThi/CreateExam",
        <CreateExamQuestion />,
        ERolePath.GIAOVIEN
      ),
      createRoute(
        "/giaovien/QuanLyDeThi/UpdateExam/:_id",
        <UpdateExamQuestion />,
        ERolePath.GIAOVIEN
      ),

    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

const paths = {
  "/": ["/"],
  "/About": ["/About"],
  "/Contact": ["/Contact"],
  "/Login": ["/Login"],
  "/forgetPass": ["/forgetPass"],
  "/SignUp": ["/SignUp"],
  "/PhongThi": ["/PhongThi"],
  "/PhongThi/Detail/:classroomId": ["/PhongThi/Detail/:classroomId"],
  "/GiaoVien": ["/GiaoVien"],
  "/NganHangCauHoi": ["/NganHangCauHoi"],
  "/giaovien/NganHangCauHoi": ["/giaovien/NganHangCauHoi"],
  "/Admin": ["/Admin"],
  "/OnTap": ["/OnTap"],
  "/giaovien/QuanLyDeThi": ["/giaovien/QuanLyDeThi"],
  "/Admin/DangCauHoi": ["/Admin/DangCauHoi"],
  "/giaovien/QuanLyDeThi/CreateExam": ["/giaovien/QuanLyDeThi/CreateExam"],
  "/giaovien/QuanLyDeThi/UpdateExam/:_id": [
    "/giaovien/QuanLyDeThi/UpdateExam/:_id",
  ],
  "GiaoVien/QuanLyBaoLoi": ["/GiaoVien/QuanLyBaoLoi"],
  "/KyThi/ChiTiet/:_id": ["/KyThi/ChiTiet/:_id"],
  "/KyThi": ["/KyThi"],
  "/KyThi/BaiLam/": ["/KyThi/BaiLam/"],
  "/KetQua": ["/KetQua"],
  "/giaovien/QuanLyAudio": ["/giaovien/QuanLyAudio"],
  "/FlashCard/:_id": ["/FlashCard/:_id"],
  "/flashcard/create": ["/flashcard/create"],
  "/flashcard/edit/:_id": ["/flashcard/edit/:_id"],
  "/flashcard/exam/:id": ["/flashcard/exam/:id"],
  "/profile": ["/profile"],
  "/Admin/QuanLyTaiKhoan": ["/Admin/QuanLyTaiKhoan"],
  "/giaovien/QuanLyLopHoc": ["/giaovien/QuanLyLopHoc"],
  "/giaovien/QuanLyLopHoc/:_classroom_id": [
    "/giaovien/QuanLyLopHoc/:_classroom_id",
  ],
} as const;

export type TRoutePaths = (typeof paths)[keyof typeof paths][number] &
  LinkProps["to"];
