FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Berichtsheft-Editor-X-API.csproj", "./"]
RUN dotnet restore "Berichtsheft-Editor-X-API.csproj"

COPY . .
RUN dotnet publish "Berichtsheft-Editor-X-API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV PORT=9191
EXPOSE 9191

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Berichtsheft-Editor-X-API.dll"]