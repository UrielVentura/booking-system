import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { Providers } from '@/components/providers';
import { MuiThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Booking System',
  description: 'Schedule appointments with Google Calendar integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <MuiThemeProvider>
          <AuthProvider>
            <Providers>
              {children}
              <Toaster position='top-right' />
            </Providers>
          </AuthProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
