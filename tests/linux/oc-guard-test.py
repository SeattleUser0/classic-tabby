#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
"""
tests/linux/oc-guard-test.py — the proof of the Orange Cat soak guard (make test-oc-guard)

Purpose
    THE RULE: while /tmp/oc-soak-running exists nothing of Classic Tabby starts (docs/DEV_CHECKS.md). This test proves
    that every entry point obeys it, and that an entry point added later without the guard is noticed:

    1. It FINDS the entry points itself: every target of the Makefile (read from the Makefile), and every script
       under tools/, scripts/ and tests/ (.py .sh .mjs .cjs .js .ps1). No list is kept by hand.
    2. With a fake flag (a file in a temporary directory, given to the guard as OC_GUARD_TEST_FLAG: a second file that
       blocks; the real one is always looked at too) every entry point is run under strace and must: end with a
       non-zero exit code; say "Orange Cat soak running (<the flag>). Refusing to start <name>."; and touch nothing:
       no file opened for writing, no /dev/snd or other device node opened, no network connection, and no program
       started other than its own interpreter and the guard (no compiler, no browser, no git, no make recipe).
    3. The flag is removed: every entry point must now get PAST the guard: with OC_GUARD_TEST_STOP=1 the guard says
       "oc-guard: passed <name>" and the entry point stops there (the test does not build, publish or touch a device).
    4. The long runs: tools/linux/hw/rc-validate.py's sh() refuses its next command when the flag appears in the middle;
       tabby_link refuses to open the SMK-37 and the H4MIDI port.
    5. Claude Code's hook (scripts/oc_hook.py, .claude/settings.json): blocks a sample make command and a sample
       browser command while the flag exists, allows them after, and never blocks reading a file.
    Exempt from 2 and 3, each for its stated reason and each tested in another way: the guard's own files
    (scripts/oc_guard.*: they ARE the check; 2 and 3 run them directly) and scripts/oc_hook.py (it must run during a
    soak, to say no; part 5). PowerShell scripts cannot run on this computer when pwsh is not installed: then they are
    checked for the guard's line only, and the output says so.

Usage
    python3 -I tests/linux/oc-guard-test.py [--list]       (make test-oc-guard; part of make suite)

Version: 0.2

Revision log
    v0.2  2026-11-24  The user-level hook: every command of ours blocked, every Orange Cat command allowed (docs/BUILD.md 69.4).
    v0.1  2026-11-24  First version (docs/BUILD.md 69).
"""
import os as _oc_os, sys as _oc_sys; _oc_sys.path.insert(0, _oc_os.path.join(_oc_os.path.dirname(_oc_os.path.abspath(__file__)), "../../scripts")); import oc_guard; oc_guard.check()   # OC-GUARD: the Orange Cat soak rule, before anything else (scripts/oc_guard.py)
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
EXTS = (".py", ".sh", ".mjs", ".cjs", ".js", ".ps1")
GUARD_FILES = {"scripts/oc_guard.sh", "scripts/oc_guard.py", "scripts/oc_guard.cjs", "scripts/oc_guard.mjs"}
HOOK = "scripts/oc_hook.py"
USER_HOOK = "scripts/oc_hook_user.py"
# programs an entry point may start before the guard has spoken: its interpreter, the shell, and the guard's own helpers
ALLOWED_EXEC = {"make", "gmake", "bash", "sh", "dash", "python3", "python", "node", "pwsh", "env", "oc_guard.sh", "oc_nice.sh", "basename", "dirname", "readlink", "strace"}
failed = []
rows = []


def check(ok, what, detail=""):
    print("%s %s%s" % ("ok  " if ok else "FAIL", what, (" (%s)" % detail) if detail and not ok else ""), flush=True)
    if not ok:
        failed.append(what)
    return ok


def make_targets():
    out = []
    for line in open(os.path.join(ROOT, "Makefile")):
        m = re.match(r"^([A-Za-z0-9_./-]+(?:[ \t]+[A-Za-z0-9_./-]+)*)[ \t]*:(?!=)", line)
        if not m or line.startswith((".PHONY", ".DEFAULT", "\t")):
            continue
        for t in m.group(1).split():
            if "%" not in t and not t.startswith(".") and t not in out:
                out.append(t)
    return out


