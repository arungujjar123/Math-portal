import "./globals.css";

export const metadata = {
  title: "IIIT Sri City UG2 Academic Portal",
  description: "Official portal for slide management, student doubt clearing, and UG2 Monsoon 2026 timetable with free slot highlighter.",
};

// Runs before first paint: applies the saved theme (or the OS preference) so the
// page never flashes light before switching to dark.
const themeScript = `(function(){try{var t=localStorage.getItem("iiits_theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full antialiased selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
