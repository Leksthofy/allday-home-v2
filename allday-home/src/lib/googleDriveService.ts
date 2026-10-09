export interface GoogleDriveFolder {
  id: string;
  name: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  createdTime?: string;
  description?: string;
  size?: string;
  blobUrl?: string;
}

// In-memory cache for downloaded blob URLs
const blobUrlCache = new Map<string, string>();

export const DEFAULT_DRIVE_FOLDER_ID = "1IVdMeU_xU5pQGOI_ShnL2bi05_8DpDTx";
export const DEFAULT_DRIVE_FOLDER_NAME = "Proteção de Tela";
export const DEFAULT_DRIVE_FOLDER_URL =
  "https://drive.google.com/drive/folders/1IVdMeU_xU5pQGOI_ShnL2bi05_8DpDTx?usp=sharing";

export const googleDriveService = {
  DEFAULT_FOLDER_ID: DEFAULT_DRIVE_FOLDER_ID,
  DEFAULT_FOLDER_NAME: DEFAULT_DRIVE_FOLDER_NAME,
  DEFAULT_FOLDER_URL: DEFAULT_DRIVE_FOLDER_URL,

  /**
   * Get folder info directly by ID
   */
  async getFolderById(
    token: string,
    folderId: string = DEFAULT_DRIVE_FOLDER_ID
  ): Promise<GoogleDriveFolder> {
    try {
      const url = `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return {
          id: folderId,
          name: DEFAULT_DRIVE_FOLDER_NAME,
        };
      }

      const data = await response.json();
      return {
        id: data.id || folderId,
        name: data.name || DEFAULT_DRIVE_FOLDER_NAME,
      };
    } catch (err) {
      return {
        id: folderId,
        name: DEFAULT_DRIVE_FOLDER_NAME,
      };
    }
  },

  /**
   * Search for a folder in Google Drive by name (e.g. "Proteção de Tela")
   */
  async findFolderByName(
    token: string,
    folderName: string = "Proteção de Tela"
  ): Promise<GoogleDriveFolder | null> {
    // If searching for the default folder, first check if default folder ID is valid
    if (
      folderName.toLowerCase() === DEFAULT_DRIVE_FOLDER_NAME.toLowerCase() ||
      folderName.toLowerCase().includes("proteção") ||
      folderName.toLowerCase().includes("protecao")
    ) {
      const directFolder = await this.getFolderById(
        token,
        DEFAULT_DRIVE_FOLDER_ID
      );
      if (directFolder) return directFolder;
    }

    try {
      const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        q
      )}&fields=files(id, name)&pageSize=5`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar pasta no Drive: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.files && data.files.length > 0) {
        return {
          id: data.files[0].id,
          name: data.files[0].name,
        };
      }

      return null;
    } catch (err) {
      console.error("Erro ao pesquisar pasta no Google Drive:", err);
      throw err;
    }
  },

  /**
   * List folders in user's Drive so they can pick their photo folder if needed
   */
  async listUserFolders(token: string): Promise<GoogleDriveFolder[]> {
    try {
      const q = `mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        q
      )}&fields=files(id, name)&pageSize=30&orderBy=name`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao listar pastas: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
      }));
    } catch (err) {
      console.error("Erro ao listar pastas do Google Drive:", err);
      return [];
    }
  },

  /**
   * Fetch all images inside the specified folder
   */
  async listPhotosInFolder(
    token: string,
    folderId: string
  ): Promise<GoogleDriveFile[]> {
    try {
      const q = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        q
      )}&fields=files(id, name, mimeType, thumbnailLink, createdTime, description, size)&pageSize=100&orderBy=createdTime desc`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar imagens na pasta: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (err) {
      console.error("Erro ao buscar fotos da pasta do Google Drive:", err);
      throw err;
    }
  },

  /**
   * Fetch an image binary using the OAuth token and create an object URL
   * This guarantees full resolution and works for private Drive files without CORS blocks
   */
  async getImageBlobUrl(token: string, fileId: string): Promise<string> {
    if (blobUrlCache.has(fileId)) {
      return blobUrlCache.get(fileId)!;
    }

    try {
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Falha ao baixar imagem: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      blobUrlCache.set(fileId, objectUrl);
      return objectUrl;
    } catch (err) {
      console.error(`Erro ao carregar mídia para fileId ${fileId}:`, err);
      throw err;
    }
  },

  /**
   * Pre-load high-resolution URLs for a list of Drive files
   */
  async preloadPhotoUrls(
    token: string,
    files: GoogleDriveFile[]
  ): Promise<{ id: string; title: string; url: string; caption?: string }[]> {
    const results: { id: string; title: string; url: string; caption?: string }[] = [];

    for (const file of files) {
      try {
        let photoUrl = "";
        try {
          photoUrl = await this.getImageBlobUrl(token, file.id);
        } catch (e) {
          // Fallback to high-res thumbnail if direct media fails
          if (file.thumbnailLink) {
            photoUrl = file.thumbnailLink.replace(/=s\d+/, "=s1600");
          }
        }

        if (photoUrl) {
          results.push({
            id: `gdrive_${file.id}`,
            title: file.name.replace(/\.[^/.]+$/, ""),
            url: photoUrl,
            caption: file.description || "Google Drive • Proteção de Tela",
          });
        }
      } catch (err) {
        console.warn(`Não foi possível carregar foto ${file.name}:`, err);
      }
    }

    return results;
  },

  /**
   * Clean up cached object URLs on logout
   */
  clearCache() {
    blobUrlCache.forEach((url) => URL.revokeObjectURL(url));
    blobUrlCache.clear();
  },
};