def scripts():
    out = []
    for top in ("tools", "scripts", "tests"):
        for dp, dn, fn in os.walk(os.path.join(ROOT, top)):
            dn[:] = [d for d in dn if d not in ("node_modules", "__pycache__")]
            for f in sorted(fn):
                if f.endswith(EXTS):
                    out.append(os.path.relpath(os.path.join(dp, f), ROOT))
    return sorted(out)


def command(entry):
    if entry.startswith("make "):
        return ["make", "--no-print-directory", entry[5:]]
    if entry.endswith(".py"):
        return [sys.executable, entry]
    if entry.endswith(".sh"):
        return ["bash", entry]
    if entry.endswith(".ps1"):
        return ["pwsh", "-NoProfile", "-File", entry]
    return ["node", entry]


def run(entry, env_extra, trace):
    env = dict(os.environ); env.update(env_extra); env["PYTHONDONTWRITEBYTECODE"] = "1"
    cmd = command(entry)
    if trace:
        cmd = ["strace", "-f", "-qq", "-o", trace, "-e", "trace=execve,openat,open,creat,connect,unlink,unlinkat,rename,renameat,renameat2,mkdir,mkdirat"] + cmd
    try:
        r = subprocess.run(cmd, cwd=ROOT, env=env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)
        return r.returncode, r.stdout + r.stderr
    except subprocess.TimeoutExpired as e:
        return 124, "TIMEOUT after 60 s: it did not refuse"


def touched(trace):
    """What the traced run did that a refused entry point must not do."""
    bad = []
    for line in open(trace, errors="replace"):
        if " = -1 " in line and "execve" not in line:
            continue
        m = re.search(r'execve\("([^"]+)"', line)
        if m:
            if " = -1 " in line:
                continue
            name = os.path.basename(m.group(1))
            if name not in ALLOWED_EXEC and not re.match(r"python3(\.\d+)?$", name):
                bad.append("started %s" % name)
            continue
        m = re.search(r'(?:openat|open|creat)\((?:AT_FDCWD, )?"([^"]+)"(?:, ([A-Z_|0-9a-fx]+))?', line)
        if m:
            path, flags = m.group(1), m.group(2) or ""
            if re.match(r"/dev/(snd|midi|ttyACM|ttyUSB|hidraw|bus/usb)", path) or path.startswith("/proc/asound"):
                bad.append("opened %s" % path)
            elif ("O_WRONLY" in flags or "O_RDWR" in flags or "O_CREAT" in flags or "creat(" in line) and path not in ("/dev/null", "/dev/tty", "/dev/stderr", "/dev/stdout"):
                bad.append("opened %s for writing" % path)
            continue
        if "connect(" in line and ("AF_INET" in line):
            bad.append("made a network connection")
        elif re.match(r"\d+\s+(unlink|unlinkat|rename|renameat|renameat2|mkdir|mkdirat)\(", line):
            bad.append("changed the file system: %s" % line.split("(")[0].split()[-1])
    return sorted(set(bad))


def tree_state():
    out = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, stdout=subprocess.PIPE, text=True).stdout
    sizes = []
    for dp, dn, fn in os.walk(os.path.join(ROOT, "build")):
        for f in fn:
            p = os.path.join(dp, f)
            try:
                st = os.stat(p); sizes.append((p, st.st_size, int(st.st_mtime)))
            except OSError:
                pass
    return out, sorted(sizes)


