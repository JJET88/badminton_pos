"use client";

import useAuthStore from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function LogoutBtn() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer"
    >
      Logout
    </button>
  );
}
