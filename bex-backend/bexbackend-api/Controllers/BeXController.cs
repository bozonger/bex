using bexbackend.Models;

using bexbackend_API;
using bexbackend_API.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

using Newtonsoft.Json;

using System.Security.Claims;
using System.Text;

using Microsoft.EntityFrameworkCore;

namespace bexbackend.Controllers
{
    [Authorize]
    [Route("api/berichtsheft")]
    [ApiController]
    public class BeXController : ControllerBase
    {
        private AppDbContext _DbContext;
        PasswordHasher<string> _Hasher = new();
        private AuthManager _AuthManager;
        public CustomSettings _CustomSettings;
        private string _Env;

        public BeXController(AppDbContext context, AuthManager authmanager, CustomSettings customSettings)
        {
            _DbContext = context;
            _AuthManager = authmanager;
            _CustomSettings = customSettings;
            _Env = _CustomSettings.UploadFolderPath;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public ActionResult<string> Login([FromBody] LoginRequest model)
        {
            var user = _DbContext.User.FirstOrDefault(x => x.Username == model.Username);

            // If user is null, we still "verify" a fake hash to prevent timing attacks
            string hashToVerify = user?.Password ?? "placeholder_long_hash_string";
            var verification = _Hasher.VerifyHashedPassword(model.Username, hashToVerify, model.Password);

            if (user == null)
            {
                return Unauthorized("Invalid credentials");
            }

            if (verification == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.Password = _Hasher.HashPassword(model.Username, model.Password);
                _DbContext.SaveChanges();
            }

            if (verification != PasswordVerificationResult.Failed)
            {
                var token = _AuthManager.GenerateToken(user);
                return Ok(new { Token = token }); // Return as JSON object
            }

            return Unauthorized("Invalid credentials");
        }

        [Authorize(AuthenticationSchemes = "Bearer")]
        [HttpGet("test")]
        public IActionResult Test()
        {
            if (User.Identity.IsAuthenticated)
            {
                return Ok("Good");
            }

            return Unauthorized("Ne");
        }

        [AllowAnonymous]
        [Route("register")]
        [HttpPost]
        public IActionResult Register([FromForm] string password, [FromForm] string username)
        {
            if (_DbContext.User.Any(x => x.Username == username))
            {
                return BadRequest("User already exists");
            }

            string hashedPassword = _Hasher.HashPassword(username, password);

            User user = new User();

            user.Password = hashedPassword;
            user.Username = username;

            user.Roles = "DefaultClaim";

            _DbContext.User.Add(user);
            _DbContext.SaveChanges();

            return Ok("Registered successfully");
        }

        [Authorize(AuthenticationSchemes = "Bearer")]
        [Route("saveFile")]
        [HttpPost]
        public async Task<IActionResult> SaveFile([FromBody] Wochenbericht wochenBericht)
        {
            if (wochenBericht == null) return BadRequest("No data received.");

            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var username = User.Identity?.Name;

            if (userIdClaim == null || username == null)
            {
                return Unauthorized("User identity not found in token.");
            }

            int userId = int.Parse(userIdClaim);

            string jsonToSave = JsonConvert.SerializeObject(wochenBericht);
            byte[] fileBytes = Encoding.UTF8.GetBytes(jsonToSave);

            string uploadsFolder = Path.Combine(_Env, "uploads");
            Directory.CreateDirectory(uploadsFolder);

            string fileName = $"user_{username}_week_{wochenBericht.KalenderWoche}_year_{wochenBericht.Jahr}.json";
            string filePath = Path.Combine(uploadsFolder, fileName);

            var existingBericht = _DbContext.Bericht
                .FirstOrDefault(b => b.fileName == fileName && b.UserId == userId);

            if (existingBericht == null)
            {
                Bericht bericht = new Bericht()
                {
                    fileName = fileName,
                    UserId = userId
                };
                _DbContext.Bericht.Add(bericht);
            }

            await _DbContext.SaveChangesAsync();
            await System.IO.File.WriteAllBytesAsync(filePath, fileBytes);

            return Ok("File saved successfully.");
        }

        [Authorize(AuthenticationSchemes = "Bearer")]
        [Route("getFile")]
        [HttpPost]
        public async Task<IActionResult> GetFile([FromForm] string calenderWeek, [FromForm] string year)
        {
            var userId = User.FindFirst(ClaimTypes.Name).Value;
            if (userId == null)
            {
                return Unauthorized("No user found");
            }

            var relatedUser = _DbContext.User.FirstOrDefault(x => x.Username == userId);

            Bericht bericht = _DbContext.Bericht.FirstOrDefault(x => x.UserId == relatedUser.Id && x.fileName.Contains("week_" + calenderWeek + "_year_" + year));

            if (bericht == null)
            {
                return BadRequest("No file found with the given name");
            }

            string uploadsFolder = Path.Combine(_Env, "uploads");
            string berichtLocation = Path.Combine(uploadsFolder, bericht.fileName);
            string fileContent = await System.IO.File.ReadAllTextAsync(berichtLocation);

            return Ok(fileContent);
        }

        [Authorize(AuthenticationSchemes = "Bearer")]
        [HttpGet("getMyReports")]
        public async Task<IActionResult> GetMyReports()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim);

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