import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="mx-auto flex min-h-screen flex-col items-center justify-center gap-2 text-center">
      <div className="flex gap-4">
        <a href="https://vite.dev" target="_blank">
          <img alt="Vite logo" className="logo" src={viteLogo} />
        </a>
        <a href="https://react.dev" target="_blank">
          <img alt="React logo" className="logo react" src={reactLogo} />
        </a>
      </div>
      <div className="card space-y-2">
        <button
          className="text-body-1 rounded-full border p-2 font-semibold"
          onClick={() => setCount((count) => count + 1)}
          type="button"
        >
          count is {count}
        </button>
        <p className="text-body-3">
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs text-body-3">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
