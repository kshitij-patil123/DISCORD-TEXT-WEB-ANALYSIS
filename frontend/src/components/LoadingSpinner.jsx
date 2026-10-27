import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading analysis data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Loader2 className="w-8 h-8 text-[#5865F2] animate-spin" />
      <span className="text-sm font-medium text-[#949ba4]">{message}</span>
    </div>
  );
}
