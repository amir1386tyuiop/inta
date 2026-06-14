using inta.Extensions;

var builder = WebApplication.CreateBuilder(args);

// 1. Register services
builder.Services.AddApplicationDatabase(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddApplicationSecurity(builder.Configuration);

// 2. Build application
var app = builder.Build();

// 3. Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

// 4. Initialize database (development only)
app.InitializeDatabase();

// 5. Final middleware
app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();

// 6. Startup info
StartupLogger.LogStartup("Application starting...");
StartupLogger.LogUrl($"Swagger UI: {app.Urls.FirstOrDefault()}/swagger");
StartupLogger.LogStats("Database: bime");

// 7. Run
app.Run();