def table(targets, files):
    """docs/OC-GUARD-TABLE.md: every entry point with the file and line where the guard is called."""
    mk = open(os.path.join(ROOT, "Makefile")).read().split("\n")
    parse = next(i + 1 for i, l in enumerate(mk) if l.startswith("OC_GUARD_RC := $(shell scripts/oc_guard.sh"))
    nice = next(i + 1 for i, l in enumerate(mk) if l.startswith("NICE") and "oc_nice.sh" in l)
    timed = next(i + 1 for i, l in enumerate(open(os.path.join(ROOT, "tools/linux/timed.sh")).read().split("\n")) if "OC-GUARD" in l)
    out = ["# The Orange Cat soak guard: every entry point and where it calls the guard", "",
           "Written by `python3 -I tests/linux/oc-guard-test.py --table` (make test-oc-guard checks that it is current). The rule:",
           "docs/DEV_CHECKS.md. %d Makefile targets, %d scripts." % (len(targets), len(files)), "",
           "## Makefile targets", "",
           "Every target, present and future: `Makefile:%d` asks the guard when make READS the Makefile, before any target" % parse,
           "(and again in every sub-make). Inside a recipe: `tools/linux/timed.sh:%d` (the `$(T)` in front of the commands) and" % timed,
           "`Makefile:%d` (`$(NICE)` = scripts/oc_nice.sh, in front of compilers and builders) ask before each command." % nice, "",
           "| Target | Guard |", "| --- | --- |"]
    for t in targets:
        out.append("| `%s` | Makefile:%d |" % (t, parse))
    out += ["", "## Scripts", "", "| Script | Guard called at | Asked again |", "| --- | --- | --- |"]
    for f in files:
        lines = open(os.path.join(ROOT, f), errors="replace").read().split("\n")
        if f in GUARD_FILES:
            out.append("| `%s` | the guard itself | |" % f); continue
        if f == USER_HOOK:
            out.append("| `%s` | the user-level hook, for Classic Tabby's commands only: it must run during a soak, to say no (it uses the flag test of scripts/oc_hook.py) | |" % f); continue
        if f == HOOK:
            out.append("| `%s` | the hook: it must run during a soak, to say no (it reads the flag at its line %d) | |" % (f, next(i + 1 for i, l in enumerate(lines) if l.startswith("def blocked")))); continue
        first = next((i + 1 for i, l in enumerate(lines) if "OC-GUARD" in l or (f == "scripts/oc_nice.sh" and "oc_guard.sh" in l)), None)
        more = [i + 1 for i, l in enumerate(lines) if i + 1 != first and re.search(r"oc_guard\.(recheck|blocked|check)\(|ocRecheck\(|oc_stage \"|_oc_check\(\"", l) and not l.lstrip().startswith(("#", "//", "def ", '"""'))]
        out.append("| `%s` | %s | %s |" % (f, ("%s:%d" % (f, first)) if first else "NOT GUARDED", ", ".join(str(n) for n in more) or ""))
    return "\n".join(out) + "\n"


