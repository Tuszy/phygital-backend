import { z } from "zod";

const LSP4Verification = z.object({
  method: z.string(),
  data: z.string(),
  source: z.string().optional(),
});

const LSP4MetadataAttribute = z.object({
  key: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  type: z.string(),
});

const LSP4MetadataImage = z.object({
  width: z.number(),
  height: z.number(),
  url: z.string(),
  verification: LSP4Verification,
});

const LSP4MetadataAsset = z.object({
  url: z.string(),
  fileType: z.string(),
  verification: LSP4Verification,
});

const LSP4MetadataLink = z.object({
  title: z.string(),
  url: z.string(),
});

export const LSP4Metadata = z.object({
  LSP4Metadata: z.object({
    description: z.string().min(1),
    links: z.array(LSP4MetadataLink).min(1),
    icon: z.array(LSP4MetadataImage).min(1),
    images: z.array(z.array(LSP4MetadataImage)).min(1),
    assets: z.array(LSP4MetadataAsset).optional(),
    attributes: z.array(LSP4MetadataAttribute).optional(),
  }),
});

export type LSP4MetadataType = z.infer<typeof LSP4Metadata>;
