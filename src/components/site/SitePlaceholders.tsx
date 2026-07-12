"use client";

import { useState } from "react";

/** 访客笔记：本期占位UI，无登录系统 */
export function NotesBox() {
  const [text, setText] = useState("");
  return (
    <div>
      <p className="font-serif text-sm text-ink-soft">
        还没有人留下笔记。第一个来这里的人？
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="留下你的记录···"
        rows={3}
        className="mt-4 w-full resize-none border border-line bg-paper-card/60 px-3 py-2 font-serif text-sm text-ink outline-none placeholder:text-ink-faint focus:border-line-strong"
      />
      <button
        disabled
        title="功能开发中"
        className="mt-2 cursor-not-allowed border border-line px-4 py-1.5 font-mono text-[11px] text-ink-faint"
      >
        提交 · 即将开放
      </button>
    </div>
  );
}

/** 打卡/收藏：本期占位UI */
export function CheckinButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        disabled
        title="功能开发中"
        className="cursor-not-allowed border border-line-strong px-5 py-2.5 font-serif text-sm text-ink-faint"
      >
        我去过 · 打卡
      </button>
      <button
        disabled
        title="功能开发中"
        className="cursor-not-allowed border border-line-strong px-5 py-2.5 font-serif text-sm text-ink-faint"
      >
        我要去 · 收藏
      </button>
      <span className="self-center font-mono text-[10px] text-ink-faint">
        [ 功能开发中 ]
      </span>
    </div>
  );
}
