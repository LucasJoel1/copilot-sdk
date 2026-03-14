def gcd(a, b):
    x = a
    y = b
    while y != 0:
        r = x % y
        print(x, "\\bmod", y, " = ", r, "\\\\")
        x = y
        y = r
    print(f"\\gcd({a}, {b}) = {x}")


gcd(620, 140)

print(45 % 11 == 1)
