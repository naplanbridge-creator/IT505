using System.ComponentModel.DataAnnotations;

namespace IT505.Api.Models;

public class Employee
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    public DateOnly HireDate { get; set; }

    public int DepartmentId { get; set; }

    public Department? Department { get; set; }
}