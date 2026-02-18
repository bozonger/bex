using bexbackend.Models;

using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace bexbackend_API
{
    public class AuthManager
    {
        public CustomSettings _CustomSettings;

        public AuthManager(CustomSettings customSettings)
        {
            _CustomSettings = customSettings;
        }

        public string GetPrivateKey()
        {
            string apiKey = Environment.GetEnvironmentVariable("JWT_PRIVATE_KEY");

            if (string.IsNullOrEmpty(apiKey))
            {
                if (!string.IsNullOrEmpty(_CustomSettings.PrivateKeyLocation) &&
                    File.Exists(_CustomSettings.PrivateKeyLocation))
                {
                    apiKey = File.ReadAllText(_CustomSettings.PrivateKeyLocation);
                }
            }

            if (string.IsNullOrEmpty(apiKey))
            {
                return "A_VERY_LONG_DEFAULT_UNSAFE_KEY_FOR_DEV_ONLY";
            }

            return apiKey;
        }

        public string GenerateToken(User user)
        {
            var handler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(GetPrivateKey());
            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = GenerateClaimsIdentity(user),
                Expires = DateTime.UtcNow.AddDays(30),
                SigningCredentials = credentials,
            };

            var token = handler.CreateToken(tokenDescriptor);
            return handler.WriteToken(token);
        }

        private static ClaimsIdentity GenerateClaimsIdentity(User user)
        {
            var claims = new ClaimsIdentity();

            claims.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));

            claims.AddClaim(new Claim(ClaimTypes.Name, user.Username));

            var roles = user.Roles.Split(',');
            foreach (var role in roles)
                claims.AddClaim(new Claim(ClaimTypes.Role, role));

            return claims;
        }
    }
}