import { useEffect, useState } from 'react';
import { Download, Paperclip, Trash2, X } from 'lucide-react';
import type { Item } from '../../types/item';

interface AttachmentsSectionProps {
  selectedItem: Item;
  addAttachment: (itemId: string, file: File | Blob, fileName?: string) => Item['attachments'][number];
  deleteAttachment: (itemId: string, attachmentId: string) => void;
}

export function AttachmentsSection({ selectedItem, addAttachment, deleteAttachment }: AttachmentsSectionProps) {
  const [previewAttachment, setPreviewAttachment] = useState<Item['attachments'][number] | undefined>();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setPreviewAttachment(undefined);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  function downloadAttachment(attachment: Item['attachments'][number]) {
    const url = URL.createObjectURL(attachment.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = attachment.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-lg border border-graphite/10 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Attachments</h3>
        <Paperclip size={16} className="text-graphite/55" />
      </div>
      <label className="block">
        <input
          className="hidden"
          type="file"
          multiple
          onChange={(event) => {
            Array.from(event.target.files ?? []).forEach((file) => addAttachment(selectedItem.id, file));
            event.currentTarget.value = '';
          }}
        />
        <span className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-graphite/15 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-mist">
          <Paperclip size={16} />
          Attach file
        </span>
      </label>
      <div className="mt-3 space-y-2">
        {selectedItem.attachments.map((attachment) => (
          <div key={attachment.id} className="rounded-md bg-mist p-2 text-sm">
            {attachment.previewUrl && (
              <button
                className="mb-2 block w-full overflow-hidden rounded-md bg-white text-left ring-1 ring-graphite/10 transition hover:ring-fern/40"
                type="button"
                aria-label={`Preview ${attachment.fileName}`}
                onClick={() => setPreviewAttachment(attachment)}
              >
                <img
                  className="max-h-32 w-full object-cover"
                  src={attachment.previewUrl}
                  alt={attachment.fileName}
                />
              </button>
            )}
            <div className="truncate font-medium">{attachment.fileName}</div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="text-xs text-graphite/60">{Math.ceil(attachment.fileSize / 1024)} KB</div>
              <div className="flex gap-1">
                <button
                  className="rounded-md p-1 text-graphite/65 hover:bg-white"
                  title="Download attachment"
                  onClick={() => downloadAttachment(attachment)}
                >
                  <Download size={14} />
                </button>
                <button
                  className="rounded-md p-1 text-coral hover:bg-white"
                  title="Delete attachment"
                  onClick={() => deleteAttachment(selectedItem.id, attachment.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {selectedItem.attachments.length === 0 && (
          <p className="rounded-md bg-mist px-3 py-2 text-sm text-graphite/60">No attachments yet.</p>
        )}
      </div>
      {previewAttachment?.previewUrl && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${previewAttachment.fileName} preview`}
        >
          <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-panel">
            <div className="flex items-center justify-between gap-3 border-b border-graphite/10 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink">{previewAttachment.fileName}</div>
                <div className="text-xs text-graphite/55">{Math.ceil(previewAttachment.fileSize / 1024)} KB</div>
              </div>
              <button
                className="rounded-md p-2 text-graphite/65 hover:bg-mist"
                type="button"
                aria-label="Close preview"
                onClick={() => setPreviewAttachment(undefined)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 overflow-auto bg-mist p-4">
              <img
                className="mx-auto max-h-[72vh] max-w-full rounded-md object-contain shadow-panel"
                src={previewAttachment.previewUrl}
                alt={`${previewAttachment.fileName} large preview`}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
