import UserSidebar from "../components/UserSidebar";
import { Outlet } from "react-router-dom";

export const UserLayout = () => (
  <div className="flex h-screen">
    <UserSidebar />
    <div className="flex-1 ml-54">
      <div className="h-full ">
        <Outlet />
      </div>
    </div>
  </div>
);

