"use client";

interface BottomBarProps {
  children: React.ReactNode;
}

export default function BottomBar({ children }: BottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
        {children}
      </div>
    </div>
  );
}
