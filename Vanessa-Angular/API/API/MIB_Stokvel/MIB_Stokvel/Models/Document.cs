using System.ComponentModel.DataAnnotations.Schema;

namespace MIB_Stokvel.Models
{
    [Table("Document")]
    public class Document
    {
        public int Id { get; set; }

        // Foreign key to User
        public int UserId { get; set; }
        public User User { get; set; } = default!;

        // Document details
        public string FileName { get; set; } = default!;
        public string FilePath { get; set; } = default!;  
        public string DocumentType { get; set; } = default!;  
        public DateTime UploadedAt { get; set; } = DateTime.Now;  
    }
}

