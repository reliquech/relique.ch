"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConsignPhotoUpload } from "@/components/shared/ConsignPhotoUpload";
import { submitPublicConsign } from "@/lib/services/impl/consign.supabase";

/**
 * Consignment form component
 * Handles consignment request submissions
 */
export function ConsignForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    itemDescription: "",
    coaIssuer: "",
    category: "Basketball",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length < 1) {
      toast.error("Please upload at least one photo");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("contact_name", `${formData.firstName} ${formData.lastName}`.trim());
      fd.append("contact_email", formData.email);
      if (formData.phone) fd.append("contact_phone", formData.phone);
      fd.append("item_description", formData.itemDescription);
      fd.append("category", formData.category);
      if (formData.coaIssuer) fd.append("coa_issuer", formData.coaIssuer);
      fd.append("website", "");
      photos.forEach((photo) => fd.append("photos", photo));

      const result = await submitPublicConsign(fd);

      toast.success("Consignment request submitted successfully");
      router.push(`/consign/success?id=${encodeURIComponent(result.id)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit consignment request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cardDark border border-white/5 p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primaryBlue/5 to-transparent opacity-50 pointer-events-none" />
      <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

        {/* Name Fields */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-textSec">
              First Name
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-bgDark border border-white/10 p-4 focus:border-highlightIce outline-none text-sm text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-textSec">
              Last Name
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-bgDark border border-white/10 p-4 focus:border-highlightIce outline-none text-sm text-white"
            />
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-textSec">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-bgDark border border-white/10 p-4 focus:border-highlightIce outline-none text-sm text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-textSec">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-bgDark border border-white/10 p-4 focus:border-highlightIce outline-none text-sm text-white"
            />
          </div>
        </div>

        {/* Item Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-textSec">
            Item Description & Provenance
          </label>
          <textarea
            required
            value={formData.itemDescription}
            onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
            className="w-full bg-bgDark border border-white/10 p-4 h-32 focus:border-highlightIce outline-none text-sm text-white resize-none"
            placeholder="Tell us about the history of the item..."
          />
        </div>

        <ConsignPhotoUpload files={photos} onChange={setPhotos} disabled={loading} />

        {/* COA & Category */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-textSec">
              COA Issuer (If any)
            </label>
            <input
              type="text"
              value={formData.coaIssuer}
              onChange={(e) => setFormData({ ...formData, coaIssuer: e.target.value })}
              className="w-full bg-bgDark border border-white/10 p-4 focus:border-highlightIce outline-none text-sm text-white"
              placeholder="PSA, JSA, DNA, etc."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-textSec">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-bgDark border border-white/10 p-4 focus:border-highlightIce outline-none text-sm uppercase font-bold text-white"
            >
              <option>Basketball</option>
              <option>Football</option>
              <option>Baseball</option>
              <option>Tennis</option>
              <option>F1</option>
              <option>Cricket</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-primaryBlue text-white font-black uppercase tracking-[0.3em] hover:bg-accentBlue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Consignment Request"}
        </button>
      </form>
    </div>
  );
}
