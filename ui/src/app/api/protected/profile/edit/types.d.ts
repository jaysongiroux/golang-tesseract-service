export type EditProfileResponse =
  | {
      name: string;
      id: string;
    }
  | {
      error: string;
    };
