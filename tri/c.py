from tri.a import f_a


def f_c(n):
    return 0 if n <= 0 else f_a(n - 1)
