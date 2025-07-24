export interface DownloadLink {
  link: string;
  pwd: string;
}

export interface VersionInfo {
  name: string;
  code: number;
  logs: string;
  links: DownloadLink[];
}