export type OneTimeTokenResponse =
  | {
      token: string;
    }
  | {
      error: string;
    };
