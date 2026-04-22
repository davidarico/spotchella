"use client";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useId } from "react";
import type { RankRow } from "@/store/ranking";

function Row({
  a,
  index,
  onRemove,
}: {
  a: RankRow;
  index: number;
  onRemove: (i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: a.spotifyId,
    disabled: a.locked,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    touchAction: a.locked ? undefined : ("none" as const),
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-xl border border-black/[0.07] bg-white/60 p-2 shadow-sm ring-0 ring-violet-500/0 transition group-hover:ring-2 group-hover:ring-violet-500/20"
      {...(a.locked ? {} : { ...attributes, ...listeners })}
    >
      <div className="flex w-8 shrink-0 cursor-grab select-none items-center justify-center text-xs font-semibold text-black/40 active:cursor-grabbing">
        {index + 1}
      </div>
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-stone-200/80">
        {a.imageUrl ? (
          <Image
            src={a.imageUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-500">♪</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-dune-900/95">{a.name}</p>
        {a.genres[0] ? <p className="truncate text-xs text-black/45">{a.genres[0]}</p> : null}
      </div>
      {a.locked ? (
        <span className="sc-pill">Locked</span>
      ) : (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(index)}
          className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-rose-700/80 hover:bg-rose-50/80"
        >
          Remove
        </button>
      )}
    </li>
  );
}

export function SortableRankList({
  items,
  onReorder,
  onRemove,
}: {
  items: RankRow[];
  onReorder: (a: number, b: number) => void;
  onRemove: (i: number) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const dnd = useId();

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = items.findIndex((i) => i.spotifyId === active.id);
    const newI = items.findIndex((i) => i.spotifyId === over.id);
    if (oldI < 0 || newI < 0) return;
    onReorder(oldI, newI);
  };

  return (
    <DndContext id={dnd} sensors={sensors} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((a) => a.spotifyId)} strategy={verticalListSortingStrategy}>
        <ol className="space-y-2" aria-label="Artist ranking — drag to reorder">
          {items.map((a, i) => (
            <Row key={a.spotifyId} a={a} index={i} onRemove={onRemove} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
