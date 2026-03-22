import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Auth {
  name?: string;
  email: string;
  password: string;
}

export function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loginWithEmail = async ({ email, password }: Auth) => {
    await authClient.signIn.email(
      { email, password },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onError: (ctx) => {
          setIsLoading(false);
          console.error(ctx.error);
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          setIsLoading(false);
          router.replace("/");
        },
      },
    );
  };
  return {
    isLoading,
    loginWithEmail,
  };
}

export function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const registerWithEmail = async ({ name, email, password }: Auth) => {
    await authClient.signUp.email(
      { email, password, name: name ?? "anonymous" },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onError: (ctx) => {
          setIsLoading(false);
          console.error(ctx.error);
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          setIsLoading(false);
          router.replace("/");
        },
      },
    );
  };
  return {
    isLoading,
    registerWithEmail,
  };
}

export function useLogout() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          router.replace("/auth/login");
        },
        onError: (ctx) => {
          setIsLoading(false);
          console.error(ctx.error);
          toast.error(ctx.error.message);
        },
      },
    });
  };
  return {
    isLoading,
    logout,
  };
}
