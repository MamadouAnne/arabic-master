import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';

/**
 * Cache directory, resolved on first use rather than at import.
 *
 * `Paths.document` is native-only and throws where it is unavailable. Read at
 * module scope, that exception escapes during import and takes the entire
 * bundle down before anything renders — one unavailable API turning into a
 * blank app. Nothing needs this path until a download is requested.
 */
let cacheDir: string | null = null;
function audioCacheDir(): string {
  if (cacheDir === null) cacheDir = `${Paths.document.uri}quran-audio/`;
  return cacheDir;
}

interface CacheStatus {
  isCached: boolean;
  localPath?: string;
  size?: number;
}

interface DownloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
  progress: number; // 0-100
}

type ProgressCallback = (progress: DownloadProgress) => void;

class AudioCacheService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const dirInfo = await FileSystem.getInfoAsync(audioCacheDir());
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(audioCacheDir(), { intermediates: true });
      }
      this.initialized = true;
    } catch (error) {
      __DEV__ && console.error('Failed to initialize audio cache directory:', error);
    }
  }

  /**
   * Generate local file path for a cached audio file
   */
  private getLocalPath(surahNumber: number, ayahNumber: number, reciterId: string): string {
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    const paddedAyah = ayahNumber.toString().padStart(3, '0');
    return `${audioCacheDir()}${reciterId}/${paddedSurah}${paddedAyah}.mp3`;
  }

  /**
   * Check if an audio file is cached
   */
  async getCacheStatus(
    surahNumber: number,
    ayahNumber: number,
    reciterId: string
  ): Promise<CacheStatus> {
    await this.initialize();

    const localPath = this.getLocalPath(surahNumber, ayahNumber, reciterId);

    try {
      const info = await FileSystem.getInfoAsync(localPath);
      if (info.exists && !info.isDirectory) {
        return {
          isCached: true,
          localPath,
          size: info.size,
        };
      }
    } catch (error) {
      // File doesn't exist
    }

    return { isCached: false };
  }

  /**
   * Get audio URL - returns local path if cached, or original URL
   */
  async getAudioUrl(
    remoteUrl: string,
    surahNumber: number,
    ayahNumber: number,
    reciterId: string
  ): Promise<string> {
    const status = await this.getCacheStatus(surahNumber, ayahNumber, reciterId);

    if (status.isCached && status.localPath) {
      return status.localPath;
    }

    return remoteUrl;
  }

  /**
   * Download and cache a single audio file
   */
  async cacheAudio(
    remoteUrl: string,
    surahNumber: number,
    ayahNumber: number,
    reciterId: string,
    onProgress?: ProgressCallback
  ): Promise<string> {
    await this.initialize();

    const localPath = this.getLocalPath(surahNumber, ayahNumber, reciterId);

    // Ensure reciter directory exists
    const reciterDir = `${audioCacheDir()}${reciterId}/`;
    const dirInfo = await FileSystem.getInfoAsync(reciterDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(reciterDir, { intermediates: true });
    }

    // Download the file
    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUrl,
      localPath,
      {},
      (downloadProgress) => {
        if (onProgress) {
          const progress = Math.round(
            (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100
          );
          onProgress({
            totalBytesWritten: downloadProgress.totalBytesWritten,
            totalBytesExpectedToWrite: downloadProgress.totalBytesExpectedToWrite,
            progress,
          });
        }
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        return result.uri;
      }
      throw new Error('Download failed - no URI returned');
    } catch (error) {
      // Clean up failed download
      try {
        await FileSystem.deleteAsync(localPath, { idempotent: true });
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Download all ayahs for a surah
   */
  async cacheSurah(
    surahNumber: number,
    totalAyahs: number,
    reciterId: string,
    getAudioUrl: (surah: number, ayah: number) => string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (let ayah = 1; ayah <= totalAyahs; ayah++) {
      const status = await this.getCacheStatus(surahNumber, ayah, reciterId);

      if (!status.isCached) {
        const url = getAudioUrl(surahNumber, ayah);
        try {
          await this.cacheAudio(url, surahNumber, ayah, reciterId);
          success++;
        } catch {
          failed++;
        }
      } else {
        success++;
      }

      if (onProgress) {
        onProgress(ayah, totalAyahs);
      }
    }

    return { success, failed };
  }

  /**
   * Check how many ayahs of a surah are cached
   */
  async getSurahCacheStatus(
    surahNumber: number,
    totalAyahs: number,
    reciterId: string
  ): Promise<{ cached: number; total: number; percent: number }> {
    let cached = 0;

    for (let ayah = 1; ayah <= totalAyahs; ayah++) {
      const status = await this.getCacheStatus(surahNumber, ayah, reciterId);
      if (status.isCached) {
        cached++;
      }
    }

    return {
      cached,
      total: totalAyahs,
      percent: Math.round((cached / totalAyahs) * 100),
    };
  }

  /**
   * Delete cached audio for a surah
   */
  async deleteSurahCache(surahNumber: number, reciterId: string): Promise<void> {
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    const reciterDir = `${audioCacheDir()}${reciterId}/`;

    try {
      const dirInfo = await FileSystem.getInfoAsync(reciterDir);
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(reciterDir);
        for (const file of files) {
          if (file.startsWith(paddedSurah)) {
            await FileSystem.deleteAsync(`${reciterDir}${file}`, { idempotent: true });
          }
        }
      }
    } catch (error) {
      __DEV__ && console.error('Failed to delete surah cache:', error);
    }
  }

  /**
   * Clear all cached audio
   */
  async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(audioCacheDir(), { idempotent: true });
      await FileSystem.makeDirectoryAsync(audioCacheDir(), { intermediates: true });
    } catch (error) {
      __DEV__ && console.error('Failed to clear audio cache:', error);
    }
  }

  /**
   * Get total cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(audioCacheDir());
      if (!dirInfo.exists) return 0;

      // Recursively calculate size
      let totalSize = 0;
      const reciterDirs = await FileSystem.readDirectoryAsync(audioCacheDir());

      for (const reciter of reciterDirs) {
        const reciterPath = `${audioCacheDir()}${reciter}/`;
        const files = await FileSystem.readDirectoryAsync(reciterPath);

        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(`${reciterPath}${file}`);
          if (fileInfo.exists && !fileInfo.isDirectory && fileInfo.size) {
            totalSize += fileInfo.size;
          }
        }
      }

      return totalSize;
    } catch {
      return 0;
    }
  }

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

export const audioCacheService = new AudioCacheService();
