import type { Metadata } from "next";
import { Padauk } from "next/font/google";
import "./globals.css";

const padauk = Padauk({
  subsets: ["myanmar", "latin"],
  weight: ["400", "700"],
  variable: "--font-padauk",
});

export const metadata: Metadata = {
  title: "ရှယ်ယာနှင့် အမြတ်ငွေ တွက်ချက်မှု",
  description:
    "ရင်းနှီးမြှုပ်နှံသူအဖွဲ့များအတွက် ရန်ပုံငွေနှင့် အမြတ်ကို ခွဲဝေပေးရန် အလွယ်တကူတွက်ချက်နိုင်ပါသည်။",
  openGraph: {
    title: "ရှယ်ယာနှင့် အမြတ်ငွေ တွက်ချက်မှု",
    description:
      "ရင်းနှီးမြှုပ်နှံသူအဖွဲ့များအတွက် ရန်ပုံငွေနှင့် အမြတ်ကို ခွဲဝေပေးရန် အလွယ်တကူတွက်ချက်နိုင်ပါသည်။",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ရှယ်ယာနှင့် အမြတ်ငွေ တွက်ချက်မှု",
    description:
      "ရင်းနှီးမြှုပ်နှံသူအဖွဲ့များအတွက် ရန်ပုံငွေနှင့် အမြတ်ကို ခွဲဝေပေးရန် အလွယ်တကူတွက်ချက်နိုင်ပါသည်။",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="my" className={`${padauk.variable} h-full antialiased`}>
      <body className={`${padauk.className} min-h-full flex flex-col bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
