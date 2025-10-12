"use client";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="h-[90vh] flex flex-col justify-center items-center text-center px-4">
      <motion.h1
        className="text-5xl md:text-6xl font-bold mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Hi, I'm <span className="text-blue-600">Lovanshu Garg</span>
      </motion.h1>
      <motion.p
        className="text-lg text-gray-600 max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Full Stack Developer | AI Enthusiast | Builder of Awesome Experiences
      </motion.p>
    </section>
  );
}
