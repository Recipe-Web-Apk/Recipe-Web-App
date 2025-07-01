# Create .env file with proper environment variables
$envContent = @"
# Supabase Configuration
SUPABASE_URL=https://asbuckytummmrnikguoi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzYnVja3l0dW1tbXJuaWtndW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDY0MTcsImV4cCI6MjA2Njg4MjQxN30.I56VHXTl5ze5e6fdMsEc-kba_yWr7tTZKdhp4xYfYzs

# Spoonacular API
SPOONACULAR_API_KEY=f2eb2d53766b45708b890bd5df4b6d36

# Server Configuration
PORT=5000
NODE_ENV=development
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host ".env file created successfully!" 