namespace MIB_Stokvel.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Name { get; set; } = default!;
        public string Surname { get; set; } = default!;

        
        public string IdOrPassportNumber { get; set; } = default!;

        public string? Email { get; set; }

        public string PasswordHash { get; set; } = default!;
        public string PasswordSalt { get; set; } = default!;
        public int PasswordIterations { get; set; } = 100000; 

      
        public DateTime CreatedAtUtc { get; set; } = DateTime.Now;

        // Add navigation property for documents (one-to-many relationship)
        public List<Document> Documents { get; set; } = new List<Document>(); 
    }
}
