"use client";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";

const FileShare = () => {
  const props = useSupabaseUpload({
    bucketName: "shareable-assets",
    path: "",
    allowedMimeTypes: ["image/*"],
    maxFiles: 5,
    maxFileSize: 1000 * 1000 * 10, // 10MB,
    shareButton: true
  });
  return (
    <div className="w-[500px]">
      <Dropzone {...props}>
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
    </div>
  );
};

export default FileShare;
