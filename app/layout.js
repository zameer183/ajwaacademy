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
const isProduction = process.env.NODE_ENV === "production";
const gtmId = "GTM-W9TJ994N";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Online Quran Classes | Learn Quran Online with Tajweed",
    template: "%s | Ajwa Academy",
  },
  description:
    "Learn the Quran online with Tajweed at Ajwa Academy through live online Quran classes. Study with certified Quran teachers and join Quran memorisation classes.",
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
    title: "Online Quran Classes | Learn Quran Online with Tajweed",
    description:
      "Learn the Quran online with Tajweed at Ajwa Academy through live online Quran classes. Study with certified Quran teachers and join Quran memorisation classes.",
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
    title: "Online Quran Classes | Learn Quran Online with Tajweed",
    description:
      "Learn the Quran online with Tajweed at Ajwa Academy through live online Quran classes. Study with certified Quran teachers and join Quran memorisation classes.",
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
        {isProduction && (
          <>
            <Script id="google-tag-manager" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `}
            </Script>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-EW1NLQJWTD"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                if (!window.__ajwaGaInitialized) {
                  gtag('js', new Date());
                  gtag('config', 'G-EW1NLQJWTD');
                  window.__ajwaGaInitialized = true;
                }
              `}
            </Script>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '4316457221926143');
                fbq('track', 'PageView');
              `}
            </Script>
          </>
        )}
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
              {isProduction && (
                <noscript>
                  <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                    height="0"
                    width="0"
                    style={{ display: "none", visibility: "hidden" }}
                    title="gtm"
                  />
                  <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src="https://www.facebook.com/tr?id=4316457221926143&ev=PageView&noscript=1"
                    alt="Meta pixel tracker"
                  />
                </noscript>
              )}
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
              logo: `${siteUrl}/ajwa-logo.png`,
              telephone: "+92-326-0054808",
              email: "ajwaacademyofficial@gmail.com",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+92-326-0054808",
                contactType: "customer service",
                availableLanguage: ["English", "Urdu"],
              },
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








