"use client";

import { useAtomValue, useSetAtom } from "jotai";
import {
  errorMessageAtom,
  loadingMessageAtom,
  screenAtom,
  organizationIdAtom,
  contactSessionIdAtomFamily,
} from "../../atoms/widget-atoms";

import { Loader } from "lucide-react";
import { WidgetHeader } from "../components/widget-header";
import { useState, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

type Props = {
  organizationId: string | null;
};

type InitStep = "org" | "session" | "settings" | "vapi" | "done";
export const WidgetLoadingScreen = ({ organizationId }: Props) => {
  const [step, setStep] = useState<InitStep>("org");
  const [sessionValid, setSessionValid] = useState<boolean>(false);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  // step 1: validate organization
  const validateOrganizationAction = useAction(
    api.public.organizations.validateOrganization
  );

  useEffect(() => {
    if (step !== "org") return;

    setLoadingMessage("Finding organization ID...");

    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("error");
      return;
    }

    setLoadingMessage("Verifying organization...");
    validateOrganizationAction({ organizationId })
      .then((res) => {
        console.log({ res });
        if (res.valid) {
          setOrganizationId(organizationId);
          setStep("session");
        } else {
          setErrorMessage(res.message);
          setScreen("error");
        }
      })
      .catch((error) => {
        setErrorMessage("Unable to verify organization");
        setScreen("error");
      });
  }, [
    step,
    setStep,
    organizationId,
    setErrorMessage,
    setScreen,
    validateOrganizationAction,
    setOrganizationId,
    setLoadingMessage,
  ]);

  // step 2: validate session (if exists)
  const validateContactSessionMutation = useMutation(
    api.public.contactSessions.validateContactSession
  );

  useEffect(() => {
    if (step !== "session") return;

    if (!contactSessionId) {
      setSessionValid(false);
      setStep("done");
      return;
    }

    setLoadingMessage("Finding contact session ID...");

    setLoadingMessage("Validating contact session...");
    validateContactSessionMutation({ contactSessionId: contactSessionId })
      .then((res) => {
        if (res.valid) {
          setSessionValid(res.valid);
          setStep("done");
        } else {
          setErrorMessage(res.message);
          setScreen("error");
        }
      })
      .catch((error) => {
        setErrorMessage("Unable to verify asession");
        setScreen("error");
        setStep("done");
      });
  }, [
    step,
    setStep,
    organizationId,
    setErrorMessage,
    setScreen,
    validateContactSessionMutation,
    setOrganizationId,
    setLoadingMessage,
  ]);

  useEffect(() => {
    if (step !== "done") return;

    const hasValidSession = contactSessionId && sessionValid;

    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, sessionValid, setScreen, contactSessionId]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className=" text-3xl">Hi there! 👋🏽👋🏽</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <Loader className="animate-spin" />
        <p className="text-sm ">{loadingMessage || "Loading..."}</p>
      </div>
    </>
  );
};
