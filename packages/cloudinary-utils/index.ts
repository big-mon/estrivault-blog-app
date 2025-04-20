import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";

const cld = new Cloudinary({
  cloud: { cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME }
});

/**
 * Cloudinary 画像 URL を生成
 */
function buildUrl(
  publicId: string,
  opts: { w?: number; h?: number } = {}
): string {
  const { w = 1200, h } = opts;
  return cld
    .image(publicId)
    .resize(fill().width(w).height(h))
    .delivery(format("auto"))
    .delivery(quality("auto"))
    .toURL();
}

export { buildUrl };
