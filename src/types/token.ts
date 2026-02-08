export type DecodedToken = {
  userId: number;
  email: string;
};

export type Token = {
  accessToken: string;
  refreshToken: string;
};
