"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProjectCard({ title, description, image, link }: any) {
  return (
    <motion.div
      className="border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
      whileHover={{ scale: 1.03 }}
    >
      <Image src={image} alt={title} width={600} height={400} className="object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link href={link} target="_blank" className="text-blue-600 font-medium hover:underline">
          View Project →
        </Link>
      </div>
    </motion.div>
  );
}
