using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using MIB_Stokvel.Models;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using MIB_Stokvel.Data;

namespace MIB_Stokvel.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class DocumentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DocumentController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/document/upload
        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument(int userId, IFormFile file, string documentType)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            // Save the file to a directory on the server (e.g., wwwroot/documents)
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "documents");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create a new document record
            var document = new Document
            {
                UserId = userId,
                FileName = file.FileName,
                FilePath = filePath,  // Save the path or URL (in production, this could be a cloud URL)
                DocumentType = documentType,
                UploadedAt = DateTime.UtcNow
            };

            _context.Document.Add(document);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Document uploaded successfully!" });
        }

        // GET: api/document/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Document>>> GetUserDocuments(int userId)
        {
            var documents = await _context.Document.Where(d => d.UserId == userId).ToListAsync();
            if (documents == null || !documents.Any())
                return NotFound("No documents found for this user.");

            return Ok(documents);
        }
    }
}