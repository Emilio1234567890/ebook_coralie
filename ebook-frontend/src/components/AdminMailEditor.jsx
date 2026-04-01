"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const FONT_OPTIONS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Trebuchet MS",
];

const SIZE_OPTIONS = [
  { label: "10", value: "2" },
  { label: "11", value: "3" },
  { label: "12", value: "4" },
  { label: "14", value: "5" },
  { label: "18", value: "6" },
  { label: "24", value: "7" },
];

const BLOCK_OPTIONS = [
  { label: "Normal", value: "p" },
  { label: "Titre", value: "h1" },
  { label: "Sous-titre", value: "h2" },
  { label: "Section", value: "h3" },
];

function normalizeHtml(html = "") {
  if (!html || !html.trim()) return "<p></p>";
  return html;
}

function ToolbarButton({ title, onClick, children, active = false }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={[
        "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm transition",
        active
          ? "border-[rgba(212,176,96,0.34)] bg-[rgba(212,176,96,0.12)] text-[rgba(245,224,175,1)]"
          : "border-white/10 bg-white/[0.04] text-white/85 hover:border-white/20 hover:bg-white/[0.08]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AdminMailEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [fontName, setFontName] = useState("Arial");
  const [fontSize, setFontSize] = useState("3");
  const [blockType, setBlockType] = useState("p");
  const [showPreview, setShowPreview] = useState(false);

  const previewHtml = useMemo(() => normalizeHtml(value), [value]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !editorRef.current) return;

    const next = normalizeHtml(value);
    if (editorRef.current.innerHTML !== next) {
      editorRef.current.innerHTML = next;
    }

    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {}
  }, [value, mounted]);

  useEffect(() => {
    function handleSelectionChange() {
      const editor = editorRef.current;
      if (!editor) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      if (editor.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  function focusEditor() {
    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  }

  function saveSelection() {
    const selection = window.getSelection();
    const editor = editorRef.current;

    if (!selection || !editor || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function restoreSelection() {
    const selection = window.getSelection();
    const range = savedRangeRef.current;
    if (!selection || !range) return;

    selection.removeAllRanges();
    selection.addRange(range);
  }

  function emitChange() {
    if (!editorRef.current || !onChange) return;
    onChange(editorRef.current.innerHTML);
  }

  function run(command, commandValue = null) {
    focusEditor();
    restoreSelection();

    try {
      document.execCommand(command, false, commandValue);
    } catch {}

    saveSelection();
    emitChange();
  }

  function handleInput() {
    saveSelection();
    emitChange();
  }

  function handleBlockChange(e) {
    const next = e.target.value;
    setBlockType(next);

    focusEditor();
    restoreSelection();

    try {
      document.execCommand("formatBlock", false, next);
    } catch {}

    saveSelection();
    emitChange();
  }

  function handleFontNameChange(e) {
    const next = e.target.value;
    setFontName(next);
    run("fontName", next);
  }

  function handleFontSizeChange(e) {
    const next = e.target.value;
    setFontSize(next);
    run("fontSize", next);
  }

  function handleCreateLink() {
    const url = window.prompt("Entrez l’URL du lien");
    if (!url) return;
    run("createLink", url);
  }

  function handleImageInsert() {
    const url = window.prompt("Entrez l’URL de l’image");
    if (!url) return;
    run("insertImage", url);
  }

  function handleInsertSignature() {
    focusEditor();
    restoreSelection();

    try {
      document.execCommand(
        "insertHTML",
        false,
        `<p>Bien à vous,</p><p>Une béninoise en Martinique</p>`,
      );
    } catch {}

    saveSelection();
    emitChange();
  }

  function handleClear() {
    const ok = window.confirm(
      "Tu veux vraiment vider complètement le contenu de l’email ?",
    );
    if (!ok) return;

    if (editorRef.current) {
      editorRef.current.innerHTML = "<p></p>";
      emitChange();
      focusEditor();
    }
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
      <div className="border-b border-white/8 bg-[radial-gradient(circle_at_0%_0%,rgba(212,176,96,0.12),transparent_26%),radial-gradient(circle_at_100%_0%,rgba(68,196,224,0.08),transparent_24%)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">
              éditeur email
            </p>
            <p className="mt-1 text-sm text-white/72">
              Compose ta réponse puis vérifie l’aperçu avant l’envoi.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-[11px] uppercase tracking-[0.18em] text-white/82 transition hover:border-white/20 hover:bg-white/8"
            >
              {showPreview ? "Masquer aperçu" : "Voir aperçu"}
            </button>

            <button
              type="button"
              onClick={handleInsertSignature}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[rgba(212,176,96,0.24)] bg-[rgba(212,176,96,0.10)] px-4 text-[11px] uppercase tracking-[0.18em] text-[rgba(245,224,175,1)] transition hover:bg-[rgba(212,176,96,0.16)]"
            >
              Signature
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-white/8 bg-white/[0.02] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton title="Annuler" onClick={() => run("undo")}>
            ↶
          </ToolbarButton>

          <ToolbarButton title="Rétablir" onClick={() => run("redo")}>
            ↷
          </ToolbarButton>

          <div className="mx-1 h-7 w-px bg-white/10" />

          <select
            className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/85 outline-none transition hover:border-white/20 focus:border-[rgba(212,176,96,0.34)]"
            value={blockType}
            onChange={handleBlockChange}
            aria-label="Type de texte"
          >
            {BLOCK_OPTIONS.map((item) => (
              <option
                key={item.value}
                value={item.value}
                className="text-black"
              >
                {item.label}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/85 outline-none transition hover:border-white/20 focus:border-[rgba(212,176,96,0.34)]"
            value={fontName}
            onChange={handleFontNameChange}
            aria-label="Police"
          >
            {FONT_OPTIONS.map((item) => (
              <option key={item} value={item} className="text-black">
                {item}
              </option>
            ))}
          </select>

          <select
            className="h-10 w-[78px] rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/85 outline-none transition hover:border-white/20 focus:border-[rgba(212,176,96,0.34)]"
            value={fontSize}
            onChange={handleFontSizeChange}
            aria-label="Taille"
          >
            {SIZE_OPTIONS.map((item) => (
              <option
                key={item.value}
                value={item.value}
                className="text-black"
              >
                {item.label}
              </option>
            ))}
          </select>

          <div className="mx-1 h-7 w-px bg-white/10" />

          <ToolbarButton title="Gras" onClick={() => run("bold")}>
            <b>B</b>
          </ToolbarButton>

          <ToolbarButton title="Italique" onClick={() => run("italic")}>
            <i>I</i>
          </ToolbarButton>

          <ToolbarButton title="Souligné" onClick={() => run("underline")}>
            <u>U</u>
          </ToolbarButton>

          <ToolbarButton title="Barré" onClick={() => run("strikeThrough")}>
            <s>S</s>
          </ToolbarButton>

          <input
            type="color"
            className="h-10 w-10 cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] p-1"
            title="Couleur du texte"
            onChange={(e) => run("foreColor", e.target.value)}
          />

          <div className="mx-1 h-7 w-px bg-white/10" />

          <ToolbarButton
            title="Liste à puces"
            onClick={() => run("insertUnorderedList")}
          >
            •
          </ToolbarButton>

          <ToolbarButton
            title="Liste numérotée"
            onClick={() => run("insertOrderedList")}
          >
            1.
          </ToolbarButton>

          <ToolbarButton
            title="Aligner à gauche"
            onClick={() => run("justifyLeft")}
          >
            ≡
          </ToolbarButton>

          <ToolbarButton title="Centrer" onClick={() => run("justifyCenter")}>
            ≣
          </ToolbarButton>

          <ToolbarButton
            title="Aligner à droite"
            onClick={() => run("justifyRight")}
          >
            ≢
          </ToolbarButton>

          <div className="mx-1 h-7 w-px bg-white/10" />

          <ToolbarButton title="Insérer un lien" onClick={handleCreateLink}>
            🔗
          </ToolbarButton>

          <ToolbarButton title="Insérer une image" onClick={handleImageInsert}>
            🖼
          </ToolbarButton>

          <ToolbarButton
            title="Effacer le format"
            onClick={() => run("removeFormat")}
          >
            Tx
          </ToolbarButton>

          <ToolbarButton title="Vider le contenu" onClick={handleClear}>
            ✕
          </ToolbarButton>
        </div>
      </div>

      <div className={showPreview ? "grid lg:grid-cols-2" : ""}>
        <div
          className={
            showPreview
              ? "border-b border-white/8 lg:border-b-0 lg:border-r"
              : ""
          }
        >
          <div
            ref={editorRef}
            className="min-h-[220px] lg:min-h-[260px] p-5 text-[15px] leading-8 text-white/92 outline-none"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onFocus={saveSelection}
            data-placeholder="Écris ta réponse email ici..."
            spellCheck
          />
        </div>

        {showPreview ? (
          <div className="bg-black/10">
            <div className="border-b border-white/8 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                aperçu
              </p>
              <p className="mt-1 text-sm text-white/65">
                Rendu visuel de l’email avant envoi.
              </p>
            </div>

            <div className="p-5">
              <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                <div
                  className="admin-editor-area text-white/88"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/8 bg-white/[0.02] px-4 py-3 text-xs text-white/42">
        Astuce : sélectionne une partie du texte avant d’appliquer un style, une
        couleur ou un lien.
      </div>
    </div>
  );
}
