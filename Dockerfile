FROM node:20-bookworm-slim AS frontend-build
WORKDIR /src/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

COPY backend/ ./backend/
COPY --from=frontend-build /src/frontend/dist/frontend/ ./backend/wwwroot/

WORKDIR /src/backend
RUN dotnet publish IT505.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=backend-build /app/publish ./

ENTRYPOINT ["dotnet", "IT505.Api.dll"]