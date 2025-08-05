"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { AuthLayout } from "../layouts/auth-layout";
import { SignInScreen } from "../screens/sign-in.screen";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthLoading>
        <AuthLayout>Loading...</AuthLayout>
      </AuthLoading>
      <Authenticated>
        <AuthLayout>{children}</AuthLayout>
      </Authenticated>
      <Unauthenticated>
        <AuthLayout>
          <SignInScreen />
        </AuthLayout>
      </Unauthenticated>
    </>
  );
};
