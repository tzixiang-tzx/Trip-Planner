"use client";

import { useRef, useState } from "react";
import { addComment, deleteComment } from "@/actions/announcements";
import { Avatar } from "@/components/avatar";
import { SubmitButton } from "@/components/submit-button";

type CommentView = {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  authorAccent: string;
  when: string;
};

export function CommentThread({
  announcementId,
  comments,
  currentUserId,
}: {
  announcementId: string;
  comments: CommentView[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(comments.length > 0);
  const formRef = useRef<HTMLFormElement>(null);

  async function handle(formData: FormData) {
    await addComment(formData);
    formRef.current?.reset();
  }

  return (
    <div className="mt-5 border-t border-line pt-4">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-medium text-muted transition hover:text-clay"
        >
          Reply to this
        </button>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="group/comment flex gap-3">
              <Avatar name={comment.authorName} accent={comment.authorAccent} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">
                  <span className="font-medium text-ink">{comment.authorName}</span> · {comment.when}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed whitespace-pre-wrap text-ink/90">{comment.body}</p>
              </div>
              {comment.authorId === currentUserId && (
                <form action={deleteComment} className="opacity-0 transition group-hover/comment:opacity-100">
                  <input type="hidden" name="id" value={comment.id} />
                  <button type="submit" className="text-[0.7rem] text-muted transition hover:text-clay">
                    Delete
                  </button>
                </form>
              )}
            </div>
          ))}

          <form ref={formRef} action={handle} className="flex items-center gap-2 pt-1">
            <input type="hidden" name="announcementId" value={announcementId} />
            <input name="body" required placeholder="Add a reply…" className="field" />
            <SubmitButton className="btn btn-ghost shrink-0" pendingLabel="…">
              Send
            </SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}
