from tri.c import f_c


def f_b(n):
    return 0 if n <= 0 else f_c(n - 1)
