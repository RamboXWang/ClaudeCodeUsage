from duo.x import g_x


def g_y(n):
    return 0 if n <= 0 else g_x(n - 1)
