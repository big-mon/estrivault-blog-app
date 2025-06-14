export interface EmbedOptions {
  youtube?: boolean;
  twitter?: boolean;
  github?: boolean;
  amazon?: boolean;
}

export interface ProcessorOptions {
  embeds?: EmbedOptions;
  cloudinaryCloudName?: string;
  imageBase?: string;
  sanitizeSchema?: import('hast-util-sanitize').Schema;
}
