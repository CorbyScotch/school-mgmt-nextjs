"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div>
      <Link href={"/"}>Home</Link> {"  |  "}
      <Link href={"/dashboard"}>Dashboard</Link> {"  |  "}
      <Link href={"/login"}>Login</Link>
    </div>
  );
}
