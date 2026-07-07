import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// We will use powershell but write the script to a ps1 file and run it, avoiding variable expansion issues!
const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('backend.zip')
$entry = $zip.GetEntry('backend/src/models/bookingdriver.js')
[System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, 'backend/src/models/bookingDriver.model.js', $true)
$zip.Dispose()
`;

fs.writeFileSync('temp_extract.ps1', psScript);
try {
  execSync('powershell -ExecutionPolicy Bypass -File temp_extract.ps1');
  console.log('Success extracting bookingdriver.js');
} catch (e) {
  console.error('Error running powershell script:', e.message);
} finally {
  if (fs.existsSync('temp_extract.ps1')) {
    fs.unlinkSync('temp_extract.ps1');
  }
}
