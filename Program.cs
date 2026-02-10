using Microsoft.EntityFrameworkCore;
using inta.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. تنظیمات دیتابیس
var connectionString = builder.Configuration.GetConnectionString("WedApplication2ConnectionStrings") ??
                       builder.Configuration.GetConnectionString("DefaultConnection") ??
                       "Server=.;Database=bime;Trusted_Connection=True;TrustServerCertificate=True;";

Console.WriteLine($"📌 Using connection string: {connectionString}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. سرویس‌های دیگر
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

// 3. ساخت برنامه
var app = builder.Build();

// 4. میدلورها و تنظیمات خطا
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // نمایش خطاهای دقیق
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/error");
}

// 5. تست اتصال دیتابیس
try
{
    Console.WriteLine("🔍 Testing database connection...");
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (db.Database.CanConnect())
        {
            Console.WriteLine("✅ Database connected successfully!");

            // چک کردن جداول
            var canCreate = db.Database.EnsureCreated();
            Console.WriteLine($"📊 Database tables ensured: {canCreate}");
        }
        else
        {
            Console.WriteLine("⚠️ Cannot connect to database. Creating new database...");
            db.Database.EnsureCreated();
            Console.WriteLine("✅ New database created!");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ DATABASE ERROR: {ex.Message}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"📌 Inner Exception: {ex.InnerException.Message}");
    }
}

// 6. میدلورهای نهایی
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// 7. پیام راه‌اندازی
Console.WriteLine("🚀 Application starting...");
Console.WriteLine($"🌐 Swagger UI: {app.Urls.FirstOrDefault()}/swagger");
Console.WriteLine($"📊 Database: bime");

// 8. اجرا
app.Run();