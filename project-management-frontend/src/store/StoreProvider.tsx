"use client"; // এই লাইনটি এটিকে একটি ক্লায়েন্ট কম্পোনেন্টে পরিণত করে

import { Provider } from "react-redux";
import { store } from "./store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}