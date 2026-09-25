#!/usr/bin/env python3
"""
Generate a Moblin SRTLA connection QR code for a streamer member.

Usage:
    python generate_moblin_qr.py \
        --member-id 1 \
        --srt-host 140.x.x.x \
        --port 5000 \
        --stream-id live/5000 \
        --output stream_keys/member01_qr.png

Requires:
    pip install qrcode[pil]
"""

import argparse
import sys
import urllib.parse
from pathlib import Path


def build_srtla_url(host: str, port: int, stream_id: str) -> str:
    params = urllib.parse.urlencode({"streamId": stream_id})
    return f"srtla://{host}:{port}?{params}"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate Moblin SRTLA QR code for a member"
    )
    parser.add_argument("--member-id", type=int, required=True, help="Member number (1-10)")
    parser.add_argument("--srt-host", required=True, help="Oracle VM public IP or hostname")
    parser.add_argument("--port", type=int, required=True, help="SRTLA listen port (e.g. 5000)")
    parser.add_argument("--stream-id", required=True, help="SLS stream ID (e.g. live/5000)")
    parser.add_argument("--output", required=True, help="Output PNG file path")
    args = parser.parse_args()

    try:
        import qrcode
    except ImportError:
        print(
            "ERROR: qrcode library not installed.\n"
            "  Run: pip install qrcode[pil]",
            file=sys.stderr,
        )
        sys.exit(1)

    url = build_srtla_url(args.srt_host, args.port, args.stream_id)

    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(output_path))

    print(f"Member {args.member_id:02d} QR code saved: {output_path}")
    print(f"URL: {url}")


if __name__ == "__main__":
    main()
