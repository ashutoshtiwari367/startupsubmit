import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaunchOS — The Modern Product Launch Platform",
  description: "Launch your SaaS & AI products, get real upvotes, and earn high-authority backlinks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                localStorage.removeItem("launchos-theme");
                document.documentElement.classList.remove("dark");
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#FAFAF7] text-[#0F0F10] antialiased">
        {children}
      </body>
    </html>
  );
}
