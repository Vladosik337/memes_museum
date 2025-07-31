import "next-auth";

declare module "next-auth" {
  interface User {
    first_name?: string;
    last_name?: string;
    role?: string;
    oidc_sub?: string;
  }
  interface Session {
    user: User;
  }
}
