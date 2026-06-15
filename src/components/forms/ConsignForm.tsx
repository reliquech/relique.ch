"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { UploadManager, type UploadMeta } from "@/lib/ui";
import { DraftManager } from "@/components/drafts/DraftManager";
import { FormProgress } from "@/components/primitives/FormProgress";
import { DraftStatusBar, type DraftStatus, type DraftVersion } from "@/components/drafts/DraftStatusBar";
import { YourInformationSection } from "@/components/form-sections/YourInformationSection";
import { ItemDetailsSection } from "@/components/form-sections/ItemDetailsSection";
import { SignatureInformationSection } from "@/components/form-sections/SignatureInformationSection";
import { EstimatedValueSection } from "@/components/form-sections/EstimatedValueSection";
import { ProvenanceSection } from "@/components/form-sections/ProvenanceSection";
import { AdditionalInformationSection } from "@/components/form-sections/AdditionalInformationSection";
import { TermsSection } from "@/components/form-sections/TermsSection";
import { consignSchema, type ConsignFormData } from "@/lib/validations/consignSchema";
import { consignService } from "@/lib/services/consignService";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { Save } from "lucide-react";

const FORM_STEPS = [
  "Your Information",
  "Item Details",
  "Signature Information",
  "Estimated Value",
  "Provenance & Background",
  "Additional Information",
  "Image Uploads",
  "Terms",
];

