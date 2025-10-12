"use client";
import { motion } from "framer-motion";

export default function ContactForm() {
  return (
    <motion.form
      className="space-y-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <input type="text" placeholder="Your Name" className="w-full border rounded-lg p-3" required />
      <input type="email" placeholder="Your Email" className="w-full border rounded-lg p-3" required />
      <textarea placeholder="Message" className="w-full border rounded-lg p-3 h-32" required />
      <button type="submit" className="w-full bg-blue-600 text-white rounded-lg p-3 font-medium hover:bg-blue-700">
        Send Message
      </button>
    </motion.form>
  );
}
