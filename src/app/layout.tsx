import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "שמור על עצמך | מעקב משקל והליכה",
  description: "מערכת לשמירה על משקל, מעקב דקות הליכה, טיפים יומיים ואתגרים",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered'))
                    .catch(err => console.log('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
