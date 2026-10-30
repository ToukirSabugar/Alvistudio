"use client";

import { startTransition, useActionState, useState } from "react";
import type { MediaRow } from "@/lib/store";
import type { PostAdmin } from "@/lib/posts-admin";
import { slugify } from "@/lib/post-input";
import { MediaChoice } from "../heroes/MediaChoice";
import { PhotoDropzone } from "../PhotoDropzone";
import { btnCls, inputCls } from "../ui";
import { savePostAction, type PostFormState } from "./actions";

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p id={`${id}-err`} className="mt-1 text-sm text-red-800">
      {msg}
    </p>
  ) : null;
}

/**
 * The article editor. Errors appear next to each field and nothing typed is lost: the form is submitted from
 * onSubmit, because a plain <form action> is reset by React after every submit, even one that failed.
 */
export function PostForm({ post, media }: { post?: PostAdmin; media: MediaRow[] }) {
  const [state, action, pending] = useActionState<PostFormState, FormData>(savePostAction, {});
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const e = state.errors ?? {};
  const coverId = post?.coverUrl ? (media.find((m) => m.fileUrl === post.coverUrl)?.id ?? null) : null;
  const aria = (k: string) => (e[k] ? { "aria-invalid": true, "aria-describedby": `${k}-err` } : {});

  return (
    <form
      className="space-y-6"
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        startTransition(() => action(data));
      }}
    >
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      {state.message ? (
        <p role="alert" className="border-l-4 border-red-800 bg-white p-4">
          {state.message}
        </p>
      ) : null}

      <div className="border border-ink/15 bg-white p-4 sm:p-6 space-y-5">
        <div>
          <label htmlFor="title" className="mb-1 block font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={200}
            value={title}
            onChange={(ev) => {
              setTitle(ev.target.value);
              if (!slugTouched) setSlug(slugify(ev.target.value));
            }}
            className={inputCls}
            {...aria("title")}
          />
          <Err id="title" msg={e.title} />
        </div>
        <div>
          <label htmlFor="slug" className="mb-1 block font-medium">
            Web address
          </label>
          <div className="flex min-w-0 items-center gap-1">
            <span className="shrink-0 text-sm text-muted">/blog/</span>
            <input
              id="slug"
              name="slug"
              maxLength={120}
              value={slug}
              onChange={(ev) => {
                setSlugTouched(true);
                setSlug(ev.target.value);
              }}
              className={inputCls}
              {...aria("slug")}
            />
          </div>
          <p className="mt-1 text-sm text-muted">Filled in from the title. English letters, numbers and dashes. Changing it later breaks old links.</p>
          <Err id="slug" msg={e.slug} />
        </div>
        <div>
          <label htmlFor="excerpt" className="mb-1 block font-medium">
            Short summary
          </label>
          <textarea id="excerpt" name="excerpt" rows={2} maxLength={500} defaultValue={post?.excerpt} className={inputCls} {...aria("excerpt")} />
          <p className="mt-1 text-sm text-muted">One or two sentences shown in the blog list.</p>
          <Err id="excerpt" msg={e.excerpt} />
        </div>
        <div>
          <label htmlFor="body" className="mb-1 block font-medium">
            Article
          </label>
          <textarea id="body" name="body" rows={18} defaultValue={post?.body} className={`${inputCls} font-mono text-sm`} {...aria("body")} />
          <div className="mt-2 bg-paper-2 p-3 text-sm text-muted">
            Leave an empty line between paragraphs. Start a line with <code>## </code> for a heading, <code>- </code> for a list item,
            or <code>&gt; </code> for a tip box.
          </div>
          <Err id="body" msg={e.body} />
        </div>
      </div>

      <div className="border border-ink/15 bg-white p-4 sm:p-6 space-y-5">
        <h2 className="display text-lg">Cover image (optional)</h2>
        <PhotoDropzone name="cover" label="Upload a cover photo" />
        {media.length > 0 ? <MediaChoice name="coverMediaId" media={media} selectedId={coverId} allowNone /> : null}
        <div>
          <label htmlFor="coverAlt" className="mb-1 block font-medium">
            Describe the cover image
          </label>
          <input id="coverAlt" name="coverAlt" maxLength={250} defaultValue={post?.coverAlt} className={inputCls} {...aria("coverAlt")} />
          <Err id="coverAlt" msg={e.coverAlt ?? e.coverUrl} />
        </div>
      </div>

      <div className="border border-ink/15 bg-white p-4 sm:p-6 space-y-5">
        <h2 className="display text-lg">Search and publishing</h2>
        <div>
          <label htmlFor="metaDescription" className="mb-1 block font-medium">
            Search description (optional)
          </label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={2}
            maxLength={300}
            defaultValue={post?.metaDescription}
            className={inputCls}
            {...aria("metaDescription")}
          />
          <p className="mt-1 text-sm text-muted">About 155 characters shown under the title in Google. The summary is used when empty.</p>
          <Err id="metaDescription" msg={e.metaDescription} />
        </div>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" name="publish" defaultChecked={post?.isPublished ?? false} className="h-6 w-6 accent-camel-deep" />
          <span>
            <span className="block font-medium">Published</span>
            <span className="block text-sm text-muted">Off keeps it as a draft that only you can see here.</span>
          </span>
        </label>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-t border-ink/20 bg-paper-2/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <button type="submit" disabled={pending} aria-busy={pending} className={btnCls}>
          {pending ? "Saving" : "Save post"}
        </button>
      </div>
    </form>
  );
}
