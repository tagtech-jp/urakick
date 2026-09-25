"""
Smoke tests for generate_streamer_config.py and generate_moblin_qr.py.

Run: pytest tests/
"""

import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).parent.parent
GENERATE_CONFIG = REPO_ROOT / "server" / "generate_streamer_config.py"
GENERATE_QR = REPO_ROOT / "client" / "generate_moblin_qr.py"


# ---------------------------------------------------------------------------
# generate_streamer_config.py
# ---------------------------------------------------------------------------


def test_generate_config_dry_run_exits_zero():
    """--dry-run exits with code 0."""
    result = subprocess.run(
        [sys.executable, str(GENERATE_CONFIG), "--members", "10", "--dry-run"],
        capture_output=True, text=True, timeout=10,
    )
    assert result.returncode == 0, f"Unexpected exit code. stderr: {result.stderr}"


def test_generate_config_dry_run_valid_json():
    """--dry-run stdout is valid JSON."""
    result = subprocess.run(
        [sys.executable, str(GENERATE_CONFIG), "--members", "10", "--dry-run"],
        capture_output=True, text=True, timeout=10,
    )
    assert result.returncode == 0
    configs = json.loads(result.stdout)
    assert isinstance(configs, list)


def test_generate_config_member_count():
    """--members 10 produces exactly 10 entries."""
    result = subprocess.run(
        [sys.executable, str(GENERATE_CONFIG), "--members", "10", "--dry-run"],
        capture_output=True, text=True, timeout=10,
    )
    configs = json.loads(result.stdout)
    assert len(configs) == 10


def test_generate_config_ports():
    """member N uses port 4999+N (member 1 → 5000 … member 10 → 5009)."""
    result = subprocess.run(
        [sys.executable, str(GENERATE_CONFIG), "--members", "10", "--dry-run"],
        capture_output=True, text=True, timeout=10,
    )
    configs = json.loads(result.stdout)
    for cfg in configs:
        expected_port = 4999 + cfg["member_id"]
        assert cfg["srtla_listen_port"] == expected_port, (
            f"member {cfg['member_id']}: expected port {expected_port}, "
            f"got {cfg['srtla_listen_port']}"
        )


def test_generate_config_no_real_stream_keys():
    """Dry-run output must not contain any real stream key values.

    Stream keys are 32+ char alphanumeric strings. Placeholders are {{...}}.
    """
    result = subprocess.run(
        [sys.executable, str(GENERATE_CONFIG), "--members", "10", "--dry-run"],
        capture_output=True, text=True, timeout=10,
    )
    output = result.stdout
    # Real Kick stream keys are typically 32+ char lowercase hex/alphanum strings
    suspicious = re.findall(r'\b[a-f0-9]{32,}\b', output)
    assert len(suspicious) == 0, f"Possible real stream key in output: {suspicious}"


def test_generate_config_kick_url_has_placeholder():
    """kick_push_url must contain a {{...}} placeholder, not a real key."""
    result = subprocess.run(
        [sys.executable, str(GENERATE_CONFIG), "--members", "10", "--dry-run"],
        capture_output=True, text=True, timeout=10,
    )
    configs = json.loads(result.stdout)
    for cfg in configs:
        assert "{{" in cfg["kick_push_url"], (
            f"member {cfg['member_id']}: kick_push_url has no placeholder: "
            f"{cfg['kick_push_url']}"
        )


def test_generate_config_required_keys():
    """Each entry has the required keys."""
    result = subprocess.run(
        [sys.executable, str(GENERATE_CONFIG), "--members", "10", "--dry-run"],
        capture_output=True, text=True, timeout=10,
    )
    configs = json.loads(result.stdout)
    required = {
        "member_id", "srtla_listen_port", "srtla_url",
        "sls_stream_id", "ffmpeg_cmd", "kick_push_url", "systemd_unit",
    }
    for cfg in configs:
        missing = required - cfg.keys()
        assert not missing, f"member {cfg['member_id']} missing keys: {missing}"


# ---------------------------------------------------------------------------
# generate_moblin_qr.py
# ---------------------------------------------------------------------------


def _has_qrcode() -> bool:
    try:
        import qrcode  # noqa: F401
        return True
    except ImportError:
        return False


@pytest.mark.skipif(not _has_qrcode(), reason="qrcode library not installed")
def test_generate_qr_creates_png():
    """generate_moblin_qr.py creates a non-empty PNG file."""
    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = Path(tmpdir) / "test_qr.png"
        result = subprocess.run(
            [
                sys.executable, str(GENERATE_QR),
                "--member-id", "1",
                "--srt-host", "EXAMPLE.com",
                "--port", "5000",
                "--stream-id", "test01",
                "--output", str(output_path),
            ],
            capture_output=True, text=True, timeout=15,
        )
        assert result.returncode == 0, f"Non-zero exit. stderr: {result.stderr}"
        assert output_path.exists(), "PNG file was not created"
        assert output_path.stat().st_size > 0, "PNG file is empty"


@pytest.mark.skipif(not _has_qrcode(), reason="qrcode library not installed")
def test_generate_qr_url_in_stdout():
    """stdout contains the encoded srtla:// URL."""
    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = Path(tmpdir) / "test_qr.png"
        result = subprocess.run(
            [
                sys.executable, str(GENERATE_QR),
                "--member-id", "1",
                "--srt-host", "EXAMPLE.com",
                "--port", "5000",
                "--stream-id", "test01",
                "--output", str(output_path),
            ],
            capture_output=True, text=True, timeout=15,
        )
        assert "srtla://EXAMPLE.com:5000" in result.stdout, (
            f"Expected srtla:// URL in stdout, got: {result.stdout}"
        )


def test_generate_qr_missing_library_exits_nonzero():
    """When qrcode is absent, script exits with non-zero code."""
    result = subprocess.run(
        [
            sys.executable, "-c",
            # Temporarily hide qrcode by patching builtins.__import__
            (
                "import builtins, sys\n"
                "_orig = builtins.__import__\n"
                "def _block(name, *a, **kw):\n"
                "    if name == 'qrcode': raise ImportError('blocked')\n"
                "    return _orig(name, *a, **kw)\n"
                "builtins.__import__ = _block\n"
                f"sys.argv = ['{GENERATE_QR}', '--member-id', '1', "
                f"'--srt-host', 'X', '--port', '5000', '--stream-id', 's', '--output', 'o.png']\n"
                f"exec(open(r'{GENERATE_QR}').read())"
            ),
        ],
        capture_output=True, text=True, timeout=10,
    )
    assert result.returncode != 0, "Expected non-zero exit when qrcode is missing"
