import './globals.css';

export const metadata = {
  title: 'USDC Polygon Payments',
  description: 'Simple USDC payment interface for Polygon network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <div className="container mx-auto py-8">
          {children}
        </div>
      </body>
    </html>
  );
}