import { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

import axios from "axios";

interface DevErrorDetailsProps {
  error: Error;
}

export function DevErrorDetails({ error }: DevErrorDetailsProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="mt-8 rounded-md border border-gray-100 bg-gray-50 p-4">
      <button
        className="flex w-full items-center justify-between text-xs font-semibold text-gray-500 hover:text-gray-700"
        onClick={() => setShowDetails(!showDetails)}
        type="button"
      >
        <span>DEBUG INFORMATION (DEV ONLY)</span>
        {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showDetails && (
        <div className="mt-3 max-h-60 overflow-auto text-left">
          <p className="mb-2 text-xs font-mono font-bold text-red-600">
            {error.name}: {error.message}
          </p>
          {axios.isAxiosError(error) && error.response?.data && (
            <div className="mb-2 rounded bg-gray-100 p-2 text-[10px] font-mono">
              <p className="mb-1 font-bold">API Response:</p>
              <pre>{JSON.stringify(error.response.data, null, 2)}</pre>
            </div>
          )}
          <pre className="text-[10px] text-gray-400">{error.stack}</pre>
        </div>
      )}
    </div>
  );
}
