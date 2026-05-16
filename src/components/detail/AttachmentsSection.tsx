import { Download, Paperclip, Trash2 } from 'lucide-react';
import type { Item } from '../../types/item';

interface AttachmentsSectionProps {
  selectedItem: Item;
  addAttachment: (itemId: string, file: File | Blob, fileName?: string) => Item['attachments'][number];
  deleteAttachment: (itemId: string, attachmentId: string) => void;
}

export function AttachmentsSection({ selectedItem, addAttachment, deleteAttachment }: AttachmentsSectionProps) {
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
              <img
                className="mb-2 max-h-32 w-full rounded-md object-cover"
                src={attachment.previewUrl}
                alt={attachment.fileName}
              />
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
      </div>
    </section>
  );
}
