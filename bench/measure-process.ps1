param(
    [Parameter(Mandatory)][string]$Executable,
    [Parameter(Mandatory)][string]$Output,
    [int]$TimeoutSeconds = 180
)
$ErrorActionPreference = 'Stop'
$env:BENCH_OUT = [IO.Path]::GetFullPath($Output)
if (Test-Path -LiteralPath $env:BENCH_OUT) { throw 'Use a fresh result path; refusing stale results.' }
$appProcess = Start-Process -FilePath ([IO.Path]::GetFullPath($Executable)) -PassThru -WindowStyle Hidden
$known = @{}
$known[$appProcess.Id] = $true
$lastCpu = @{}
$samples = [Collections.Generic.List[object]]::new()
$timer = [Diagnostics.Stopwatch]::StartNew()
$previousTime = 0.0
while (-not $appProcess.HasExited) {
    if ($timer.Elapsed.TotalSeconds -gt $TimeoutSeconds) {
        foreach ($processId in $known.Keys) { Stop-Process -Id $processId -ErrorAction SilentlyContinue }
        throw 'Benchmark timed out'
    }
    $snapshot = @(Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId)
    do {
        $added = $false
        foreach ($entry in $snapshot) {
            $id = [int]$entry.ProcessId
            if ($known.ContainsKey([int]$entry.ParentProcessId) -and -not $known.ContainsKey($id)) {
                $known[$id] = $true
                $added = $true
            }
        }
    } while ($added)
    $rss = 0L; $private = 0L; $cpuDelta = 0.0; $count = 0
    foreach ($processId in @($known.Keys)) {
        $p = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($null -eq $p) { continue }
        try {
            $cpu = $p.TotalProcessorTime.TotalSeconds
            $before = if ($lastCpu.ContainsKey($processId)) { $lastCpu[$processId] } else { 0.0 }
            $cpuDelta += [Math]::Max(0, $cpu - $before)
            $lastCpu[$processId] = $cpu
            $rss += $p.WorkingSet64
            $private += $p.PrivateMemorySize64
            $count++
        } catch { continue }
    }
    $now = $timer.Elapsed.TotalSeconds
    if ($count -gt 0) {
        $samples.Add([pscustomobject]@{seconds=$now; intervalSeconds=($now-$previousTime); cpuSeconds=$cpuDelta; cpuPercent=(100*$cpuDelta/[Math]::Max(0.001,$now-$previousTime)); rssBytes=$rss; privateBytes=$private; processCount=$count})
    }
    $previousTime = $now
    Start-Sleep -Milliseconds 200
    $appProcess.Refresh()
}
$appProcess.WaitForExit()
if ($appProcess.ExitCode -ne 0) { throw "Benchmark exited with $($appProcess.ExitCode)" }
if (-not (Test-Path -LiteralPath $env:BENCH_OUT)) { throw 'Benchmark produced no result' }
if ($samples.Count -lt 2) { throw 'Insufficient resource samples' }
$result = Get-Content -LiteralPath $env:BENCH_OUT -Raw | ConvertFrom-Json
$duration = ($samples | Measure-Object intervalSeconds -Sum).Sum
$metrics = [ordered]@{
    scope='Windows process tree; launch to exit; 100% = one logical core'
    averageCpuPercent=(100*($samples | Measure-Object cpuSeconds -Sum).Sum/$duration)
    peakCpuPercent=($samples | Measure-Object cpuPercent -Maximum).Maximum
    averageRssBytes=($samples | Measure-Object rssBytes -Average).Average
    peakRssBytes=($samples | Measure-Object rssBytes -Maximum).Maximum
    peakPrivateBytes=($samples | Measure-Object privateBytes -Maximum).Maximum
    memoryDeltaBytes=($samples[-1].rssBytes-$samples[0].rssBytes)
    peakProcessCount=($samples | Measure-Object processCount -Maximum).Maximum
    sampleCount=$samples.Count
}
$result | Add-Member -NotePropertyName resourceMetrics -NotePropertyValue $metrics -Force
$result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $env:BENCH_OUT
$samples | ConvertTo-Json | Set-Content -LiteralPath ($env:BENCH_OUT + '.samples.json')
$result | ConvertTo-Json -Depth 8
