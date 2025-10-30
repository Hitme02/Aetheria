type Props = { open: boolean; onClose: () => void };

export default function ArtModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal className="fixed inset-0 bg-black/70 grid place-items-center p-4">
      <div className="bg-card border border-white/10 rounded-xl p-6 max-w-2xl w-full">
        <h2 className="text-xl font-semibold mb-2">Artwork</h2>
        <p className="text-sm text-gray-300">Metadata and provenance timeline coming soon.</p>
        <button className="mt-4 px-4 py-2 bg-accent text-black rounded-md" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