def main():
    targets = ["make " + t for t in make_targets()]
    files = scripts()
    entries = targets + [f for f in files if f not in GUARD_FILES and f not in (HOOK, USER_HOOK)]
    if "--list" in sys.argv:
        print("\n".join(entries)); return 0
    if "--table" in sys.argv:
        open(os.path.join(ROOT, "docs/OC-GUARD-TABLE.md"), "w").write(table(targets, files)); print("docs/OC-GUARD-TABLE.md written"); return 0
    have_pwsh = shutil.which("pwsh") is not None
    have_strace = shutil.which("strace") is not None
    check(have_strace, "strace is there: what a refused entry point touches can be seen")
    print("found %d Makefile targets and %d scripts under tools/, scripts/ and tests/ (%d entry points to run; the guard's own %d files and the hook are tested apart)" % (
        len(targets), len(files), len(entries), len(GUARD_FILES)), flush=True)
    tmp = tempfile.mkdtemp(prefix="oc-guard-test-")
    flag = os.path.join(tmp, "oc-soak-running")
    before = tree_state()
    try:
        # ---- 2. the flag exists: every entry point refuses and touches nothing ----
        open(flag, "w").close()
        print("\n== with the flag %s ==" % flag, flush=True)
        refused = 0
        for e in entries:
            row = {"entry": e}
            if e.endswith(".ps1") and not have_pwsh:
                text = open(os.path.join(ROOT, e), errors="replace").read()
                ok = "OC-GUARD" in text and "/tmp/oc-soak-running" in text and "Refusing to start" in text
                row["refused"] = "its guard line is there (no pwsh on this computer: it cannot be run here)"
                check(ok, "%-46s cannot run here (no pwsh); its guard line is there" % e)
                rows.append(row); refused += ok; continue
            trace = os.path.join(tmp, "trace")
            code, out = run(e, {"OC_GUARD_TEST_FLAG": flag}, trace if have_strace else None)
            said = re.search(r"Orange Cat soak running \(%s\)\. Refusing to start ([^\n]*)\." % re.escape(flag), out)
            did = touched(trace) if have_strace and os.path.exists(trace) else []
            ok = code != 0 and bool(said) and not did
            row["refused"] = "exit %d, \"Refusing to start %s.\"" % (code, said.group(1) if said else "?")
            check(ok, "%-46s refused: exit %d, \"%s\"; touched nothing" % (e, code, ("Refusing to start " + said.group(1) + ".") if said else "NO MESSAGE"),
                  "; ".join(did[:4]) or out.strip()[-160:])
            rows.append(row); refused += ok
        # the guard's own files, run directly
        for g, cmd in (("scripts/oc_guard.sh", ["bash", "scripts/oc_guard.sh", "a probe"]), ("scripts/oc_guard.py", [sys.executable, "-c", "import sys; sys.path.insert(0, 'scripts'); sys.argv[0] = 'a probe'; import oc_guard; oc_guard.check()"]),
                       ("scripts/oc_guard.cjs", ["node", "scripts/oc_guard.cjs"]), ("scripts/oc_guard.mjs", ["node", "scripts/oc_guard.mjs"])):
            env = dict(os.environ); env["OC_GUARD_TEST_FLAG"] = flag; env["PYTHONDONTWRITEBYTECODE"] = "1"
            r = subprocess.run(cmd, cwd=ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            check(r.returncode == 75 and "Orange Cat soak running (%s). Refusing to start" % flag in r.stderr, "%-46s the guard itself: exit 75 and the message" % g, r.stderr.strip()[-120:])
        # ---- 4. the long runs: the flag appears in the middle ----
        sys.path.insert(0, os.path.join(ROOT, "tools/linux/hw"))
        os.environ["OC_GUARD_TEST_FLAG"] = flag
        import importlib.util
        os.remove(flag)
        spec = importlib.util.spec_from_file_location("rcv", os.path.join(ROOT, "tools/linux/hw/rc-validate.py")); rcv = importlib.util.module_from_spec(spec); spec.loader.exec_module(rcv)
        try:
            import tabby_link as T          # loaded while no flag exists: loading it is itself an entry (it would refuse)
        except ImportError as e:
            T = None; check(False, "tabby_link could be loaded for the port test", repr(e))
        log = os.path.join(tmp, "log")
        c0, o0 = rcv.sh(["true"], 10, log)
        open(flag, "w").close()
        try:
            rcv.sh(["true"], 10, log); stopped = False
        except oc_guard.Interrupted as e:
            stopped = "Refusing to start" in str(e)
        check(c0 == 0 and stopped, "rc-validate.py: a command before the flag runs; with the flag its NEXT command is not started (Interrupted: the run is recorded as interrupted)")
        if T is not None:
            got = []
            for name, opener in (("the SMK-37 port", lambda: T.Link()), ("the H4MIDI port", lambda: T.Monitor("H4MIDI-WC Port 1"))):
                try:
                    opener(); got.append("%s was OPENED" % name)
                except oc_guard.Interrupted:
                    pass
            check(not got, "tabby_link: with the flag neither the SMK-37 port nor the H4MIDI port is opened", "; ".join(got))
        # ---- 5. the hook ----
        samples = [("make suite DISPLAY_VERSION=tabby-v1.5", True), ("/usr/bin/google-chrome --headless=new --print-to-pdf=a.pdf b.html", True),
                   ("node tools/linux/hw/workbench.mjs backup --url U --file f", True), ("amidi -l", True),
                   ("~/fm1-hw/hwvenv/bin/python3 -c \"import tabby_link as T; T.Link()\"", True), ("git push -q origin HEAD", True),
                   ("sed -n 1,5p Makefile", False), ("git status --short", False)]
        def hook(cmd):
            env = dict(os.environ); env["OC_GUARD_TEST_FLAG"] = flag
            r = subprocess.run([sys.executable, HOOK], cwd=ROOT, env=env, input=json.dumps({"tool_name": "Bash", "tool_input": {"command": cmd}}), stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            return r.returncode, r.stderr.strip()
        for cmd, must in samples:
            code, err = hook(cmd)
            check((code == 2 and "Orange Cat soak running" in err) if must else code == 0, "hook, flag present: %-7s %s" % ("BLOCKED" if code == 2 else "allowed", cmd), err[-100:])
        # ---- 5b. the user-level hook (scripts/oc_hook_user.py): every session on this computer loads it, Orange Cat's too.
        # With the flag it must block every command of ours and NOT ONE of Orange Cat's.
        R = ROOT
        def user_hook(cmd, cwd):
            env = dict(os.environ); env["OC_GUARD_TEST_FLAG"] = flag
            r = subprocess.run([sys.executable, USER_HOOK], cwd=ROOT, env=env, input=json.dumps({"tool_name": "Bash", "cwd": cwd, "tool_input": {"command": cmd}}), stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            return r.returncode, r.stderr.strip()
        ours = [('cd "%s" && make suite DISPLAY_VERSION=tabby-v1.5' % R, "/home/userzero"), ("make test-fast", R),
                ('cd "%s"; node tools/linux/hw/workbench.mjs backup --url U --file f' % R, "/home/userzero"),
                ('cd "%s"; ~/fm1-hw/hwvenv/bin/python3 - <<\'EOF\'\nimport sys\nsys.path.insert(0, "tools/linux/hw"); import tabby_link as T\nl = T.Link()\nEOF' % R, "/home/userzero"),
                ('~/fm1-hw/hwvenv/bin/python3 -c "import sys; sys.path.insert(0, \'x\'); import tabby_link as T; T.Link()"', "/home/userzero"),
                ('amidi -p "SMK37" -S "F0 7D 00 F7"', "/home/userzero"), ("gh release edit tabby-v1.4 -R SeattleUser0/classic-tabby --notes-file x", "/home/userzero"),
                ('cd "%s" && git push -q origin HEAD:classic-tabby/record' % R, "/home/userzero"), ('cd "%s" && tools/linux/release-flow.sh tabby-v1.5 1 ../overnight/v16' % R, "/home/userzero"),
                ('/usr/bin/google-chrome --headless=new --print-to-pdf=a.pdf "file://%s/build/guide.html"' % R, "/home/userzero"), ("python3 -I tools/linux/publish-pages.py --push", R),
                ("cd ~/Documents/Classic\\ Tabby/firmware && make suite", "/home/userzero")]
        for cmd, cwd in ours:
            code, err = user_hook(cmd, cwd)
            check(code == 2 and "Orange Cat soak running" in err, "user hook, flag present: BLOCKED (ours) %s" % cmd.replace("\n", " \\n ")[:110], "exit %d %s" % (code, err[-80:]))
        for cmd, cwd in (('cd "%s"; sed -n 1,5p Makefile; git status --short' % R, "/home/userzero"), ('grep -n tabby_link "%s/tools/linux/hw/run-stop.py"' % R, "/home/userzero")):
            code, err = user_hook(cmd, cwd)
            check(code == 0, "user hook, flag present: allowed (reading a file of ours) %s" % cmd[:90], err[-80:])
        # Orange Cat's own commands: real ones, from its sessions and the shell history of this computer (the file beside this
        # test), and the commands of its scripts; from the home directory and from inside its repository
        theirs = json.load(open(os.path.join(ROOT, "tests/linux/oc-guard-orange-cat-samples.json")))
        theirs += ["cd ~/OrangeCat && ./build.sh", "cd ~/oc-dev-tools && tools/ci_gate.sh", "cd ~/oc-dev-tools && tools/lint.sh", "cd ~/OrangeCat && tools/flash.sh build/orangecat.fw",
                   "amidi -l", 'amidi -p hw:2,0,0 -S "F0 7E 7F 06 01 F7" -d -t 1', "make -C ~/oc-dev-tools/tests", "node ~/oc-web-r7/web/test_web.mjs",
                   "google-chrome --headless=new --dump-dom file:///home/userzero/oc-web-r7/web/editor.html", "~/fm1-hw/hwvenv/bin/python3 ~/fm1-hw/r22/probe.py boot",
                   "cd ~/oc-int-suite && ~/fm1-hw/r23/suite-int.sh", "python3 tools/ci_step.py build", "gh run view 44588839353 -R SeattleUser0/OrangeCat", "cd ~/OrangeCat && git push origin linux-hw",
                   "make", "node test.mjs", "python3 -m pytest", 'journalctl -k | grep -iE "SMK37|Product:"; amidi -l']
        hit = []
        sys.path.insert(0, os.path.join(ROOT, "scripts"))
        import oc_hook, oc_hook_user
        for cmd in theirs:
            for cwd in ("/home/userzero", "/home/userzero/OrangeCat", "/home/userzero/oc-dev-tools"):
                why = oc_hook_user.ours(cmd, cwd)
                if why and (oc_hook.reason(cmd) or why == "the SMK-37's MIDI port"):
                    hit.append(cmd[:100])
        codes = [user_hook(cmd, "/home/userzero")[0] for cmd in theirs[:12] + theirs[-18:]]      # and 30 of them through the hook as a process
        check(not hit and all(c == 0 for c in codes), "user hook, flag present: allowed: every one of %d Orange Cat commands, from 3 directories (%d real ones from its sessions and this computer's shell history, %d of its scripts and generic make / node / python / amidi / Chrome)" % (
            len(theirs), len(theirs) - 18, 18), "; ".join(hit[:3]))
        st = json.load(open(os.path.join(ROOT, ".claude/settings.json")))
        wired = any(h.get("matcher") == "Bash" and any("oc_hook.py" in x.get("command", "") for x in h.get("hooks", [])) for h in st.get("hooks", {}).get("PreToolUse", []))
        check(wired, ".claude/settings.json: the hook is wired as PreToolUse for Bash")
        # ---- 3. the flag is gone: every entry point gets past the guard ----
        os.remove(flag); del os.environ["OC_GUARD_TEST_FLAG"]
        print("\n== the flag removed ==", flush=True)
        passed = 0
        for e, row in zip(entries, rows):
            if e.endswith(".ps1") and not have_pwsh:
                row["passed"] = "not run (no pwsh)"; passed += 1; continue
            code, out = run(e, {"OC_GUARD_TEST_STOP": "1"}, None)
            said = re.search(r"oc-guard: passed ([^\n]*)", out)
            ok = bool(said) and "Refusing to start" not in out
            row["passed"] = "past the guard" if ok else "NOT PAST"
            check(ok, "%-46s past the guard: \"%s\"" % (e, said.group(0) if said else "NO LINE"), out.strip()[-160:])
            passed += ok
        for cmd, must in samples[:2]:
            code, err = hook(cmd)
            check(code == 0, "hook, flag gone:    allowed %s" % cmd, err[-100:])
        for cmd, cwd in ours[:3]:
            code, err = user_hook(cmd, cwd)
            check(code == 0, "user hook, flag gone: allowed %s" % cmd[:90], err[-100:])
        try:
            current = open(os.path.join(ROOT, "docs/OC-GUARD-TABLE.md")).read() == table(targets, files)
        except OSError:
            current = False
        check(current, "docs/OC-GUARD-TABLE.md lists every entry point with the line of its guard call, as they are now (python3 -I tests/linux/oc-guard-test.py --table writes it)")
        after = tree_state()
        check(before[0] == after[0] and before[1] == after[1], "nothing in the tree or under build/ was changed by the %d refused and %d passed runs" % (refused, passed))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print("\n%s oc-guard: %d entry points found (%d Makefile targets, %d scripts); %d check(s) failed" % ("PASS" if not failed else "FAIL", len(entries), len(targets), len(entries) - len(targets), len(failed)))
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
