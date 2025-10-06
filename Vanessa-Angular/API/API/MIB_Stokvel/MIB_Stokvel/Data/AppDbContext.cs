using MIB_Stokvel.Models;
using Microsoft.EntityFrameworkCore;
namespace MIB_Stokvel.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Document> Document { get; set; } = default!;
        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Name).IsRequired().HasMaxLength(100);
                e.Property(x => x.Surname).IsRequired().HasMaxLength(100);
                e.Property(x => x.IdOrPassportNumber).IsRequired().HasMaxLength(32);
                e.HasIndex(x => x.IdOrPassportNumber).IsUnique();
                e.Property(x => x.Email).HasMaxLength(200);
                e.Property(x => x.PasswordHash).IsRequired();
                e.Property(x => x.PasswordSalt).IsRequired();
                e.Property(x => x.PasswordIterations).HasDefaultValue(100000);
            });
        }
    }
}
    

