import "../style/global.css";
import Providers from "./providers";
import ReduxInit from "./reduxInit";
import type { Metadata } from "next";
import Notification from "./notification";

export const metadata: Metadata = {
  title: "MeetUp",
  description: "Real-time Chat & Video Calling",
  icons: {
    icon: "/MeetUpIcon.ico",
    shortcut: "/MeetUpIcon.ico",
    apple: "/MeetUpIcon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ReduxInit>
            <Notification />
            {children}
          </ReduxInit>
        </Providers>
      </body>
    </html>
  );
}
