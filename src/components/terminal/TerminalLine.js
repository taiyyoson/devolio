const typeColors = {
  output: "text-gray-300",
  error: "text-red-400",
  system: "text-yellow-400",
  directory: "text-blue-400",
  prompt: "text-gray-300",
};

export default function TerminalLine({ line }) {
  if (line.type === "prompt") {
    return (
      <div className="flex gap-0 whitespace-pre-wrap break-all">
        <span className="text-green-400">taiyo@devolio</span>
        <span className="text-gray-500">:</span>
        <span className="text-blue-400">{line.cwd}</span>
        <span className="text-gray-500">$ </span>
        <span className="text-gray-300">{line.content}</span>
      </div>
    );
  }

  return (
    <div className={`whitespace-pre-wrap break-all ${typeColors[line.type] || "text-gray-300"}`}>
      {line.content || "\u00A0"}
    </div>
  );
}
