using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using inta.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. تنظیمات دیتابیس
var connectionString = builder.Configuration.GetConnectionString("WedApplication2ConnectionStrings") ??
                       builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException(
        "No database connection string configured. " +
        "Set 'ConnectionStrings:DefaultConnection' in appsettings.json or environment variables.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. سرویس‌های دیگر
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

// Authentication & Authorization
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

// CORS — restrict to known origins in production via "AllowedOrigins" config
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                     ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            // Development fallback — no origins allowed by default
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// 3. ساخت برنامه
var app = builder.Build();
var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

// 4. میدلورها و تنظیمات خطا
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

// 5. تست اتصال دیتابیس
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (db.Database.CanConnect())
    {
        logger.LogInformation("Database connected successfully");
        var created = db.Database.EnsureCreated();
        logger.LogInformation("Database tables ensured (created: {Created})", created);
    }
    else
    {
        logger.LogWarning("Cannot connect to database, attempting to create it");
        try
        {
            db.Database.EnsureCreated();
            logger.LogInformation("New database created");
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "Failed to create database — the application cannot start");
            throw;
        }
    }
}

// 6. میدلورهای نهایی
app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();

// 7. پیام راه‌اندازی
logger.LogInformation("Application starting");
logger.LogInformation("Swagger UI: {Url}/swagger", app.Urls.FirstOrDefault());

// 8. اجرا
app.Run();
