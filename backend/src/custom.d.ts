export type AuthenticatedUser = {
  id: string;
  email: string;
  fname?: string | null;
  lname?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}