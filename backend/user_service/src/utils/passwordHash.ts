import bcrypt from 'bcrypt';

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = (plainPassword: string, hashedPassword: string ) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
