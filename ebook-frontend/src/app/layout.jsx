import "./globals.css";
import { AuthProvider } from "./lib/auth";
import AnalyticsTracker from "@/components/AnalyticsTracker";
export const metadata = {
  title: "Une béninoise en Martinique",
  description: "eBook officiel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <AuthProvider>
          <AnalyticsTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
