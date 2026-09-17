import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <SignIn
        routing="hash"
        signUpUrl="/login"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#d4a647",
            colorBackground: "#141a2a",
            colorForeground: "#e8edf5",
            colorInput: "#1c2333",
            colorInputForeground: "#e8edf5",
          },
        }}
      />
    </div>
  );
}
