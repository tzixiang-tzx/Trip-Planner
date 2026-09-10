import { db } from "@/lib/db";
import { requireTrip } from "@/lib/session";
import { timeAgo } from "@/lib/dates";
import { deleteAnnouncement, togglePin } from "@/actions/announcements";
import { Avatar } from "@/components/avatar";
import { Pagination } from "@/components/pagination";
import { clampPage, parsePage, skipFor, totalPagesFor, PAGE_SIZE } from "@/lib/pagination";
import { ComposeAnnouncement } from "./compose";
import { CommentThread } from "./comment-thread";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { trip, user } = await requireTrip();
  const { page: pageParam } = await searchParams;

  const total = await db.announcement.count({ where: { tripId: trip.id } });
  const page = clampPage(parsePage(pageParam), total);

  const announcements = await db.announcement.findMany({
    where: { tripId: trip.id },
    include: {
      author: { select: { id: true, name: true, accent: true } },
      comments: {
        include: { author: { select: { id: true, name: true, accent: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    skip: skipFor(page),
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Announcements</h2>
          <p className="mt-1 text-sm text-muted">
            Say it once here instead of five times in the group chat.
          </p>
        </div>
        <ComposeAnnouncement />
      </div>

      {announcements.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="font-display text-xl text-ink">Nothing announced yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Meeting points, packing reminders, the one thing everyone forgets — this is the place.
          </p>
          <p className="handwrite mt-3 text-clay">pin the important one</p>
        </div>
      ) : (
        <div className="space-y-5">
          {announcements.map((post) => (
            <article key={post.id} className={`card p-6 ${post.pinned ? "ring-2 ring-sun/40" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.pinned && (
                      <span className="chip border-transparent bg-sun-soft text-sun">Pinned</span>
                    )}
                    <h3 className="font-display text-xl text-ink">{post.title}</h3>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                    <Avatar name={post.author.name} accent={post.author.accent} size="sm" />
                    <span>{post.author.name}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={post.createdAt.toISOString()}>{timeAgo(post.createdAt)}</time>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <form action={togglePin}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-full px-2.5 py-1 text-xs text-muted transition hover:bg-sun-soft hover:text-sun"
                    >
                      {post.pinned ? "Unpin" : "Pin"}
                    </button>
                  </form>

                  {post.author.id === user.id && (
                    <form action={deleteAnnouncement}>
                      <input type="hidden" name="id" value={post.id} />
                      <button
                        type="submit"
                        className="rounded-full px-2.5 py-1 text-xs text-muted transition hover:bg-clay-soft hover:text-clay"
                      >
                        Delete
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <p className="mt-4 text-[0.95rem] leading-relaxed whitespace-pre-wrap text-ink/90">{post.body}</p>

              <CommentThread
                announcementId={post.id}
                currentUserId={user.id}
                comments={post.comments.map((c) => ({
                  id: c.id,
                  body: c.body,
                  authorId: c.author.id,
                  authorName: c.author.name,
                  authorAccent: c.author.accent,
                  when: timeAgo(c.createdAt),
                }))}
              />
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPagesFor(total)} basePath="/announcements" />
    </div>
  );
}
