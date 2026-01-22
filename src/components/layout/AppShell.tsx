import { useState } from 'react';
import type { ReactNode } from 'react';
import { TopNavigation } from './TopNavigation';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  onLoad: () => void;
  onSave: () => void;
}

export function AppShell({ children, onLoad, onSave }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNavigation
        onLoad={onLoad}
        onSave={onSave}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar: visible on lg+ */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Drawer: overlay on < lg */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-xl">
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
