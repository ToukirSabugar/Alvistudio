"use client";

import { useState } from "react";
import { inputCls } from "../ui";

/** Input or textarea with a live character counter against a recommended length. */
export function CountedInput({
  id,
  name,
  label,
  defaultValue,
  placeholder,
  target,
  max,
  multiline,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  placeholder: string;
  target: number;
  max: number;
  multiline?: boolean;
}) {
  const [len, setLen] = useState(defaultValue.length);
  const over = len > target;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-base font-medium">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={3}
          maxLength={max}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={(e) => setLen(e.target.value.length)}
          aria-describedby={`${id}-count`}
          className={inputCls}
        />
      ) : (
        <input
          id={id}
          name={name}
          maxLength={max}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={(e) => setLen(e.target.value.length)}
          aria-describedby={`${id}-count`}
          className={inputCls}
        />
      )}
      <p id={`${id}-count`} className="mt-1 text-sm text-muted">
        {len} characters. Aim for about {target}.
        {over ? " Google may cut off the end." : ""}
        {len === 0 ? " Empty uses the built-in text." : ""}
      </p>
    </div>
  );
}
