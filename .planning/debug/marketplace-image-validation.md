# Debug: marketplace image validation — expected string, received undefined

**Status:** DEBUG COMPLETE  
**Related:** marketplace-finalize-upload.md

## Symptoms

- Cover image preview visible after upload
- Validation error: `Invalid input: expected string, received undefined`
- Zod rejects `image` field on submit

## Root cause

`image` was never registered in react-hook-form. Without `defaultValues.image` or `register("image")`, RHF keeps the field as `undefined` for resolver validation even when `coverImage` UI state has a URL.

## Fix

- `defaultValues.image: ""`
- Hidden `<input {...register("image")} />`
- `setValue("image", url, { shouldValidate: true })` after upload
- `handleFormSubmit` syncs `coverImage.url` before `handleSubmit` runs

## Files

- `src/admin/marketplace/components/MarketplaceForm.tsx`
