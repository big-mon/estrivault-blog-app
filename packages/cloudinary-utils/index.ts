import { Cloudinary } from "@cloudinary/url-gen";
import { fill, fit } from "@cloudinary/url-gen/actions/resize";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";

/**
 * Cloudinary 画像 URL を生成
 */
export function buildUrl(
  cloudName: string = "",
  publicId: string,
  opts: {
    w: number;
    h?: number;
    mode?: "fill" | "fit";
  }
): string {
  const resolvedCloudName = cloudName === "" ? process.env.PUBLIC_CLOUDINARY_CLOUD_NAME : cloudName;
  const cld = new Cloudinary({ cloud: { cloudName: resolvedCloudName } });
  const img = cld.image(publicId);

  if (opts.mode === "fit" || !opts.h) {
    img.resize(fit().width(opts.w));
  } else {
    img.resize(fill().width(opts.w).height(opts.h));
  }

  img.delivery(format("auto")).delivery(quality("auto"));
  return img.toURL();
}
