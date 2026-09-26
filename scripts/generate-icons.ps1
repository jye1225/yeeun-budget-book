param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\icons")
)

Add-Type -AssemblyName System.Drawing

function New-BudgetIcon {
  param(
    [int]$Size,
    [string]$FileName
  )

  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  $canvas = [System.Drawing.Rectangle]::new(0, 0, $Size, $Size)
  $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $canvas,
    [System.Drawing.ColorTranslator]::FromHtml("#D8F6FC"),
    [System.Drawing.ColorTranslator]::FromHtml("#B9D8FA"),
    45
  )
  $graphics.FillRectangle($background, $canvas)

  $diameter = [int]($Size * 0.19)
  $gap = [int]($Size * 0.035)
  $groupWidth = ($diameter * 3) + ($gap * 2)
  $startX = [int](($Size - $groupWidth) / 2)
  $startY = [int]($Size * 0.29)
  $colors = @("#7ADAF8", "#55C5F0", "#39ADE5", "#66CFF4", "#43B9EA", "#2D9FD9")

  for ($row = 0; $row -lt 2; $row += 1) {
    for ($column = 0; $column -lt 3; $column += 1) {
      $index = ($row * 3) + $column
      $brush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($colors[$index]))
      $x = $startX + (($diameter + $gap) * $column)
      $y = $startY + (($diameter + $gap) * $row)
      $graphics.FillEllipse($brush, $x, $y, $diameter, $diameter)
      $brush.Dispose()
    }
  }

  $path = Join-Path $OutputDirectory $FileName
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $background.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
New-BudgetIcon -Size 32 -FileName "favicon-32.png"
New-BudgetIcon -Size 180 -FileName "apple-touch-icon.png"
New-BudgetIcon -Size 192 -FileName "icon-192.png"
New-BudgetIcon -Size 512 -FileName "icon-512.png"
