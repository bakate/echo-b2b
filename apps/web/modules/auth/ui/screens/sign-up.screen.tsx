"use client";

import { SignUp } from "@clerk/nextjs";

export const SignUpScreen = () => {
  return <SignUp routing="hash" />;
};
