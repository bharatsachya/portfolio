"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-md shadow-sm z-50"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold">Lovanshu Garg</Link>
        <div className="space-x-6">
          {navItems.map(item => (
            <Link key={item.name} href={item.href} className="hover:text-blue-600 transition">
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
