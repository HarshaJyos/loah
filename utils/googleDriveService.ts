import debounce from 'lodash.debounce';

const CLIENT_ID = "677644907778-kvch3brqbu9f5tf2uqvg1jvakjm32s40.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

export interface GoogleDriveFile {
  id: string;
  name: string;
}

export class GoogleDriveService {
  private accessToken: string | null = null;
  private fileIdMap: Record<string, string> = {};

  setToken(token: string) {
    this.accessToken = token;
  }

  hasToken(): boolean {
    return !!this.accessToken;
  }

  async findFile(name: string): Promise<string | null> {
    if (!this.accessToken) return null;
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${name}' and 'appDataFolder' in parents&spaces=appDataFolder`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );
    
    const data = await response.json();
    if (data.files && data.files.length > 0) {
      this.fileIdMap[name] = data.files[0].id;
      return data.files[0].id;
    }
    return null;
  }

  async downloadFile<T>(name: string): Promise<T | null> {
    const fileId = this.fileIdMap[name] || await this.findFile(name);
    if (!fileId || !this.accessToken) return null;

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  }

  async uploadFile(name: string, content: any): Promise<void> {
    if (!this.accessToken) return;

    const fileId = this.fileIdMap[name] || await this.findFile(name);
    const metadata = {
      name: name,
      parents: ["appDataFolder"]
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append(
      "file",
      new Blob([JSON.stringify(content)], { type: "application/json" })
    );

    const url = fileId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

    const method = fileId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { Authorization: `Bearer ${this.accessToken}` },
      body: form
    });

    if (response.ok) {
      const data = await response.json();
      this.fileIdMap[name] = data.id;
    }
  }

  // Debounced sync for specific modules
  syncTasks = debounce((tasks: any[]) => this.uploadFile("tasks.json", tasks), 5000);
  syncHabits = debounce((habits: any[]) => this.uploadFile("habits.json", habits), 5000);
  syncProjects = debounce((projects: any[]) => this.uploadFile("projects.json", projects), 5000);
  syncDumps = debounce((dumps: any[]) => this.uploadFile("dumps.json", dumps), 5000);
  syncSettings = debounce((settings: any[]) => this.uploadFile("settings.json", settings), 5000);
  syncNotes = debounce((notes: any[]) => this.uploadFile("notes.json", notes), 5000);
  syncJournal = debounce((journal: any[]) => this.uploadFile("journal.json", journal), 5000);
}

export const driveService = new GoogleDriveService();
