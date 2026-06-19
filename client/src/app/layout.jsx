import "../style/global.css";
import Providers from "./providers";
import ReduxInit from "./reduxInit";

export default function RootLayout({children}) {
  return (
   <html lang="en">
    <body>
        <Providers>
          <ReduxInit>
            {children}
          </ReduxInit>
          </Providers>
      </body>
   </html>
  )
}
