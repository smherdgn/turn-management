
import { User, NewUserCredentials } from '../types';
import { DEFAULT_REALM } from '../constants';

let mockUsers: User[] = [
  { username: 'user1', realm: DEFAULT_REALM },
  { username: 'testuser', realm: DEFAULT_REALM },
  { username: 'guest', realm: DEFAULT_REALM },
];

// Simulate API call delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getUsers = async (): Promise<User[]> => {
  await simulateDelay();
  // Simulates parsing the output of `turnadmin -L -r REALM`
  // which would list usernames for the specified realm.
  // Here, we return a structured list directly.
  return [...mockUsers];
};

export const addUser = async (credentials: NewUserCredentials): Promise<User> => {
  await simulateDelay();
  const { username, password } = credentials;

  if (!username || !password) {
    throw new Error("Username and password are required.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  if (mockUsers.find(user => user.username === username && user.realm === DEFAULT_REALM)) {
    throw new Error(`User '${username}' already exists in realm '${DEFAULT_REALM}'.`);
  }
  // Simulates `turnadmin -a -u USER -p PASS -r REALM`
  const newUser: User = { username, realm: DEFAULT_REALM };
  mockUsers.push(newUser);
  return newUser;
};

export const deleteUser = async (username: string): Promise<void> => {
  await simulateDelay();
  // Simulates `turnadmin -d -u USER -r REALM`
  const initialLength = mockUsers.length;
  mockUsers = mockUsers.filter(user => !(user.username === username && user.realm === DEFAULT_REALM));
  if (mockUsers.length === initialLength) {
    throw new Error(`User '${username}' not found in realm '${DEFAULT_REALM}'.`);
  }
};
