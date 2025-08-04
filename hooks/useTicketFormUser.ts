import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

export function useTicketFormUser(setForm: (f: any) => void) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setForm((prev: any) => ({
        ...prev,
        firstName: session.user.first_name || "",
        lastName: session.user.last_name || "",
        email: session.user.email || "",
      }));
    }
  }, [status, session, setForm]);

  return {
    isAuthenticated: status === "authenticated",
    user: session?.user,
    loading: status === "loading",
    signIn,
  };
}
