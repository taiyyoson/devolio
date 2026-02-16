import { useRef, useEffect } from "react";

export default function TerminalInput({ cwd, value, onChange, onSubmit, loginMode }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  }

  const promptLabel = loginMode === "email"
    ? "email: "
    : loginMode === "password"
    ? "password: "
    : null;

  return (
    <div className="flex gap-0 items-center whitespace-pre" onClick={() => inputRef.current?.focus()}>
      {promptLabel ? (
        <span className="text-yellow-400">{promptLabel}</span>
      ) : (
        <>
          <span className="text-green-400">taiyo@devolio</span>
          <span className="text-gray-500">:</span>
          <span className="text-blue-400">{cwd}</span>
          <span className="text-gray-500">$ </span>
        </>
      )}
      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          type={loginMode === "password" ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => inputRef.current?.focus(), 10)}
          className="absolute inset-0 w-full bg-transparent text-gray-300 outline-none caret-transparent"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <span className="invisible">{loginMode === "password" ? "*".repeat(value.length) : value}</span>
        <span className="inline-block w-[0.6em] h-[1.1em] bg-gray-300 align-middle animate-blink" />
      </div>
    </div>
  );
}
