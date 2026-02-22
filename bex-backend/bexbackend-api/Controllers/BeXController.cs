using bexbackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Security.Claims;
using System.Text;

namespace bexbackend.Controllers
{
    [Authorize]
    [Route("api/berichtsheft")]
    [ApiController]
    public class BeXController : ControllerBase
    {
        private readonly AppDbContext _DbContext;
        private readonly PasswordHasher<string> _Hasher = new();
        private readonly AuthManager _AuthManager;
        private readonly IConfiguration _Config;

        public BeXController(AppDbContext context, AuthManager authmanager, IConfiguration config)
        {
            _DbContext = context;
            _AuthManager = authmanager;
            _Config = config;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        [Consumes("application/json")]
        public ActionResult Login([FromBody] LoginRequest model)
        {
            try
            {
                var user = _DbContext.User.FirstOrDefault(x => x.Username == model.Username);

                if (user == null)
                {
                    // User not found — return 401 immediately
                    return Unauthorized("Invalid credentials");
                }

                // Verify password
                var verification = _Hasher.VerifyHashedPassword(model.Username, user.Password, model.Password);

                if (verification == PasswordVerificationResult.Failed)
                {
                    return Unauthorized("Invalid credentials");
                }

                // Optional: rehash password if needed
                if (verification == PasswordVerificationResult.SuccessRehashNeeded)
                {
                    user.Password = _Hasher.HashPassword(model.Username, model.Password);
                    _DbContext.SaveChanges();
                }

                var token = _AuthManager.GenerateToken(user);
                int.TryParse(_Config["JWT_EXPIRE_HOURS"], out int expireHours);

                return Ok(new
                {
                    token = token,
                    expiresIn = expireHours > 0 ? expireHours : 1
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, "Server error");
            }
        }

        [AllowAnonymous]
        [HttpPost("register")]
        [Consumes("application/json")]
        public IActionResult Register([FromBody] LoginRequest model)
        {
            if (model == null || string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
                return BadRequest("Username and password are required.");

            if (_DbContext.User.Any(x => x.Username == model.Username))
                return BadRequest("User already exists");

            var user = new User
            {
                Username = model.Username,
                Password = _Hasher.HashPassword(model.Username, model.Password),
                Roles = "DefaultClaim"
            };

            _DbContext.User.Add(user);
            _DbContext.SaveChanges();

            return Ok("Registered successfully");
        }

        [Authorize(AuthenticationSchemes = "Bearer")]
        [HttpPost("saveFile")]
        public async Task<IActionResult> SaveFile([FromBody] Wochenbericht wochenBericht)
        {
            if (wochenBericht == null)
                return BadRequest("No data received.");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.Identity?.Name;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(username))
                return Unauthorized("User identity not found in token.");

            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Invalid user id in token.");

            string uploadsFolder = _Config["UPLOAD_FOLDER"] ?? "/app/uploads";
            Directory.CreateDirectory(uploadsFolder);

            string fileName = $"user_{username}_week_{wochenBericht.KalenderWoche}_year_{wochenBericht.Jahr}.json";
            string filePath = Path.Combine(uploadsFolder, fileName);

            var existingBericht = await _DbContext.Bericht
                .FirstOrDefaultAsync(b => b.fileName == fileName && b.UserId == userId);

            if (existingBericht == null)
            {
                _DbContext.Bericht.Add(new Bericht
                {
                    fileName = fileName,
                    UserId = userId
                });
            }

            await _DbContext.SaveChangesAsync();
            var jsonBytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(wochenBericht));
            await System.IO.File.WriteAllBytesAsync(filePath, jsonBytes);

            return Ok("File saved successfully.");
        }

        [Authorize(AuthenticationSchemes = "Bearer")]
        [HttpGet("getFile")]
        public async Task<IActionResult> GetFile([FromQuery] string calendarWeek, [FromQuery] string year)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Invalid user id in token.");

            var bericht = await _DbContext.Bericht
                .FirstOrDefaultAsync(b => b.UserId == userId &&
                                          b.fileName.Contains($"week_{calendarWeek}_year_{year}"));

            if (bericht == null)
                return NotFound("No file found.");

            string uploadsFolder = _Config["UPLOAD_FOLDER"] ?? "/app/uploads";
            string filePath = Path.Combine(uploadsFolder, bericht.fileName);

            if (!System.IO.File.Exists(filePath))
                return NotFound("File missing on server.");

            string json = await System.IO.File.ReadAllTextAsync(filePath);
            var wochenbericht = JsonConvert.DeserializeObject<Wochenbericht>(json);

            return Ok(new ReportResponse
            {
                FileName = bericht.fileName,
                Content = wochenbericht
            });

        }

        [Authorize(AuthenticationSchemes = "Bearer")]
        [HttpGet("getUserReports")]
        public async Task<IActionResult> GetUserReports()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var reports = await _DbContext.Bericht
                .Where(b => b.UserId == userId)
                .Select(b => new
                {
                    b.Id,
                    b.fileName
                })
                .ToListAsync();

            return Ok(reports);
        }
    }
}
