/**
 * File upload area component
 * Reusable drag-and-drop file upload zone
 */
export function FileUploadArea() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold border-l-4 border-primaryBlue pl-4">
        3. Image Uploads
      </h3>
      <div className="border-2 border-dashed border-white/10 p-12 text-center hover:border-highlightIce/50 transition-colors cursor-pointer group">
        <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform">
          📸
        </span>
        <p className="text-xs font-black uppercase tracking-widest text-textSec">
          Drag & Drop Images (Front, Back, Tags, Details)
        </p>
      </div>
    </div>
  );
}
