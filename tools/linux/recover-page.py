#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tools/linux/recover-page.py — the tabby-v04.0 recovery page (builds/tabby-v04.0-recover/)

Purpose
    On 2026-11-09 the user's tabby-v04.0 install on the Mac left the SMK-37 in its Jieli update
    loader under the name ota-SMK370000000000000000 (an all-zero build tag: the loader was entered
    without command 50, the page's forced path; BUILD.md left-to-build "The all-zero loader tag").
    A power cycle did not leave the loader. The published tabby-v04.0 page refuses that name
    (Task 12 A5: "not in the list of published builds"), and no published page accepts it.

    This tool makes a recovery page from the PUBLISHED tabby-v04.0 standalone page, so the
    firmware package (build b6e9590223446363…, .fwsc 368c6130…) is carried byte for byte; a
    rebuild from source would change the build id, because the build id hashes sdk/manifest.json,
    which pins sdk/WebUpdate.js. Only the page's script text is patched:

    WebUpdate.js (the copy inside the page, which must equal sdk/WebUpdate.js of tabby-v04.0):
      Z1  ZERO_TAG = '0000000000000000'.
      Z2  connect(): a loader named ota-SMK37 + ZERO_TAG takes the existing model-confirmed resume
          path (mode 'loader', resume, modelUnverified), as the vendor's unidentified loader does.
          Any other tag that is not this page's build is still refused (LOADER_MISMATCH).
      Z3  waitFor(): the zero tag is not refused, and it is accepted while waiting for a loader.
      F1  connect(): force is always false, whatever the caller passes.
      F2  a non-Open identity (factory V16 or anything else) fails with a message; there is no
          migration or legacy mode on this page.
      F3  the capability query (49) at Connect is retried on a timeout (4 tries); if it never
          answers, Connect fails with a message to power-cycle and connect again. It never
          suggests force flash.
      F4  the identity query (17) is tried 4 times when the port opens (was 2), and the
          identity re-check in install() is retried on a timeout.
    Every other check is untouched: package SHA-256, model, container, chip id (AC791N),
    directory and component CRCs, loader hash, the explicit "SMK-37 Pro" confirmation before
    writing to a loader, and the build id check after the restart.

    Page code (sdk/Update.html.in inside the page):
      P1-P9   force flash can not be turned on: the Connect and Start update calls pass false, the
              checkbox is disabled and kept unchecked, "Enable force flash and reconnect" is always
              hidden and does nothing, setForceMode() always sets false, forceSuggested stays false,
              the "Migration, factory restore and forced updates" group is hidden, and factory
              restore (which ticks force) is disabled.
      P10     a notice at the top of the update tab naming the page and what it does.
      P11     the source link names the archive of the commit that holds this tool (--source-url).

Usage
    python3 -I tools/linux/recover-page.py build --source-url URL [--out build/recover]
        reads build/gh-pages/builds/tabby-v04.0/SMK37-Open-Source.html (SHA-256 checked), writes
        <out>/SMK37-Open-Source.html, <out>/WebUpdate.js (the patched copy, for the tests) and
        <out>/site/ (tools/Build-Hosted.cjs), and checks the site's firmware asset and package
        metadata against the published tabby-v04.0 site.
    python3 -I tools/linux/recover-page.py webupdate --out FILE
        writes sdk/WebUpdate.js with the Z/F patches applied (tests/workbench/recover-page.mjs).

Version: 0.1

Revision log
    v0.1  2026-11-09  Initial version (Task 12, the install incident of 2026-11-09).
"""
import argparse
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUBLISHED = ROOT / "build/gh-pages/builds/tabby-v04.0"
PUBLISHED_HTML_SHA256 = "fe7d9604786551081b00e59d16f3fd16028c2e191b9ea5b5bb74774e426122e8"
FWSC_SHA256 = "368c613022672f8918cb990cd886970edc771014afba2dd93a736577e29f24af"
BUILD_ID = "b6e9590223446363dff53a2190bd80eb020233c63dd2d90cfa778e361ce0f708"

NO_MIGRATION = ("'This recovery page installs tabby-v04.0 only over Classic Tabby or Open firmware, or into the "
                "update loader. The device answered \"'+this.identity+'\". Nothing was sent. Stop and report this "
                "identity. Do not use force flash.'")
NO_CAPABILITY = ("'The device did not answer the version query after 4 tries. Nothing was written. Power-cycle the "
                 "SMK-37, close other MIDI apps and other workbench tabs, then click Connect device again. Do not use "
                 "force flash.'")

# (name, old, new): each old text must occur exactly once in its target.
WEBUPDATE_PATCHES = [
    ("Z1 zero tag constant",
     "  const ownTag = pkg => String(pkg.build_id||'').slice(0,16).toLowerCase();\n",
     "  const ownTag = pkg => String(pkg.build_id||'').slice(0,16).toLowerCase();\n"
     "  // RECOVERY PAGE (tools/linux/recover-page.py, builds/tabby-v04.0-recover/): the all-zero tag of a loader\n"
     "  // entered without command 50 is treated as the vendor's unidentified loader (model-confirmed resume).\n"
     "  // This page never force flashes; Connect queries are retried on a timeout.\n"
     "  const ZERO_TAG='0000000000000000';\n"
     "  async function queryRetry(link,command,payload=[],tries=4) {\n"
     "    for(let attempt=0;;attempt++) {\n"
     "      try { return await link.query(command,payload); }\n"
     "      catch(error) { if(error.code!=='TIMEOUT'||link.lost||attempt>=tries-1) throw error; }\n"
     "    }\n"
     "  }\n"),
    ("Z2 connect accepts the zero tag as an unidentified loader",
     "        if(stale && stale!==ownTag(this.pkg)) throw await this.loaderMismatch(stale,this.identity);\n"
     "        if(this.identity===this.pkg.loaderIdentity || this.identity===taggedLoader(this.pkg) ||\n",
     "        if(stale && stale!==ownTag(this.pkg) && stale!==ZERO_TAG) throw await this.loaderMismatch(stale,this.identity);\n"
     "        if(this.identity===this.pkg.loaderIdentity || this.identity===taggedLoader(this.pkg) || stale===ZERO_TAG ||\n"),
    ("Z3a waitFor does not refuse the zero tag",
     "            if(stale && stale!==ownTag(this.pkg) && !expected.includes(device.identity)) {\n",
     "            if(stale && stale!==ownTag(this.pkg) && stale!==ZERO_TAG && !expected.includes(device.identity)) {\n"),
    ("Z3b waitFor accepts the zero tag while waiting for a loader",
     "            if(expected.includes(device.identity) || (loaderModel && modelLoader(device.identity,loaderModel))) {\n",
     "            if(expected.includes(device.identity) || (loaderModel && (modelLoader(device.identity,loaderModel) || stale===ZERO_TAG))) {\n"),
    ("F1 connect never forces",
     "      this.force=force;this.mode=null;this.pick=pick||null;\n",
     "      force=false;this.force=false;this.mode=null;this.pick=pick||null;   // RECOVERY PAGE: never force\n"),
    ("F2 no migration or legacy mode",
     "          this.mode=force?'legacy':'migration';\n"
     "          return {identity:this.identity,...(force?{legacy:true}:{migration:true})};\n",
     "          fail(" + NO_MIGRATION + ");   // RECOVERY PAGE: no migration, no legacy flash\n"),
    ("F3a capability query retried",
     "        try {cap=capability(await this.link.query(49));}\n",
     "        try {cap=capability(await queryRetry(this.link,49));}   // RECOVERY PAGE: retried on a timeout\n"),
    ("F3b capability timeout fails without force",
     "          if(!force){this.mode='migration';return {identity:this.identity,migration:true};}\n"
     "          this.mode='legacy';return {resume:false,identity:this.identity,legacy:true};\n",
     "          fail(" + NO_CAPABILITY + ");   // RECOVERY PAGE: never migration or force\n"),
    ("F4a identity query tried 4 times when a port opens",
     "        for(let attempt=0;attempt<2;attempt++){\n"
     "          try {reply=await link.query(17,[],750);break;}\n"
     "          catch(error){if(error.code!=='TIMEOUT'||attempt||link.lost)throw error;}\n",
     "        for(let attempt=0;attempt<4;attempt++){   // RECOVERY PAGE: 4 tries (was 2)\n"
     "          try {reply=await link.query(17,[],750);break;}\n"
     "          catch(error){if(error.code!=='TIMEOUT'||attempt>=3||link.lost)throw error;}\n"),
    ("F4b install identity re-check retried",
     "        const reply=await this.link.query(17);\n"
     "        check(reply.length===27 && ascii(reply)===original,'设备身份已改变，请重新连接');\n",
     "        const reply=await queryRetry(this.link,17);   // RECOVERY PAGE: retried on a timeout\n"
     "        check(reply.length===27 && ascii(reply)===original,'设备身份已改变，请重新连接');\n"),
]

NOTICE = ('<p id="recover-note" role="alert" style="border:1px solid var(--accent);border-radius:8px;padding:10px 12px">'
          '<b>Recovery page for tabby-v04.0.</b> Same firmware package as the main page (build b6e9590223446363). '
          'It also accepts the untagged update loader ota-SMK370000000000000000, after you confirm the model. '
          'This page never uses force flash.</p>')

PAGE_PATCHES = [
    ("P1 Connect passes force false",
     "updater.connect({force:$('force-update').checked,signal,", "updater.connect({force:false,signal,"),
    ("P2 Start update passes force false",
     "const force=$('force-update').checked;", "const force=false;"),
    ("P3 the force button stays hidden",
     "$('force-activate').hidden=!forceSuggested||$('force-update').checked;", "$('force-activate').hidden=true;"),
    ("P4 the force checkbox disabled and unchecked",
     "$('force-update').disabled=locked||!pkg||pkg.kind==='stock';",
     "$('force-update').disabled=true;$('force-update').checked=false;"),
    ("P5 the force checkbox can not be ticked",
     "$('force-update').addEventListener('change',()=>setForceMode($('force-update').checked));",
     "$('force-update').addEventListener('change',()=>{$('force-update').checked=false;});"),
    ("P6 the force button does nothing",
     "$('force-activate').addEventListener('click',()=>setForceMode(true,true));",
     "/* RECOVERY PAGE: no force flash */"),
    ("P7 setForceMode always sets false",
     "$('force-update').checked=value;$('force-warning').hidden=!value;enable();",
     "value=false;$('force-update').checked=false;$('force-warning').hidden=true;enable();"),
    ("P8a no force suggestion after an error",
     "forceSuggested=error.code==='FIRMWARE_MISMATCH';", "forceSuggested=false;"),
    ("P8b no force suggestion after Connect",
     "forceSuggested=migration;", "forceSuggested=false;"),
    ("P9a factory restore disabled (it ticks force)",
     "$('stock-restore').disabled=locked||!openPkg||!FM1_PACKAGE?.stock;", "$('stock-restore').disabled=true;"),
    ("P9b factory restore does nothing",
     "$('stock-restore').onclick=()=>chooseFirmware(true);", "$('stock-restore').onclick=()=>{};"),
    ("P9d choosing a firmware never ticks force",
     "$('force-update').checked=stock;", "$('force-update').checked=false;"),
    ("P9c the migration and force group hidden",
     '<details id="update-options" class="library-group">', '<details id="update-options" class="library-group" hidden>'),
    ("P10 the recovery notice",
     '<p id="loader-hint" hidden></p>', '<p id="loader-hint" hidden></p>' + NOTICE),
]


class RecoverError(Exception):
    pass


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def apply(text, patches, what):
    for name, old, new in patches:
        n = text.count(old)
        if n != 1:
            raise RecoverError("%s: patch %s matches %d times (expected 1)." % (what, name, n))
        text = text.replace(old, new)
    return text


def patched_webupdate(source):
    return apply(source, WEBUPDATE_PATCHES, "WebUpdate.js")


def build(args, log=print):
    html_path = PUBLISHED / "SMK37-Open-Source.html"
    raw = html_path.read_bytes()
    if sha256(raw) != PUBLISHED_HTML_SHA256:
        raise RecoverError("%s is not the published tabby-v04.0 page (SHA-256 %s)." % (html_path, sha256(raw)))
    html = raw.decode("utf-8")
    source = (ROOT / "sdk/WebUpdate.js").read_text(encoding="utf-8")
    tagged = subprocess.run(["git", "show", "tabby-v04.0:sdk/WebUpdate.js"], cwd=str(ROOT), capture_output=True, text=True, check=True).stdout
    if source != tagged:
        raise RecoverError("sdk/WebUpdate.js differs from tabby-v04.0; the patches are written against that version.")
    if html.count(source) != 1:
        raise RecoverError("The published page does not carry sdk/WebUpdate.js verbatim exactly once.")
    web = patched_webupdate(source)
    html = html.replace(source, web)
    rest = html.replace(web, "")            # page patches must not touch the WebUpdate.js text
    for name, old, _new in PAGE_PATCHES:
        if rest.count(old) != 1 or web.count(old):
            raise RecoverError("page: patch %s matches %d times outside WebUpdate.js." % (name, rest.count(old)))
    html = apply(html, PAGE_PATCHES, "page")
    link = re.search(r'<a href="([^"]+)"([^>]*)>源码与 SDK</a>', html)
    if not link or html.count(link.group(0)) != 1:
        raise RecoverError("source link not found exactly once.")
    if not args.source_url.startswith("https://"):
        raise RecoverError("--source-url must be an https URL.")
    html = html.replace(link.group(0), '<a href="%s"%s>源码与 SDK</a>' % (args.source_url, link.group(2)))
    # The package metadata must be the published one, byte for byte.
    pkg_old = re.search(r"const FM1_PACKAGE = .*;", raw.decode("utf-8")).group(0)
    if html.count(pkg_old) != 1:
        raise RecoverError("FM1_PACKAGE changed.")
    out = pathlib.Path(args.out).resolve()
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    (out / "SMK37-Open-Source.html").write_text(html, encoding="utf-8")
    (out / "WebUpdate.js").write_text(web, encoding="utf-8")
    site = out / "site"
    r = subprocess.run([args.node, str(ROOT / "tools/Build-Hosted.cjs"), str(out / "SMK37-Open-Source.html"), str(site)], cwd=str(ROOT))
    if r.returncode:
        raise RecoverError("tools/Build-Hosted.cjs failed (exit %d)." % r.returncode)
    # Checks against the published tabby-v04.0 site.
    fw = site / "assets/smk37" / (FWSC_SHA256 + ".bin")
    if not fw.is_file() or sha256(fw.read_bytes()) != FWSC_SHA256:
        raise RecoverError("the firmware asset is missing or differs.")
    if fw.read_bytes() != (PUBLISHED / "assets/smk37" / (FWSC_SHA256 + ".bin")).read_bytes():
        raise RecoverError("the firmware asset differs from the published one.")
    a_new = json.loads((site / "assets.json").read_text())
    a_old = json.loads((PUBLISHED / "assets.json").read_text())
    for k in ("build", "release", "version"):
        if a_new.get(k) != a_old.get(k):
            raise RecoverError("assets.json %s differs: %r vs %r" % (k, a_new.get(k), a_old.get(k)))
    if a_new["build"] != BUILD_ID:
        raise RecoverError("build id %s is not %s" % (a_new["build"], BUILD_ID))
    def hosted_package(d):          # Build-Hosted.cjs moves the page script, FM1_PACKAGE with it, into one asset
        found = [m.group(1) for f in [d / "index.html", *sorted((d / "assets/smk37").glob("*.js"))]
                 for m in [re.search(r"const FM1_PACKAGE = (.*?);\n", f.read_text(encoding="utf-8"))] if m]
        return found[0] if len(found) == 1 else None
    pkg_new, pkg_pub = hosted_package(site), hosted_package(PUBLISHED)
    if not pkg_new or pkg_new != pkg_pub:
        raise RecoverError("the hosted page's FM1_PACKAGE differs from the published tabby-v04.0 site.")
    entry = [p for p in (site / "assets/smk37").glob("*.js") if web in p.read_text(encoding="utf-8")]
    if len(entry) != 1:
        raise RecoverError("the patched WebUpdate.js is not in exactly one hosted script (%d)." % len(entry))
    log("recovery page: %s" % site)
    log("  standalone SHA-256 %s (%d bytes)" % (sha256((out / "SMK37-Open-Source.html").read_bytes()), (out / "SMK37-Open-Source.html").stat().st_size))
    log("  index.html SHA-256 %s" % sha256((site / "index.html").read_bytes()))
    log("  firmware asset %s identical to the published one; build %s; version %s" % (FWSC_SHA256[:16], a_new["build"][:16], a_new["version"]))
    log("  patched WebUpdate.js in %s" % entry[0].name)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build")
    b.add_argument("--source-url", required=True)
    b.add_argument("--out", default=str(ROOT / "build/recover"))
    b.add_argument("--node", default="/usr/bin/node")
    w = sub.add_parser("webupdate")
    w.add_argument("--out", required=True)
    args = ap.parse_args()
    try:
        if args.cmd == "build":
            build(args)
        else:
            pathlib.Path(args.out).write_text(patched_webupdate((ROOT / "sdk/WebUpdate.js").read_text(encoding="utf-8")), encoding="utf-8")
    except (RecoverError, subprocess.CalledProcessError, OSError) as e:
        print("recover-page: %s" % e, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
