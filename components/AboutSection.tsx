"use client";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <motion.section
      className="max-w-5xl mx-auto py-20 px-4"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-semibold mb-4">About Me</h2>
      <p className="text-gray-700 leading-relaxed">
        I'm a passionate full-stack developer with experience in building AI-integrated applications,
        crafting modern UI/UX with React and Next.js, and exploring ways to make technology intuitive and human-friendly.
      </p>
    </motion.section>
  );
}
