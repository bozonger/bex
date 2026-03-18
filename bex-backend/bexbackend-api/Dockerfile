FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["bexbackend-api.csproj", "./"]
RUN dotnet restore "bexbackend-api.csproj"

COPY . .
RUN dotnet publish "bexbackend-api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV PORT=9191
EXPOSE 9191

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "bexbackend-api.dll"]