using System.ComponentModel.DataAnnotations;
namespace MIB_Stokvel.DTOs
{
    public class RegisterUserDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = default!;

        [Required, MaxLength(100)]
        public string Surname { get; set; } = default!;

        [Required, MaxLength(32)]
        public string IdOrPassportNumber { get; set; } = default!;

        [EmailAddress, MaxLength(200)]
        public string? Email { get; set; }

        [Required, MinLength(8), MaxLength(100)]
        public string Password { get; set; } = default!;
    }

    public class RegisteredUserVm
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string Surname { get; set; } = default!;
        public string IdOrPassportNumber { get; set; } = default!;
        public string? Email { get; set; }
        public DateTime CreatedAtUtc { get; set; }
    }
}
    

