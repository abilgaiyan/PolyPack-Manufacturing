var builder = DistributedApplication.CreateBuilder(args);

// 1. Database Infrastructure (PostgreSQL Container)
var postgres = builder.AddPostgres("postgres")
    .WithImage("postgres", "16-alpine")
    .WithLifetime(ContainerLifetime.Session);

var authDb = postgres.AddDatabase("auth-db");
var productionDb = postgres.AddDatabase("production-db");
var inventoryDb = postgres.AddDatabase("inventory-db");
var attendanceDb = postgres.AddDatabase("attendance-db");
var tallyDb = postgres.AddDatabase("tally-db");

// 2. Messaging Infrastructure (RabbitMQ Container)
var rabbitmq = builder.AddRabbitMQ("messaging")
    .WithLifetime(ContainerLifetime.Session);

// 3. Run Distributed Orchestrator
builder.Build().Run();
