import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/provider/QueryProvider";
import NavBare from "@/components/NavBare";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";





const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Icc Client Data",
  description: "ICC Client data by Rahat",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col ">
        <header>
          <NavBare />
        </header>
        <main className=" flex-1">
          <QueryProvider>
            {children}
            
          </QueryProvider>
          <Toaster/>
        </main>

        <div>
          <Footer/>
        </div>
      </body>
    </html>
  );
}
