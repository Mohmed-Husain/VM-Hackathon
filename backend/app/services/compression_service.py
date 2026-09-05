import io
import logging
from PIL import Image, ImageOps
import pikepdf

logger = logging.getLogger(__name__)


class CompressionService:
    @staticmethod
    def compress_image(file_bytes: bytes, max_kb: int = 250) -> tuple[bytes, dict]:
        original_size = len(file_bytes)
        target_bytes = max_kb * 1024

        try:
            with Image.open(io.BytesIO(file_bytes)) as img:
                img = ImageOps.exif_transpose(img)

                # Convert to RGB if RGBA/P
                if img.mode in ("RGBA", "P", "LA"):
                    background = Image.new("RGB", img.size, (255, 255, 255))
                    if img.mode == "P":
                        img = img.convert("RGBA")
                    background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                    img = background
                elif img.mode != "RGB":
                    img = img.convert("RGB")

                # Downscale if dimensions exceed standard government portal limits (1600px max edge)
                max_edge = 1600
                if max(img.width, img.height) > max_edge:
                    ratio = max_edge / max(img.width, img.height)
                    new_size = (int(img.width * ratio), int(img.height * ratio))
                    img = img.resize(new_size, Image.Resampling.LANCZOS)

                # Iterative compression
                best_bytes = file_bytes
                for quality in (85, 75, 65, 55, 45):
                    buf = io.BytesIO()
                    img.save(buf, format="JPEG", quality=quality, optimize=True)
                    out = buf.getvalue()
                    best_bytes = out
                    if len(out) <= target_bytes:
                        break

                compressed_size = len(best_bytes)
                ratio = round(max(0.0, (original_size - compressed_size) / original_size), 2)

                stats = {
                    "original_size_bytes": original_size,
                    "compressed_size_bytes": compressed_size,
                    "compression_ratio": ratio,
                }
                return best_bytes, stats

        except Exception as err:
            logger.warning("Image compression failed, using original: %s", err)
            stats = {
                "original_size_bytes": original_size,
                "compressed_size_bytes": original_size,
                "compression_ratio": 0.0,
            }
            return file_bytes, stats

    @staticmethod
    def compress_pdf(file_bytes: bytes, max_kb: int = 500) -> tuple[bytes, dict]:
        original_size = len(file_bytes)
        try:
            with pikepdf.open(io.BytesIO(file_bytes)) as pdf:
                buf = io.BytesIO()
                pdf.save(buf, linearize=True, recompress_flate=True)
                compressed = buf.getvalue()

                # If pikepdf produced a smaller file, use it
                if len(compressed) < original_size:
                    compressed_size = len(compressed)
                    ratio = round((original_size - compressed_size) / original_size, 2)
                    return compressed, {
                        "original_size_bytes": original_size,
                        "compressed_size_bytes": compressed_size,
                        "compression_ratio": ratio,
                    }
                else:
                    return file_bytes, {
                        "original_size_bytes": original_size,
                        "compressed_size_bytes": original_size,
                        "compression_ratio": 0.0,
                    }
        except Exception as err:
            logger.warning("PDF compression failed, using original: %s", err)
            return file_bytes, {
                "original_size_bytes": original_size,
                "compressed_size_bytes": original_size,
                "compression_ratio": 0.0,
            }

