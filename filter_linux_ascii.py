import sys
for c in open(sys.argv[1],'rb').read():
    if (c >= 20 and c <= 126) or c == 10:
        sys.stdout.write(chr(c))
