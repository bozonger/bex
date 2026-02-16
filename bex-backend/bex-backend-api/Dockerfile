# STAGE 1: Build (Must use SDK)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy using the hyphenated name
COPY ["Berichtsheft-Editor-X-API.csproj", "./"]
RUN dotnet restore "Berichtsheft-Editor-X-API.csproj"

# Copy the rest of the source code
COPY . .
RUN dotnet publish "Berichtsheft-Editor-X-API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# STAGE 2: Runtime (Uses smaller ASP.NET image)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Ensure the app listens on the port defined in your Program.cs
ENV PORT=9191
EXPOSE 9191

# Copy the build output
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Berichtsheft-Editor-X-API.dll"]