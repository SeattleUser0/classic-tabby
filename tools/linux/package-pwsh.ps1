# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
<#
tools/linux/package-pwsh.ps1 — drive the ORIGINAL sdk/Package.cs through PowerShell Add-Type

Purpose
    Equivalence oracle for tools/linux/package.py. Build.ps1 (L245-L246) loads
    sdk/Package.cs with Add-Type and calls [FM1.Package]::Create(image, pack dir, output,
    user bytes, product). This script does exactly that on Linux pwsh so the same raw app
    image can be packaged by the C# original and by the Python port, and the two .fwsc
    files compared byte for byte (Makefile target: package-equivalence).

    Nothing here touches device flash.

Version: 0.1

Revision log
    v0.1  2026-11-01  Initial version.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Image,      # raw app image: .text+.data+.ram0_data+.cache_ram_data
    [Parameter(Mandatory)][string]$Resources,  # sdk/tools/pack
    [Parameter(Mandatory)][string]$Output,     # .fwsc to write
    [Parameter(Mandatory)][string]$Product,    # e.g. "SMK-37 Pro_8000001"
    [int]$UserBytes = 536576,
    [string]$Report                            # optional: layout dictionary as JSON
)
$ErrorActionPreference = 'Stop'
$sdk = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../sdk'))
Add-Type -Path (Join-Path $sdk 'Package.cs')
$bytes = [IO.File]::ReadAllBytes($Image)
$layout = [FM1.Package]::Create($bytes, $Resources, $Output, $UserBytes, $Product)
if ($Report) {
    [IO.File]::WriteAllText($Report, ($layout | ConvertTo-Json), (New-Object Text.UTF8Encoding $false))
}
Write-Host ("Packaged " + $Output + " (" + (Get-Item -LiteralPath $Output).Length + " bytes)")
