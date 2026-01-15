import type { Metadata, Viewport } from "next";
import { UserProvider } from "@/providers/UserProvider";
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
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProd = process.env.NODE_ENV === "production";

  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <UserProvider>
          {children}
        </UserProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (!('serviceWorker' in navigator)) return;

                var isProd = ${JSON.stringify(isProd)};

                // In development, a service worker will frequently cache stale Next.js chunks
                // and cause ChunkLoadError / 503 "Offline" responses. Ensure it's disabled.
                if (!isProd) {
                  navigator.serviceWorker.getRegistrations()
                    .then(function (regs) { return Promise.all(regs.map(function (r) { return r.unregister(); })); })
                    .catch(function () {});

                  if (typeof caches !== 'undefined') {
                    caches.keys()
                      .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
                      .catch(function () {});
                  }

                  return;
                }

                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function () { console.log('SW registered'); })
                    .catch(function (err) { console.log('SW registration failed:', err); });
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
