"use client";

import ErrorBoundary from "../error";

export default function ErrorPreviewPage() {
  const dummyError = new Error("This is a preview error description to verify the layout design.");
  return (
    <ErrorBoundary 
      error={dummyError} 
      reset={() => console.log("Reset callback triggered successfully.")} 
    />
  );
}
