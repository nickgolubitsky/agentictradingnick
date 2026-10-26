"""Download and cache every round-1 series. Re-running uses the cache; --refresh re-downloads."""

import os
import sys
import time

from . import data
from .universe import ETFS, STOCKS


def main(argv=None):
    refresh = "--refresh" in (argv or sys.argv[1:])
    jobs = [(s, "daily") for s in STOCKS + ETFS] + [(s, "intraday") for s in STOCKS]
    failed = []
    for i, (sym, kind) in enumerate(jobs, 1):
        cached = not refresh and os.path.exists(data.cache_path(sym, kind))
        try:
            data.fetch(sym, kind, refresh)
        except data.FetchError as e:
            failed.append((sym, kind, str(e)))
        if not cached:
            time.sleep(0.4)
        if i % 25 == 0:
            print("%d/%d" % (i, len(jobs)), flush=True)
    print("Fetched %d of %d series." % (len(jobs) - len(failed), len(jobs)))
    for f in failed:
        print("  FAILED %s %s: %s" % f)


if __name__ == "__main__":
    main()
