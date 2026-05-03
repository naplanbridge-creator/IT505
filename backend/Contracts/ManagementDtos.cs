namespace IT505.Api.Contracts;

public sealed record DepartmentListItemDto
{
    public int Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public DateOnly EstablishedDate { get; init; }
    public int EmployeeCount { get; init; }
}

public sealed record DepartmentUpsertRequest
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public DateOnly EstablishedDate { get; init; }
}

public sealed record EmployeeListItemDto
{
    public int Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public DateOnly HireDate { get; init; }
    public int DepartmentId { get; init; }
    public string DepartmentCode { get; init; } = string.Empty;
    public string DepartmentName { get; init; } = string.Empty;
}

public sealed record EmployeeUpsertRequest
{
    public string Code { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public DateOnly HireDate { get; init; }
    public int DepartmentId { get; init; }
}