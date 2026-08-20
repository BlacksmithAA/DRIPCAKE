// Tipos de NextAuth extendidos
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    rol: 'cliente' | 'empleado' | 'admin';
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      rol: 'cliente' | 'empleado' | 'admin';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    rol: 'cliente' | 'empleado' | 'admin';
  }
}
