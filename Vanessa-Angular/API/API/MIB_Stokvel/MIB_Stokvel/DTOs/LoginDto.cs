using System.ComponentModel.DataAnnotations;

namespace MIB_Stokvel.DTOs
{
    public class LoginDto
    {
        [Required, EmailAddress, MaxLength(200)]
        public string Email { get; set; } = default!;

        [Required, MinLength(8), MaxLength(100)]
        public string Password { get; set; } = default!;
    }

    public class LoginResultVm
    {
        public bool Success { get; set; }
        public string? Message { get; set; }

        public int? Id { get; set; }
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? Email { get; set; }
        public DateTime? CreatedAtUtc { get; set; }
    }
}

