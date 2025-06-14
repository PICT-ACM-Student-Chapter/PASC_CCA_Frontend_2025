"use client";
import React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Sun, Moon, User } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = () => {
  return (
    <nav className="w-full top-0">
      <div className="flex justify-between mx-auto shadow-md  px-5 py-2">
        <div className="flex items-center">
          <Image src="/logo.png" width={120} height={80} alt="logo" priority />
        </div>
        <div className="flex items-center gap-6">
          <ThemeSwitcher />

          <div className="bg-profile  p-2 rounded-full">
            <User className="h-8 w-8 p-0.5" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
