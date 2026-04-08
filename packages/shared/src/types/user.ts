export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
