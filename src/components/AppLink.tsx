import React from "react";
import { TRoutePaths } from "@/routes";
import { Link, LinkProps } from "react-router-dom";

type TAppLinkProps = Omit<LinkProps, "to"> & {
  to: TRoutePaths;
  params?: Record<string, string>;
};

const AppLink: React.FC<TAppLinkProps> = ({ to, params, ...props }) => {
  let path = to as string;
  // 
  if (path.includes(":") && !params) {
    throw new Error("Missing params for path: " + path);
  }

  if (params) {
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        path = path.replace(`:${key}`, params[key]);
      }
    });
  }

  return <Link to={path} {...props} />;
};

export default AppLink;
