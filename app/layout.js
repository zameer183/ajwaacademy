import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import Script from "next/script";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthWrapper from "../components/AuthWrapper";
import AbortErrorSilencer from "../components/AbortErrorSilencer";
import WhatsAppFloating from "../components/WhatsAppFloating";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.ajwaacademy.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Online Quran Classes | Learn Quran Online with Expert Teachers – Ajwa Academy",
    template: "%s | Ajwa Academy",
  },
  description:
    "Join Ajwa Academy to learn the Quran online with certified teachers. We offer one-to-one online Quran classes for kids and adults worldwide, including the UK, USA, Canada, and UAE. Start your free trial Quran class today.",
  keywords: [
    "online Quran academy",
    "Quran learning online",
    "learn Quran online worldwide",
    "online Quran classes",
    "Quran learning for kids",
    "Quran learning for adults",
    "Quran teachers online",
    "Tajweed course online",
    "Islamic studies online",
    "Quran memorization online",
    "Quran recitation course",
    "Quran tafseer online",
    "learn Arabic online",
    "Quran academy Pakistan",
    "Quran academy worldwide",
    "Ajwa Academy",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Online Quran Classes | Learn Quran Online with Expert Teachers – Ajwa Academy",
    description:
      "Join Ajwa Academy to learn the Quran online with certified teachers. One-to-one online Quran classes for kids and adults worldwide.",
    url: siteUrl,
    siteName: "Ajwa Academy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ajwa Academy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Quran Classes | Ajwa Academy",
    description:
      "Learn the Quran online with certified teachers. One-to-one online Quran classes for kids and adults worldwide.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EW1NLQJWTD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EW1NLQJWTD');
          `}
        </Script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
              } catch (e) {}
            `,
          }}
        />
        <ThemeProvider>
          <AbortErrorSilencer />
          <AuthWrapper>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <WhatsAppFloating />
            </div>
          </AuthWrapper>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Ajwa Academy",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              sameAs: [
                "https://www.facebook.com/ajwaacademyy",
                "https://www.instagram.com/ajwaacademyofficial/",
                "https://www.linkedin.com/company/http-ajwaacademy.com/?viewAsMember=true",
                "https://x.com/ajwaacademy786",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Ajwa Academy",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
