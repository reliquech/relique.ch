"use client";

/**
 * Photo picker for public consign form — wrapper (shadcn guard: no edits to components/ui).
 */
type ConsignPhotoUploadProps = {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
};

const MAX_FILES = 10;

export function ConsignPhotoUpload({
  files,
  onChange,
  maxFiles = MAX_FILES,
  disabled = false,
}: ConsignPhotoUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const merged = [...files, ...selected].slice(0, maxFiles);
    onChange(merged);
    e.target.value = "";
  };

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-textSec">
        Photos (required, max {maxFiles})
      </label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={disabled || files.length >= maxFiles}
        onChange={handleChange}
        className="w-full text-xs text-textSec file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-primaryBlue file:text-white file:font-bold file:uppercase file:text-[10px]"
      />
      {files.length > 0 && (
        <ul className="space-y-1 text-xs text-white">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex justify-between gap-2">
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAt(i)}
                className="text-highlightIce uppercase text-[10px] font-bold shrink-0"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length < 1 && (
        <p className="text-[10px] text-textSec italic">Upload at least one photo of your item.</p>
      )}
    </div>
  );
}
