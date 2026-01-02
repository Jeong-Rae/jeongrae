"use client";

import { type RefObject, useRef } from "react";
import { Textarea } from "@jeongrae/ui";
import { useKeyboardShortcuts } from "@jeongrae/hook";
import { Clock, FileText } from "lucide-react";

import type { Note, Section } from "@/lib/types";

interface NotesEditorProps {
  section: Section;
  onNoteChange?: (content: string) => void;
  currentNote?: string;
  onSubmit?: () => void | Promise<void>;
}

export function NotesEditor({
  section,
  onNoteChange,
  currentNote = "",
  onSubmit,
}: NotesEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useKeyboardShortcuts(
    [
      {
        keys: "Enter",
        ctrl: true,
        preventDefault: true,
        enabled: Boolean(onSubmit),
        handler: () => {
          if (!currentNote.trim()) return;
          void onSubmit?.();
        },
      },
    ],
    {
      target: textareaRef,
      enabled: Boolean(onSubmit),
    },
  );

  return (
    <div className="space-y-6">
      <NotesHeader section={section} />
      <NotesInput
        value={currentNote}
        onChange={onNoteChange}
        textareaRef={textareaRef}
      />
      <NotesList notes={section.notes} />
    </div>
  );
}

function NotesHeader({ section }: { section: Section }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
          현재 섹션
        </span>
      </div>
      <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{section.purpose}</p>
    </div>
  );
}

function NotesInput({
  value,
  onChange,
  textareaRef,
}: {
  value: string;
  onChange?: (content: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">메모 입력</label>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="이 섹션에 대한 정보를 자유롭게 입력하세요. 문장이 완벽하지 않아도 됩니다..."
        className="min-h-[200px] bg-secondary/50 border-border focus:border-emerald-500/50 focus:ring-emerald-500/20 resize-none"
      />
      <p className="text-xs text-muted-foreground">Ctrl + Enter로 제출</p>
    </div>
  );
}

function NotesList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          누적 메모
        </span>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}

function NoteItem({ note }: { note: Note }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {note.timestamp.toLocaleString("ko-KR")}
        </span>
      </div>
      <p className="text-sm text-foreground/80 whitespace-pre-wrap">
        {note.content}
      </p>
    </div>
  );
}
