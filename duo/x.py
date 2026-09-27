from duo.y import g_y


def g_x(n):
    return 0 if n <= 0 else g_y(n - 1)
