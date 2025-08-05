"use client";

import { SignIn } from "@clerk/nextjs";

export const SignInScreen = () => {
  return <SignIn routing="hash" />;
};
