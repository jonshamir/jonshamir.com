"use client";

import { QueryClient, QueryClientProvider } from "react-query";

import { EmailForm } from "../EmailForm/EmailForm";

const queryClient = new QueryClient();

export function EmailFormWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <EmailForm />
    </QueryClientProvider>
  );
}
