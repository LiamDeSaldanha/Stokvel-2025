using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MIB_Stokvel.Data;
using MIB_Stokvel.DTOs;
using MIB_Stokvel.Models;
using MIB_Stokvel.Services;

namespace MIB_Stokvel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
        public class AuthController : ControllerBase
        {
            private readonly AppDbContext _db;
            private readonly ISecurePasswordHasher _hasher;

            public AuthController(AppDbContext db, ISecurePasswordHasher hasher)
            {
                _db = db;
                _hasher = hasher;
            }

          //User Registers on the system
            [HttpPost("register")]
            public async Task<ActionResult<RegisteredUserVm>> Register(RegisterUserDto dto)
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                
                var exists = await _db.Users.AnyAsync(u => u.IdOrPassportNumber == dto.IdOrPassportNumber);
                if (exists) return Conflict(new { message = "ID/Passport number already registered." }); 

                var (hash, salt, iterations) = _hasher.Hash(dto.Password);

                var user = new User
                {
                    Name = dto.Name.Trim(),
                    Surname = dto.Surname.Trim(),
                    IdOrPassportNumber = dto.IdOrPassportNumber.Trim(),
                    Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim().ToLowerInvariant(),
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    PasswordIterations = iterations
                };

                _db.Users.Add(user);
                await _db.SaveChangesAsync();

                var vm = new RegisteredUserVm
                {
                    Id = user.Id,
                    Name = user.Name,
                    Surname = user.Surname,
                    IdOrPassportNumber = user.IdOrPassportNumber,
                    Email = user.Email,
                    CreatedAtUtc = user.CreatedAtUtc
                };

                return CreatedAtAction(nameof(Register), new { id = user.Id }, vm);
            }

        //Login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResultVm>> Login(LoginDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var email = dto.Email.Trim().ToLowerInvariant();

            // Require an email on the account to log in
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email != null && u.Email == email);
            if (user is null)
                return Unauthorized(new LoginResultVm { Success = false, Message = "Invalid email or password." });

            var ok = _hasher.Verify(dto.Password, user.PasswordHash, user.PasswordSalt, user.PasswordIterations);
            if (!ok)
                return Unauthorized(new LoginResultVm { Success = false, Message = "Invalid email or password." });

            return Ok(new LoginResultVm
            {
                Success = true,
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Email = user.Email,
                CreatedAtUtc = user.CreatedAtUtc
            });
        }
    }
}


