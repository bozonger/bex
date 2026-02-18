using bexbackend.Models;
using Microsoft.EntityFrameworkCore;

namespace bexbackend_API
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> User { get; set; }
        public DbSet<Bericht> Bericht { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Bericht>()
                .HasOne(b => b.User)
                .WithMany(u => u.Berichte)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
