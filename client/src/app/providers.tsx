"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import {store} from '@/redux/store';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
    >
      <Provider store={store} >
        {children}
      </Provider>
    </GoogleOAuthProvider>
  );
}