Start-Sleep -Seconds 180
$site = 'https://swastiksingh-dev.github.io/Sunil-Bhaiya-PrepTrack'
foreach ($u in @(($site + '/'), ($site + '/app/dashboard/'), ($site + '/manifest.webmanifest'))) {
  try {
    $t = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 30
    Write-Output ('HIT ' + [int]$t.StatusCode + ' len=' + $t.RawContentLength + ' :: ' + $u)
  } catch { Write-Output ('MISS ' + $_.Exception.Message + ' :: ' + $u) }
}
