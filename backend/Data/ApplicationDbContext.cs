using IT505.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace IT505.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Department> Departments => Set<Department>();

    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasIndex(item => item.Code).IsUnique();
            entity.Property(item => item.Code).HasMaxLength(20).IsRequired();
            entity.Property(item => item.Name).HasMaxLength(120).IsRequired();
            entity.HasMany(item => item.Employees)
                .WithOne(item => item.Department)
                .HasForeignKey(item => item.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasData(
                new Department { Id = 1, Code = "ADM", Name = "Administration", EstablishedDate = new DateOnly(2023, 1, 10) },
                new Department { Id = 2, Code = "OPS", Name = "Operations", EstablishedDate = new DateOnly(2023, 3, 15) },
                new Department { Id = 3, Code = "TRN", Name = "Training", EstablishedDate = new DateOnly(2024, 2, 1) }
            );
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasIndex(item => item.Code).IsUnique();
            entity.Property(item => item.Code).HasMaxLength(20).IsRequired();
            entity.Property(item => item.FullName).HasMaxLength(120).IsRequired();

            entity.HasData(
                new Employee { Id = 1, Code = "EMP-1001", FullName = "Amina Hassan", HireDate = new DateOnly(2024, 1, 12), DepartmentId = 1 },
                new Employee { Id = 2, Code = "EMP-1002", FullName = "Omar Khaled", HireDate = new DateOnly(2024, 4, 21), DepartmentId = 1 },
                new Employee { Id = 3, Code = "EMP-2001", FullName = "Sara Adel", HireDate = new DateOnly(2024, 3, 5), DepartmentId = 2 },
                new Employee { Id = 4, Code = "EMP-2002", FullName = "Mahmoud Nabil", HireDate = new DateOnly(2024, 5, 9), DepartmentId = 2 }
            );
        });
    }
}