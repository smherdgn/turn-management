
export interface User {
  username: string;
  realm: string;
}

export interface NewUserCredentials {
  username: string;
  password?: string; // Password is required for adding, but not part of User display
}
