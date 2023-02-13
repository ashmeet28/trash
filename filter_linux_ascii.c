#include <stdio.h>

int main(int argc, char *argv[])
{
    FILE *f = fopen(argv[1], "rb");
    char c;
    while(fread(&c, 1, 1, f) != 0)
    {
        if (((c >= 20) && (c <= 126)) || (c == 10))
        {
            fwrite(&c, 1, 1, stdout);
        }
    }
    fclose(f);
}
