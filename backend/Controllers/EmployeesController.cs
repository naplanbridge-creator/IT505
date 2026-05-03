using IT505.Api.Contracts;
using IT505.Api.Data;
using IT505.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IT505.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController(ApplicationDbContext dbContext) : ControllerBase
{
    private readonly ApplicationDbContext _dbContext = dbContext;

    [HttpGet]
    public async Task<ActionResult<List<EmployeeListItemDto>>> SearchAsync([FromQuery] string? name, [FromQuery] string? code, [FromQuery] DateOnly? date)
    {
        var query = _dbContext.Employees
            .AsNoTracking()
            .Include(item => item.Department)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
        {
            var normalizedName = name.Trim().ToUpperInvariant();
            query = query.Where(item => item.FullName.ToUpper().Contains(normalizedName));
        }

        if (!string.IsNullOrWhiteSpace(code))
        {
            var normalizedCode = code.Trim().ToUpperInvariant();
            query = query.Where(item => item.Code.ToUpper().Contains(normalizedCode));
        }

        if (date is not null)
        {
            query = query.Where(item => item.HireDate == date.Value);
        }

        var employees = await query
            .OrderBy(item => item.FullName)
            .Select(item => new EmployeeListItemDto
            {
                Id = item.Id,
                Code = item.Code,
                FullName = item.FullName,
                HireDate = item.HireDate,
                DepartmentId = item.DepartmentId,
                DepartmentCode = item.Department != null ? item.Department.Code : string.Empty,
                DepartmentName = item.Department != null ? item.Department.Name : string.Empty
            })
            .ToListAsync();

        return Ok(employees);
    }

    [HttpGet("{id:int}", Name = "GetEmployeeById")]
    public async Task<ActionResult<EmployeeListItemDto>> GetByIdAsync(int id)
    {
        var employee = await _dbContext.Employees
            .AsNoTracking()
            .Include(item => item.Department)
            .Where(item => item.Id == id)
            .Select(item => new EmployeeListItemDto
            {
                Id = item.Id,
                Code = item.Code,
                FullName = item.FullName,
                HireDate = item.HireDate,
                DepartmentId = item.DepartmentId,
                DepartmentCode = item.Department != null ? item.Department.Code : string.Empty,
                DepartmentName = item.Department != null ? item.Department.Name : string.Empty
            })
            .FirstOrDefaultAsync();

        return employee is null ? NotFound(new { message = "Employee was not found." }) : Ok(employee);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeListItemDto>> CreateAsync(EmployeeUpsertRequest request)
    {
        var validationError = ValidateRequest(request.Code, request.FullName, request.DepartmentId);
        if (validationError is not null)
        {
            return BadRequest(new { message = validationError });
        }

        var departmentExists = await _dbContext.Departments.AnyAsync(item => item.Id == request.DepartmentId);
        if (!departmentExists)
        {
            return BadRequest(new { message = "Selected department was not found." });
        }

        var code = request.Code.Trim().ToUpperInvariant();
        var fullName = request.FullName.Trim();

        var codeExists = await _dbContext.Employees.AnyAsync(item => item.Code == code);
        if (codeExists)
        {
            return Conflict(new { message = "Employee code already exists." });
        }

        var employee = new Employee
        {
            Code = code,
            FullName = fullName,
            HireDate = request.HireDate,
            DepartmentId = request.DepartmentId
        };

        _dbContext.Employees.Add(employee);
        await _dbContext.SaveChangesAsync();

        var dto = await BuildEmployeeDtoAsync(employee.Id);
        return CreatedAtRoute("GetEmployeeById", new { id = employee.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAsync(int id, EmployeeUpsertRequest request)
    {
        var validationError = ValidateRequest(request.Code, request.FullName, request.DepartmentId);
        if (validationError is not null)
        {
            return BadRequest(new { message = validationError });
        }

        var employee = await _dbContext.Employees.FirstOrDefaultAsync(item => item.Id == id);
        if (employee is null)
        {
            return NotFound(new { message = "Employee was not found." });
        }

        var departmentExists = await _dbContext.Departments.AnyAsync(item => item.Id == request.DepartmentId);
        if (!departmentExists)
        {
            return BadRequest(new { message = "Selected department was not found." });
        }

        var code = request.Code.Trim().ToUpperInvariant();
        var fullName = request.FullName.Trim();

        var codeExists = await _dbContext.Employees.AnyAsync(item => item.Id != id && item.Code == code);
        if (codeExists)
        {
            return Conflict(new { message = "Employee code already exists." });
        }

        employee.Code = code;
        employee.FullName = fullName;
        employee.HireDate = request.HireDate;
        employee.DepartmentId = request.DepartmentId;

        await _dbContext.SaveChangesAsync();
        return Ok(await BuildEmployeeDtoAsync(id));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        var employee = await _dbContext.Employees.FirstOrDefaultAsync(item => item.Id == id);
        if (employee is null)
        {
            return NotFound(new { message = "Employee was not found." });
        }

        _dbContext.Employees.Remove(employee);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    private async Task<EmployeeListItemDto> BuildEmployeeDtoAsync(int employeeId)
    {
        return await _dbContext.Employees
            .AsNoTracking()
            .Include(item => item.Department)
            .Where(item => item.Id == employeeId)
            .Select(item => new EmployeeListItemDto
            {
                Id = item.Id,
                Code = item.Code,
                FullName = item.FullName,
                HireDate = item.HireDate,
                DepartmentId = item.DepartmentId,
                DepartmentCode = item.Department != null ? item.Department.Code : string.Empty,
                DepartmentName = item.Department != null ? item.Department.Name : string.Empty
            })
            .SingleAsync();
    }

    private static string? ValidateRequest(string code, string fullName, int departmentId)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(fullName) || departmentId <= 0)
        {
            return "Employee code, full name, and department are required.";
        }

        return null;
    }
}