import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
  // This return statement will not be reached in practice because redirect()
  // throws an error that Next.js handles to perform the redirection.
  // However, a component should technically return a valid ReactNode.
  return null;
}
