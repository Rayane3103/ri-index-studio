import hashlib
import hmac
import os

# PBKDF2 = hash the password many times with a random "salt", so a stolen hash is very slow to crack.
ITERATIONS = 200_000


def hash_password(password):
    """'secret' -> 'salt_hex$hash_hex'"""
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS)
    return salt.hex() + "$" + digest.hex()


def check_password(password, stored):
    salt_hex, digest_hex = stored.split("$")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), ITERATIONS)
    return hmac.compare_digest(digest.hex(), digest_hex)  # compare_digest: same time for any input
