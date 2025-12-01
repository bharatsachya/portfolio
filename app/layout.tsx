import "./globals.css";
export const metadata = {
  title: "Lovanshu Garg | Portfolio",
  description: "Personal portfolio of Lovanshu Garg, Full Stack Developer and AI Enthusiast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