export function ConsignForm() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadMeta[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [draftVersions, setDraftVersions] = useState<DraftVersion[]>([]);

  const form = useForm<ConsignFormData>({
    resolver: zodResolver(consignSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      country: "",
      itemDescription: "",
      category: "",
      signedBy: "",
      numberOfSignatures: undefined,
      estimatedValue: undefined,
      provenance: "",
      background: "",
      coaIssuer: "",
      howDidYouHear: "",
      consent: false,
    },
  });

  const formData = form.watch();
  const debouncedFormData = useDebounce(formData, 1000);

  useEffect(() => {
    const loadDraft = async () => {
      const drafts = await consignService.drafts.list();
      const latestDraft = drafts.sort((a, b) => b.timestamp - a.timestamp)[0];
      if (latestDraft && latestDraft.status === "draft") {
        form.reset({
          name: latestDraft.name || "",
          email: latestDraft.email || "",
          phone: latestDraft.phone || "",
          country: latestDraft.country || "",
          itemDescription: latestDraft.itemDescription || "",
          category: latestDraft.category || "",
          signedBy: latestDraft.signedBy || "",
          numberOfSignatures: latestDraft.numberOfSignatures,
          estimatedValue: latestDraft.estimatedValue,
          provenance: latestDraft.provenance || "",
          background: latestDraft.background || "",
          coaIssuer: latestDraft.coaIssuer || "",
          howDidYouHear: latestDraft.howDidYouHear || "",
          consent: false,
        });
        if (latestDraft.files) {
          setFiles(latestDraft.files.map(f => ({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name: f.name,
            size: f.size,
            type: f.type,
          })));
        }
      }
    };
    loadDraft();
  }, [form]);

  useEffect(() => {
    if (debouncedFormData.name || debouncedFormData.email || debouncedFormData.itemDescription) {
      const saveDraft = async () => {
        setDraftStatus("saving");
        try {
          await consignService.drafts.save({
            ...debouncedFormData,
            files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
          });
          const now = new Date();
          setLastSaved(now);
          setDraftStatus("saved");
          
          // Add to version history (keep last 3)
          setDraftVersions((prev) => {
            const newVersion: DraftVersion = {
              id: `v-${now.getTime()}`,
              timestamp: now.getTime(),
            };
            return [newVersion, ...prev].slice(0, 3);
          });
        } catch (error) {
          setDraftStatus("error");
        }
      };
      saveDraft();
    }
     
  }, [debouncedFormData, files]);

  const handleLoadDraft = useCallback((draft: import("@/lib/schemas/consign").ConsignDraft) => {
    form.reset({
      name: draft.name || "",
      email: draft.email || "",
      phone: draft.phone || "",
      country: draft.country || "",
      itemDescription: draft.itemDescription || "",
      category: draft.category || "",
      signedBy: draft.signedBy || "",
      numberOfSignatures: draft.numberOfSignatures,
      estimatedValue: draft.estimatedValue,
      provenance: draft.provenance || "",
      background: draft.background || "",
      coaIssuer: draft.coaIssuer || "",
      howDidYouHear: draft.howDidYouHear || "",
      consent: false,
    });
    if (draft.files) {
      setFiles(draft.files.map(f => ({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: f.name,
        size: f.size,
        type: f.type,
      })));
    }
  }, [form]);

  const handleDiscard = useCallback(() => {
    form.reset();
    setFiles([]);
  }, [form]);

  const onSubmit = async (data: ConsignFormData) => {
    setIsSubmitting(true);
    
    try {
      // Save final draft before submitting
      await consignService.drafts.save({
        ...data,
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      });
      
      const submission = await consignService.submitMock();
      if (submission) {
        toast.success("Consignment form submitted successfully!");
        router.push(`/consign/success?id=${submission.submissionId}`);
      } else {
        toast.error("Failed to submit. Please try again.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <DraftManager onLoadDraft={handleLoadDraft} onDiscard={handleDiscard} />
      <FormProgress currentStep={currentStep} totalSteps={FORM_STEPS.length} steps={FORM_STEPS} />
      
      <DraftStatusBar
        status={draftStatus}
        lastSaved={lastSaved}
        versions={draftVersions}
        onSaveNow={async () => {
          setDraftStatus("saving");
          try {
            await consignService.drafts.save({
              ...form.getValues(),
              files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
            });
            const now = new Date();
            setLastSaved(now);
            setDraftStatus("saved");
            toast.success("Draft saved");
          } catch {
            setDraftStatus("error");
            toast.error("Failed to save draft");
          }
        }}
        onRestoreVersion={(version) => {
          // For now, just show a message - full version restore would require storing snapshots
          toast.info(`Version from ${new Date(version.timestamp).toLocaleString()} - restore not yet implemented`);
        }}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Your Information</CardTitle>
              <CardDescription>Please provide your contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <YourInformationSection control={form.control} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Item Details</CardTitle>
              <CardDescription>Describe the item you want to consign</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemDetailsSection control={form.control} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Signature Information</CardTitle>
              <CardDescription>Information about signatures on the item</CardDescription>
            </CardHeader>
            <CardContent>
              <SignatureInformationSection control={form.control} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Estimated Value</CardTitle>
              <CardDescription>Your estimated value for this item</CardDescription>
            </CardHeader>
            <CardContent>
              <EstimatedValueSection control={form.control} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Provenance & Background</CardTitle>
              <CardDescription>History and background of the item</CardDescription>
            </CardHeader>
            <CardContent>
              <ProvenanceSection control={form.control} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Additional Information</CardTitle>
              <CardDescription>Any additional information</CardDescription>
            </CardHeader>
            <CardContent>
              <AdditionalInformationSection control={form.control} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Image Uploads</CardTitle>
              <CardDescription>Upload images and documents (max 20 files, 15MB each, total 120MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <UploadManager
                value={files}
                onChange={setFiles}
                maxFiles={20}
                maxFileSize={15 * 1024 * 1024} // 15MB
                maxTotalSize={120 * 1024 * 1024} // 120MB
                allowedTypes={["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]}
                requiredTags={["Full item", "Signature close-up"]}
                showWarnings={true}
                onValidationError={(error) => toast.error(error)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Limits: 20 files max, 15MB per file, 120MB total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Terms & Conditions</CardTitle>
              <CardDescription>Please review and accept our terms</CardDescription>
            </CardHeader>
            <CardContent>
              <TermsSection control={form.control} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit for Consignment"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
