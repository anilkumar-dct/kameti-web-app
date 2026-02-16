import { Injectable, StreamableFile, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class DownloadsService {
  getAppFile(): StreamableFile | null {
    // Assuming the file is named 'kameti-setup.exe' inside the 'downloads' folder in project root
    const filePath = join(process.cwd(), 'downloads', 'Kameti Management Setup 2.0.1.exe');
    
    if (!existsSync(filePath)) {
        return null; 
    }

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }
}
