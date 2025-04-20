import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";

/**
 * Cloudinary 画像 URL を生成
 */
export function buildUrl(
  cloudName: string,
  publicId: string,
  opts: { w?: number; h?: number } = {}
): string {
  const { w = 1200, h = 675 } = opts;
  const cld = new Cloudinary({ cloud: { cloudName } });
  return cld
    .image(publicId)
    .resize(fill().width(w).height(h))
    .delivery(format("auto"))
    .delivery(quality("auto"))
    .toURL();
}
