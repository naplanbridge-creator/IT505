using IT505.Api.Contracts;
using IT505.Api.Data;
using IT505.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IT505.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController(ApplicationDbContext dbContext) : ControllerBase
{
    private readonly ApplicationDbContext _dbContext = dbContext;

    [HttpGet]
    public async Task<ActionResult<List<DepartmentListItemDto>>> GetAllAsync()
    {
        var departments = await _dbContext.Departments
            .AsNoTracking()
            .Include(item => item.Employees)
            .OrderBy(item => item.Name)
            .Select(item => new DepartmentListItemDto
            {
                Id = item.Id,
                Code = item.Code,
                Name = item.Name,
                EstablishedDate = item.EstablishedDate,
                EmployeeCount = item.Employees.Count
            })
            .ToListAsync();

        return Ok(departments);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DepartmentListItemDto>> GetByIdAsync(int id)
    {
        var department = await _dbContext.Departments
            .AsNoTracking()
            .Include(item => item.Employees)
            .Where(item => item.Id == id)
            .Select(item => new DepartmentListItemDto
            {
                Id = item.Id,
                Code = item.Code,
                Name = item.Name,
                EstablishedDate = item.EstablishedDate,
                EmployeeCount = item.Employees.Count
            })
            .FirstOrDefaultAsync();

        return department is null ? NotFound(new { message = "Department was not found." }) : Ok(department);
    }

    [HttpPost]
    public async Task<ActionResult<DepartmentListItemDto>> CreateAsync(DepartmentUpsertRequest request)
    {
        var validationError = ValidateRequest(request.Code, request.Name);
        if (validationError is not null)
        {
            return BadRequest(new { message = validationError });
        }

        var code = request.Code.Trim().ToUpperInvariant();
        var name = request.Name.Trim();

        var codeExists = await _dbContext.Departments.AnyAsync(item => item.Code == code);
        if (codeExists)
        {
            return Conflict(new { message = "Department code already exists." });
        }

        var department = new Department
        {
            Code = code,
            Name = name,
            EstablishedDate = request.EstablishedDate
        };

        _dbContext.Departments.Add(department);
        await _dbContext.SaveChangesAsync();

        var dto = await BuildDepartmentDtoAsync(department.Id);
        return Created($"/api/departments/{department.Id}", dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAsync(int id, DepartmentUpsertRequest request)
    {
        var validationError = ValidateRequest(request.Code, request.Name);
        if (validationError is not null)
        {
            return BadRequest(new { message = validationError });
        }

        var department = await _dbContext.Departments.FirstOrDefaultAsync(item => item.Id == id);
        if (department is null)
        {
            return NotFound(new { message = "Department was not found." });
        }

        var code = request.Code.Trim().ToUpperInvariant();
        var name = request.Name.Trim();

        var codeExists = await _dbContext.Departments.AnyAsync(item => item.Id != id && item.Code == code);
        if (codeExists)
        {
            return Conflict(new { message = "Department code already exists." });
        }

        department.Code = code;
        department.Name = name;
        department.EstablishedDate = request.EstablishedDate;

        await _dbContext.SaveChangesAsync();
        return Ok(await BuildDepartmentDtoAsync(id));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        var department = await _dbContext.Departments.FirstOrDefaultAsync(item => item.Id == id);
        if (department is null)
        {
            return NotFound(new { message = "Department was not found." });
        }

        var hasEmployees = await _dbContext.Employees.AnyAsync(item => item.DepartmentId == id);
        if (hasEmployees)
        {
            return Conflict(new { message = "Delete the employees in this department first." });
        }

        _dbContext.Departments.Remove(department);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    private async Task<DepartmentListItemDto> BuildDepartmentDtoAsync(int departmentId)
    {
        return await _dbContext.Departments
            .AsNoTracking()
            .Include(item => item.Employees)
            .Where(item => item.Id == departmentId)
            .Select(item => new DepartmentListItemDto
            {
                Id = item.Id,
                Code = item.Code,
                Name = item.Name,
                EstablishedDate = item.EstablishedDate,
                EmployeeCount = item.Employees.Count
            })
            .SingleAsync();
    }

    private static string? ValidateRequest(string code, string name)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(name))
        {
            return "Department code and name are required.";
        }

        return null;
    }
}