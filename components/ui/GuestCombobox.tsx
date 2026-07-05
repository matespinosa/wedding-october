"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, RefCallback } from "react";
import { filterGuests } from "@/lib/guests";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  inputRef?: RefCallback<HTMLInputElement>;
  className?: string;
};

/**
 * Combobox editable (autocomplete) contra la lista de invitados.
 * Accesible: flechas para navegar, Enter selecciona, Escape cierra.
 * Portado de wedding-bogota y reestilizado a la tarjeta crema/dorado.
 */
export function GuestCombobox({
  value,
  onChange,
  autoFocus,
  inputRef,
  className,
}: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement | null>(null);
  const blurTimer = useRef<number | undefined>(undefined);

  const matches = filterGuests(value);

  useEffect(() => () => window.clearTimeout(blurTimer.current), []);

  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const openList = () => {
    setActiveIndex(-1);
    setOpen(filterGuests(value).length > 0);
  };

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const select = (name: string) => {
    onChange(name);
    close();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        openList();
        return;
      }
      if (matches.length) setActiveIndex((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (matches.length)
        setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && matches[activeIndex]) {
        e.preventDefault(); // selecciona en vez de enviar el formulario
        select(matches[activeIndex]);
      }
    } else if (e.key === "Escape") {
      close();
    }
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
        }
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder="Busca o escribe el nombre"
        className={cn(
          "w-full border-b border-ink/15 bg-transparent pb-2.5 pt-2 text-[15px] text-ink outline-none transition-colors duration-500 placeholder:text-ink/35 focus:border-gold-deep",
          className,
        )}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActiveIndex(-1);
          setOpen(filterGuests(e.target.value).length > 0);
        }}
        onFocus={openList}
        onBlur={() => {
          blurTimer.current = window.setTimeout(close, 120);
        }}
        onKeyDown={onKeyDown}
      />
      {open && matches.length > 0 && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label="Invitados"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-2xl border border-ink/10 bg-cream/95 p-1.5 shadow-[0_30px_70px_-30px_rgba(27,27,27,0.4)] backdrop-blur-xl"
        >
          {matches.map((name, i) => (
            <li
              key={name + i}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={cn(
                "cursor-pointer rounded-xl px-3.5 py-2.5 text-[14px] text-ink/80 transition-colors duration-200",
                i === activeIndex ? "bg-gold/15 text-ink" : "hover:bg-gold/10",
              )}
              onMouseDown={(e) => {
                e.preventDefault(); // evita blur antes del click
                select(name);
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
