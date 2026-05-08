import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
    title: 'Workshop & Class Booking',
    description: 'SWD A3 - Jikun Li & Jingzu Ge',
};

export default function RootLayout({ children }) {
    return (
          <html lang="en">
            <body>
              <Navbar />
              <main>{children}</main>
          <footer style={{
                textAlign: 'center', padding: 20, color: '#888',
                borderTop: '1px solid #eee', marginTop: 40,
    }}>
          SWD A3 · Jikun Li &amp; Jingzu Ge
            </footer>
            </body>
            </html>
  );
}
