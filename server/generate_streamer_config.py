#!/usr/bin/env python3
"""
Generate per-member SRTLA relay configuration and ffmpeg push commands.

Usage:
    python generate_streamer_config.py --members 10 --dry-run
    python generate_streamer_config.py --members 10 --server-host 140.x.x.x --dry-run
"""

import argparse
import json
import sys

SRTLA_BASE_PORT = 5000
SLS_INTERNAL_HOST = "127.0.0.1"
SLS_INTERNAL_PORT = 9000
KICK_RTMP_BASE = "rtmp://fa723fc1b171.global-contribute.live-video.net/app"


def generate_member(member_id: int, server_host: str) -> dict:
    port = SRTLA_BASE_PORT + member_id - 1
    stream_id = f"live/{port}"
    kick_key_placeholder = "{{" + f"KICK_KEY_{member_id:02d}" + "}}"

    return {
        "member_id": member_id,
        "srtla_listen_port": port,
        "srtla_url": f"srtla://{server_host}:{port}",
        "sls_stream_id": stream_id,
        "ffmpeg_pull_url": (
            f"srt://{SLS_INTERNAL_HOST}:{SLS_INTERNAL_PORT}"
            f"?streamid={stream_id}&mode=caller"
        ),
        "kick_push_url": f"{KICK_RTMP_BASE}/{kick_key_placeholder}",
        "ffmpeg_cmd": (
            f"ffmpeg -i "
            f"'srt://{SLS_INTERNAL_HOST}:{SLS_INTERNAL_PORT}"
            f"?streamid={stream_id}&mode=caller' "
            f"-c copy -f flv "
            f"'{KICK_RTMP_BASE}/{kick_key_placeholder}'"
        ),
        "systemd_unit": f"srtla-rec@{port}.service",
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate SRTLA relay member configs (no real stream keys)"
    )
    parser.add_argument(
        "--members", type=int, default=10,
        help="Number of members to generate (default: 10)"
    )
    parser.add_argument(
        "--server-host", default="YOUR_ORACLE_VM_IP",
        help="Oracle VM public IP address"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print config to stdout without writing files"
    )
    args = parser.parse_args()

    if args.members < 1 or args.members > 10:
        print("ERROR: --members must be between 1 and 10", file=sys.stderr)
        sys.exit(1)

    configs = [generate_member(i, args.server_host) for i in range(1, args.members + 1)]

    if args.dry_run:
        print(json.dumps(configs, indent=2, ensure_ascii=False))
        return

    print(
        "Use --dry-run to preview. File output is not implemented in this version.",
        file=sys.stderr,
    )
    sys.exit(1)


if __name__ == "__main__":
    main()
