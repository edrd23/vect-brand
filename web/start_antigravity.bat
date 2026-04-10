@echo off
set "exe_found="
for %%p in ("%LOCALAPPDATA%\Programs\Antigravity\Antigravity.exe" "%ProgramFiles%\Antigravity\Antigravity.exe" "%ProgramFiles(x86)%\Antigravity\Antigravity.exe") do (
    if exist %%p (
        set "exe_found=%%~p"
        goto :start
    )
)

echo Antigravity executable not found
exit /b 1

:start
echo Starting Antigravity from %exe_found%...
start "" "%exe_found%" --remote-debugging-port=9000
exit /b 0
