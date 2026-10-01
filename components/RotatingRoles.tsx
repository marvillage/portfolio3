"use client";

import { useEffect, useState } from "react";

export default function RotatingRoles({ roles }: { roles: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = roles[index % roles.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), 1600);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % roles.length);
    } else {
      timeout = setTimeout(
        () => {
          setText((t) =>
            deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)
          );
        },
        deleting ? 45 : 85
      );
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, index, roles]);

  return (
    <span className="font-display tracking-wide text-paper">
      {text}
      <span
        className="ml-1 inline-block w-[3px] animate-pulse bg-paper align-middle"
        style={{ height: "1em" }}
      />
    </span>
  );
}
