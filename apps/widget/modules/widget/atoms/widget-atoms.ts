import { atom } from "jotai";
import { WidgetScreen } from "../types";

export const contactSessionIdAtom = atom<string | null>(null);

export const screenAtom = atom<WidgetScreen>("auth");
