using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using bexbackend.Models;

namespace bexbackend
{
    public class AuthManager
    {
        private readonly string _jwtKey;
        private readonly int _expireHours;

        public AuthManager(IConfiguration config)
        {
            _jwtKey = config["JWT_KEY"] 
                ?? throw new InvalidOperationException("JWT_KEY is not configured.");
            
            _expireHours = int.TryParse(config["JWT_EXPIRE_HOURS"], out var h) ? h : 1;
        }

        public string GenerateToken(User user)
        {
            var handler = new JwtSecurityTokenHandler();
            var keyBytes = Encoding.UTF8.GetBytes(_jwtKey);

            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(keyBytes),
                SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = GenerateClaimsIdentity(user),
                Expires = DateTime.UtcNow.AddHours(_expireHours),
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

            foreach (var role in user.Roles.Split(','))
                claims.AddClaim(new Claim(ClaimTypes.Role, role));

            return claims;
        }
    }
}
