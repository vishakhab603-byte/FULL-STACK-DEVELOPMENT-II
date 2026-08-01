import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { modalOpened, modalClosed, toastPushed } from '../../features/ui/uiSlice';
import { createPost, updatePost } from '../../features/posts/postsSlice';
import { draftUpdated, draftAutosaved, draftCleared, draftRestored } from '../../features/drafts/draftsSlice';
import { selectAllPlatforms } from '../../features/platforms/platformsSelectors';
import { selectPostById } from '../../features/posts/postsSelectors';
import { countCharacters, countWords, countEmoji, extractHashtags, readingTimeSeconds } from '../../utils/text';
import { relativeTime } from '../../utils/date';
import Modal from '../common/Modal';

export default function PostEditorModal() {
  const dispatch = useAppDispatch();
  const editingPostId = useAppSelector((s) => s.ui.editingPostId);
  const editingPost = useAppSelector((s) => (editingPostId ? selectPostById(s, editingPostId) : null));
  const platforms = useAppSelector(selectAllPlatforms);
  const draft = useAppSelector((s) => s.drafts.current);
  const lastSavedAt = useAppSelector((s) => s.drafts.lastSavedAt);
  const versions = useAppSelector((s) => s.drafts.versions);
  const mutationStatus = useAppSelector((s) => s.posts.mutationStatus);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: editingPost
      ? { title: editingPost.title, content: editingPost.content, platformId: editingPost.platformId }
      : draft.title || draft.content
      ? draft
      : { title: '', content: '', platformId: platforms[0]?.id || '' }
  });

  const title = watch('title');
  const content = watch('content');
  const platformId = watch('platformId');

  // Autosave to the drafts slice every 1.2s of inactivity (skipped while editing an existing post)
  const autosaveTimer = useRef(null);
  useEffect(() => {
    if (editingPost) return undefined;
    dispatch(draftUpdated({ title, content, platformId }));
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (title || content) dispatch(draftAutosaved());
    }, 1200);
    return () => clearTimeout(autosaveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, platformId]);

  const platform = platforms.find((p) => p.id === platformId);
  const charCount = countCharacters(content || '');
  const wordCount = countWords(content || '');
  const emojiCount = countEmoji(content || '');
  const hashtags = extractHashtags(content || '');
  const readingSec = readingTimeSeconds(content || '');
  const overLimit = platform && charCount > platform.charLimit;

  function close() {
    dispatch(modalClosed());
  }

  function onSubmit(values) {
    if (editingPost) {
      dispatch(updatePost({ id: editingPost.id, changes: values }));
      dispatch(toastPushed({ tone: 'success', message: 'Post updated.' }));
    } else {
      dispatch(createPost({ ...values, status: 'draft' }));
      dispatch(draftCleared());
      dispatch(toastPushed({ tone: 'success', message: 'Post created.' }));
    }
    close();
  }

  function restoreVersion(id) {
    dispatch(draftRestored(id));
    const v = versions.find((ver) => ver.id === id);
    if (v) reset({ title: v.title, content: v.content, platformId: v.platformId });
  }

  return (
    <Modal
      title={editingPost ? 'Edit post' : 'New post'}
      onClose={close}
      width={720}
      footer={
        <>
          <span className="autosave-indicator">
            {!editingPost && lastSavedAt ? `Autosaved ${relativeTime(lastSavedAt)}` : 'Not yet saved'}
          </span>
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
            <button
              type="submit"
              form="post-editor-form"
              className="btn btn-primary"
              disabled={overLimit || mutationStatus === 'loading'}
            >
              {mutationStatus === 'loading' ? 'Saving…' : editingPost ? 'Save changes' : 'Create post'}
            </button>
          </div>
        </>
      }
    >
      <form id="post-editor-form" onSubmit={handleSubmit(onSubmit)} className="post-editor-form">
        <div className="field">
          <label htmlFor="pe-title">Title</label>
          <input
            id="pe-title"
            {...register('title', { required: 'Give this post a title.' })}
            placeholder="What's this post about?"
          />
          {errors.title && <span className="field-error">{errors.title.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="pe-platform">Platform</label>
          <select id="pe-platform" {...register('platformId', { required: true })}>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.charLimit.toLocaleString()} chars</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="pe-content">Content</label>
          <textarea
            id="pe-content"
            rows={6}
            {...register('content', { required: 'Write something before saving.' })}
            placeholder="Draft your caption… #hashtags welcome"
          />
          {errors.content && <span className="field-error">{errors.content.message}</span>}
          {overLimit && (
            <span className="field-error">
              {charCount - platform.charLimit} characters over the {platform.name} limit.
            </span>
          )}
        </div>

        <div className="editor-meta-row">
          <span className={overLimit ? 'meta-chip meta-chip--danger' : 'meta-chip'}>
            {charCount}{platform ? ` / ${platform.charLimit}` : ''} chars
          </span>
          <span className="meta-chip">{wordCount} words</span>
          <span className="meta-chip">{readingSec}s read</span>
          <span className="meta-chip">{emojiCount} emoji</span>
          <span className="meta-chip">{hashtags.length} hashtags</span>
        </div>

        {content && (
          <div className="live-preview" style={{ '--platform-color': platform?.color }}>
            <div className="live-preview-header">
              <span className="live-preview-dot" />
              {platform?.name} preview
            </div>
            <p>{content}</p>
          </div>
        )}

        {!editingPost && versions.length > 0 && (
          <details className="version-history">
            <summary>Version history ({versions.length})</summary>
            <ul>
              {versions.slice(0, 6).map((v) => (
                <li key={v.id}>
                  <span>{relativeTime(v.savedAt)} — {v.title || 'Untitled'}</span>
                  <button type="button" onClick={() => restoreVersion(v.id)}>Restore</button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </form>
    </Modal>
  );
}
