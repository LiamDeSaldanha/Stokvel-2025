using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
namespace MIB_Stokvel.Services
{
    public interface ISecurePasswordHasher
    {
        (string hash, string salt, int iterations) Hash(string password, int iterations = 100_000);
        bool Verify(string password, string hash, string salt, int iterations);
    }

    public class SecurePasswordHasher : ISecurePasswordHasher
    {
        public (string hash, string salt, int iterations) Hash(string password, int iterations = 100_000)
        {
            // 16-byte salt
            var saltBytes = RandomNumberGenerator.GetBytes(16);
            var hashBytes = KeyDerivation.Pbkdf2(
                password,
                saltBytes,
                KeyDerivationPrf.HMACSHA256,
                iterations,
                32
            );
            return (Convert.ToBase64String(hashBytes), Convert.ToBase64String(saltBytes), iterations);
        }

        public bool Verify(string password, string hash, string salt, int iterations)
        {
            var saltBytes = Convert.FromBase64String(salt);
            var computed = KeyDerivation.Pbkdf2(
                password,
                saltBytes,
                KeyDerivationPrf.HMACSHA256,
                iterations,
                32
            );
            return CryptographicOperations.FixedTimeEquals(
                Convert.FromBase64String(hash),
                computed
            );
        }
    }
}
