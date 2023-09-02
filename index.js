const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const http = require('http');
const https = require('https');
const EventEmitter = require('events');

class FileDownloader extends EventEmitter {
  constructor(fileUrl, destPath) {
    super();
    this.fileUrl = fileUrl;
    this.destPath = path.join(destPath);
    this.totalBytes = 0;
    this.downloadedBytes = 0;
  }

  async download() {
    try {
      const url = new URL(this.fileUrl);
      const protocol = url.protocol === 'https:' ? https : http;

      const response = await new Promise((resolve, reject) => {
        protocol.get(this.fileUrl, resolve).on('error', reject);
      });

      if (response.statusCode !== 200) {
        this.emit('error', `Failed to download: HTTP ${response.statusCode}`);
        return;
      }

      this.totalBytes = parseInt(response.headers['content-length'], 10) || 0;
      let progress = 0; // Variable para almacenar el progreso actual

      const fileStream = fs.createWriteStream(this.destPath);

      response.on('data', (chunk) => {
        this.downloadedBytes += chunk.length;
        fileStream.write(chunk);
        
        // Asegurarse de que el progreso no supere el 100%
        progress = Math.min((this.downloadedBytes / this.totalBytes) * 100, 100);
        
        this.emit('downloading', progress);
      });

      response.on('end', () => {
        fileStream.end();
        this.emit('end', this.destPath);
      });

      response.on('error', (err) => {
        this.emit('error', `Download error: ${err.message}`);
      });
    } catch (error) {
      this.emit('error', `Download error: ${error.message}`);
    }
  }

  getProgress() {
    return (this.downloadedBytes / this.totalBytes) * 100;
  }
}

module.exports = FileDownloader;