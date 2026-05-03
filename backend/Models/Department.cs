using System.ComponentModel.DataAnnotations;

namespace IT505.Api.Models;

public class Department
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public DateOnly EstablishedDate { get; set; }

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}