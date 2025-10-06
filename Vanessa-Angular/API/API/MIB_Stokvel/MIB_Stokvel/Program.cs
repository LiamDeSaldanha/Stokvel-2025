
using Microsoft.EntityFrameworkCore;
using MIB_Stokvel.Data;
using MIB_Stokvel.Services;

namespace MIB_Stokvel
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            

            //Connection String
            builder.Services.AddDbContext<AppDbContext>(opts =>
                opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Services
            builder.Services.AddScoped<ISecurePasswordHasher, SecurePasswordHasher>();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // CORS for Angular
            builder.Services.AddCors(o =>
            {
                o.AddPolicy("ng", policy =>
                    policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:4200"));
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("ng");

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
