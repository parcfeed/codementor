"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
};

export function CodeEditor({
  value,
  onChange,
  language,
  height = "400px",
  readOnly = false,
}: CodeEditorProps) {
  function handleChange(value: string | undefined) {
    onChange(value ?? "");
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-300">
      <MonacoEditor
        height={height}
        language={language}
        value={value}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          tabSize: 2,
        }}
        theme="vs-dark"
      />
    </div>
  );
}
