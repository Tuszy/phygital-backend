import { z } from "zod";

const LSP4MetadataAttribute = z.object({
  key: z.string(),
  value: z.string(),
  type: z.string(),
});

const LSP4MetadataAsset = z.object({
  width: z.number(),
  height: z.number(),
  verificationFunction: z.string(),
  verificationData: z.string(),
  url: z.string(),
});

const LSP4MetadataImage = z.object({
  verificationFunction: z.string(),
  verificationData: z.string(),
  url: z.string(),
  fileType: z.number(),
});

const LSP4MetadataLink = z.object({
  title: z.string(),
  url: z.string(),
});

export const LSP4Metadata = z.object({
  description: z.string(),
  links: z.array(LSP4MetadataLink).optional(),
  icon: z.array(LSP4MetadataImage).optional(),
  images: z.array(LSP4MetadataImage).optional(),
  assets: z.array(LSP4MetadataAsset).optional(),
  attributes: z.array(LSP4MetadataAttribute).optional(),
});

export type LSP4MetadataType = z.infer<typeof LSP4Metadata>;
