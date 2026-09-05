import base64
import io
import random
import time
import uuid
from PIL import Image, ImageDraw, ImageFont

# In-memory store: { challenge_id: {"code": str, "expires_at": float} }
_CHALLENGES: dict[str, dict] = {}
TTL_SECONDS = 600  # 10 minutes

# Unambiguous characters (avoiding 0/O, 1/I/l)
CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"


class CaptchaService:
    @classmethod
    def _cleanup_expired(cls) -> None:
        now = time.time()
        expired = [cid for cid, data in _CHALLENGES.items() if data["expires_at"] < now]
        for cid in expired:
            _CHALLENGES.pop(cid, None)

    @classmethod
    def generate_captcha(cls) -> dict:
        cls._cleanup_expired()

        code = "".join(random.choices(CAPTCHA_CHARS, k=6))
        challenge_id = str(uuid.uuid4())
        _CHALLENGES[challenge_id] = {
            "code": code,
            "expires_at": time.time() + TTL_SECONDS,
        }

        # Create canvas
        width, height = 180, 56
        bg_color = (random.randint(235, 248), random.randint(238, 250), random.randint(240, 252))
        img = Image.new("RGB", (width, height), color=bg_color)
        draw = ImageDraw.Draw(img)

        # Draw light background grid lines
        for x in range(0, width, random.randint(15, 25)):
            draw.line([(x, 0), (x, height)], fill=(215, 225, 235), width=1)
        for y in range(0, height, random.randint(12, 20)):
            draw.line([(0, y), (width, y)], fill=(215, 225, 235), width=1)

        # Load font
        try:
            font = ImageFont.truetype("arial.ttf", 30)
        except Exception:
            try:
                font = ImageFont.truetype("consola.ttf", 30)
            except Exception:
                font = ImageFont.load_default()

        # Render each character with random offset and slight angle
        char_spacing = (width - 24) / len(code)
        for i, char in enumerate(code):
            char_img = Image.new("RGBA", (40, 44), (255, 255, 255, 0))
            char_draw = ImageDraw.Draw(char_img)
            char_color = (
                random.randint(11, 45),
                random.randint(40, 110),
                random.randint(110, 180),
            )
            char_draw.text((6, 2), char, font=font, fill=char_color)

            # Random rotation (-18 to +18 deg)
            angle = random.uniform(-18, 18)
            rotated_char = char_img.rotate(angle, expand=False, resample=Image.Resampling.BICUBIC)

            x_pos = int(12 + i * char_spacing + random.randint(-2, 2))
            y_pos = int(6 + random.randint(-4, 4))
            img.paste(rotated_char, (x_pos, y_pos), rotated_char)

        # Draw interference lines
        for _ in range(4):
            x1, y1 = random.randint(0, 30), random.randint(5, height - 5)
            x2, y2 = random.randint(width - 30, width), random.randint(5, height - 5)
            line_color = (random.randint(100, 180), random.randint(100, 180), random.randint(130, 200))
            draw.line([(x1, y1), (x2, y2)], fill=line_color, width=random.choice([1, 2]))

        # Draw random noise dots
        for _ in range(80):
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)
            dot_color = (random.randint(120, 200), random.randint(120, 200), random.randint(120, 200))
            draw.point((x, y), fill=dot_color)

        # Export as base64 PNG
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        data_uri = f"data:image/png;base64,{img_str}"

        return {
            "challenge_id": challenge_id,
            "image_base64": data_uri,
        }

    @classmethod
    def verify(cls, challenge_id: str | None, answer: str | None) -> bool:
        cls._cleanup_expired()
        if not challenge_id or not answer:
            return False

        challenge = _CHALLENGES.pop(challenge_id, None)
        if not challenge:
            return False

        if challenge["expires_at"] < time.time():
            return False

        return challenge["code"].strip().upper() == answer.strip().upper()

