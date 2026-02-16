export interface DownloadLink {
  link: string;
  pwd: string;
  desc?: string;
}

export interface VersionInfo {
  name: string;
  date?: number;
  code: number;
  logs: string;
  links: DownloadLink[];
}