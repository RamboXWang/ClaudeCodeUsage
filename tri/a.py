from tri.b import f_b


def f_a(n):
    return 0 if n <= 0 else f_b(n - 1)
